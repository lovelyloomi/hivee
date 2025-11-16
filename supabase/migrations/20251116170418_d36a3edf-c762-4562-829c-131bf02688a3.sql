-- Add NSFW flag to works table
ALTER TABLE works
ADD COLUMN nsfw boolean NOT NULL DEFAULT false;

-- Add birth_date to profiles table for age verification
ALTER TABLE profiles
ADD COLUMN birth_date date;

-- Add index for birthday notifications
CREATE INDEX idx_profiles_birth_date ON profiles(birth_date);

-- Create function to check if user is 18+
CREATE OR REPLACE FUNCTION is_user_adult(user_birth_date date)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN user_birth_date IS NOT NULL AND 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, user_birth_date)) >= 18;
END;
$$;