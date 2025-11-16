-- Create account type enum
CREATE TYPE account_type AS ENUM (
  'freelance_artist',
  'commission_artist', 
  'art_student',
  'studio_agency',
  'gallery_curator',
  'art_collector'
);

-- Add account_type column to profiles
ALTER TABLE profiles 
ADD COLUMN account_type account_type;

-- Add index for filtering
CREATE INDEX idx_profiles_account_type ON profiles(account_type);