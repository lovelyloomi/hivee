import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  message?: string;
  blockedUntil?: string;
  remainingAttempts?: number;
}

export const useRateLimit = () => {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkRateLimit = async (action: string): Promise<RateLimitResult> => {
    setChecking(true);

    try {
      // Create identifier (user ID if logged in, otherwise will need IP - handled by edge function)
      const identifier = user ? `user_${user.id}` : `anonymous_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('check-rate-limit', {
        body: { identifier, action }
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the action (fail open)
        return { allowed: true };
      }

      return data as RateLimitResult;
    } catch (error) {
      console.error('Rate limit exception:', error);
      // On exception, allow the action (fail open)
      return { allowed: true };
    } finally {
      setChecking(false);
    }
  };

  return { checkRateLimit, checking };
};
