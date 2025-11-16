import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEmailVerified = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsVerified(!!user?.email_confirmed_at);
      } catch (error) {
        console.error("Error checking email verification:", error);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, []);

  return { isVerified, loading };
};
