import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  'signup': { maxAttempts: 5, windowMinutes: 60, blockMinutes: 60 },
  'login': { maxAttempts: 10, windowMinutes: 15, blockMinutes: 30 },
  'report': { maxAttempts: 20, windowMinutes: 60, blockMinutes: 30 },
  'message': { maxAttempts: 100, windowMinutes: 60, blockMinutes: 15 },
  'upload': { maxAttempts: 50, windowMinutes: 60, blockMinutes: 30 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { identifier, action } = await req.json();

    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing identifier or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = rateLimitConfigs[action] || { maxAttempts: 50, windowMinutes: 60, blockMinutes: 30 };

    // Check existing rate limit
    const { data: existingLimit, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching rate limit:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();

    // Check if currently blocked
    if (existingLimit?.blocked_until && new Date(existingLimit.blocked_until) > now) {
      const blockedUntil = new Date(existingLimit.blocked_until);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'rate_limited',
          blockedUntil: blockedUntil.toISOString(),
          message: `Too many attempts. Please try again after ${blockedUntil.toLocaleTimeString()}.`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingLimit) {
      const firstAttempt = new Date(existingLimit.first_attempt_at);
      const windowExpired = (now.getTime() - firstAttempt.getTime()) > (config.windowMinutes * 60 * 1000);

      if (windowExpired) {
        // Reset counter - window expired
        await supabase
          .from('rate_limits')
          .update({
            attempt_count: 1,
            first_attempt_at: now.toISOString(),
            last_attempt_at: now.toISOString(),
            blocked_until: null,
          })
          .eq('id', existingLimit.id);

        return new Response(
          JSON.stringify({ allowed: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment attempt count
      const newAttemptCount = existingLimit.attempt_count + 1;
      
      if (newAttemptCount > config.maxAttempts) {
        // Block user
        const blockedUntil = new Date(now.getTime() + config.blockMinutes * 60 * 1000);
        
        await supabase
          .from('rate_limits')
          .update({
            attempt_count: newAttemptCount,
            last_attempt_at: now.toISOString(),
            blocked_until: blockedUntil.toISOString(),
          })
          .eq('id', existingLimit.id);

        // Log suspicious activity
        await supabase
          .from('suspicious_activity')
          .insert({
            user_id: identifier.startsWith('user_') ? identifier.replace('user_', '') : null,
            activity_type: 'rate_limit_exceeded',
            details: { action, attemptCount: newAttemptCount },
          });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            reason: 'rate_limited',
            blockedUntil: blockedUntil.toISOString(),
            message: `Too many attempts. Blocked until ${blockedUntil.toLocaleTimeString()}.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update attempt count
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: newAttemptCount,
          last_attempt_at: now.toISOString(),
        })
        .eq('id', existingLimit.id);

      return new Response(
        JSON.stringify({ 
          allowed: true,
          remainingAttempts: config.maxAttempts - newAttemptCount 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First attempt - create new record
    await supabase
      .from('rate_limits')
      .insert({
        identifier,
        action,
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        allowed: true,
        remainingAttempts: config.maxAttempts - 1 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
