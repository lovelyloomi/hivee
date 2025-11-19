-- Add social media and professional information fields to profiles table

-- Social media links
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS behance_url TEXT,
ADD COLUMN IF NOT EXISTS artstation_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS other_portfolio_url TEXT;

-- Professional information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS artist_specialization TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'open_to_opportunities',
ADD COLUMN IF NOT EXISTS preferred_work_types TEXT[];

-- Add check constraints for availability status
ALTER TABLE public.profiles
ADD CONSTRAINT check_availability_status 
CHECK (availability_status IN ('open_to_opportunities', 'not_available', 'available_for_freelance', 'full_time_only'));

-- Add check constraints for education level
ALTER TABLE public.profiles
ADD CONSTRAINT check_education_level 
CHECK (education_level IN ('self_taught', 'high_school', 'associate', 'bachelor', 'master', 'doctorate', 'bootcamp', 'online_courses'));

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.instagram_url IS 'User Instagram profile URL';
COMMENT ON COLUMN public.profiles.behance_url IS 'User Behance portfolio URL';
COMMENT ON COLUMN public.profiles.artstation_url IS 'User ArtStation portfolio URL';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.twitter_url IS 'User Twitter/X profile URL';
COMMENT ON COLUMN public.profiles.website_url IS 'User personal website URL';
COMMENT ON COLUMN public.profiles.artist_specialization IS 'Primary artistic specialization';
COMMENT ON COLUMN public.profiles.education_level IS 'Highest level of education completed';
COMMENT ON COLUMN public.profiles.languages IS 'Languages spoken by the user';
COMMENT ON COLUMN public.profiles.years_of_experience IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.availability_status IS 'Current availability for work';
COMMENT ON COLUMN public.profiles.preferred_work_types IS 'Types of work the user prefers';