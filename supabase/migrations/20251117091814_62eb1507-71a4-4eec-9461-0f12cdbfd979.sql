-- Add location_precision column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_precision text 
CHECK (location_precision IN ('high_privacy', 'balanced', 'precise')) 
DEFAULT 'balanced';

-- Add comment explaining the precision levels
COMMENT ON COLUMN public.profiles.location_precision IS 
'Location precision level: high_privacy (±2km), balanced (±1km), precise (±500m)';

-- Update existing rows to have default precision
UPDATE public.profiles 
SET location_precision = 'balanced' 
WHERE location_precision IS NULL;