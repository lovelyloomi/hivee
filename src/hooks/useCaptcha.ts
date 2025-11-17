import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCaptcha = () => {
  const [verifying, setVerifying] = useState(false);

  const verifyCaptcha = async (token: string): Promise<boolean> => {
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

  return { verifyCaptcha, verifying };
};
