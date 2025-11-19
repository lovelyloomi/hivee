import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// TEMPORARY: Bypass CAPTCHA until Cloudflare Turnstile keys are configured
// Set to false and add TURNSTILE_SECRET_KEY when deploying to production
const BYPASS_CAPTCHA = true;

export const useCaptcha = () => {
  const [verifying, setVerifying] = useState(false);

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    // Temporary bypass for development/testing
    if (BYPASS_CAPTCHA) {
      console.log('⚠️ CAPTCHA bypassed - remember to configure Cloudflare Turnstile keys before production');
      return true;
    }

    // Original verification code (will be used when BYPASS_CAPTCHA = false)
    if (!token) return false;

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token }
      });

      if (error) {
        console.error('CAPTCHA verification error:', error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('CAPTCHA verification exception:', error);
      return false;
    } finally {
      setVerifying(false);
    }
  };

  return { verifyCaptcha, verifying, isBypassed: BYPASS_CAPTCHA };
};
