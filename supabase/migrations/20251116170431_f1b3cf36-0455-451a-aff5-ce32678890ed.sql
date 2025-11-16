-- Fix search_path for is_user_adult function
DROP FUNCTION IF EXISTS is_user_adult(date);

CREATE OR REPLACE FUNCTION is_user_adult(user_birth_date date)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN user_birth_date IS NOT NULL AND 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, user_birth_date)) >= 18;
END;
$$;