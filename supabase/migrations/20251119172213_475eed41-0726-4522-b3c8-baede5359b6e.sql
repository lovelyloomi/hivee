-- Add username and display name preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS display_name_preference text DEFAULT 'real_name' CHECK (display_name_preference IN ('real_name', 'username'));

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username follows specific rules (alphanumeric, underscore, 3-20 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]{3,20}$');

-- Update profile_completed logic to include username requirement
COMMENT ON COLUMN public.profiles.username IS 'Unique username for the user, required for profile completion';
COMMENT ON COLUMN public.profiles.display_name_preference IS 'User preference for displaying name: real_name or username';