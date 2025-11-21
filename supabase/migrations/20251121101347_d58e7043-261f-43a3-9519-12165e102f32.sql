-- Add screenshot_url and is_downloadable columns to works table
ALTER TABLE works ADD COLUMN screenshot_url TEXT;
ALTER TABLE works ADD COLUMN is_downloadable BOOLEAN DEFAULT true;

-- Add watermark settings to profiles table
ALTER TABLE profiles ADD COLUMN watermark_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN watermark_style TEXT DEFAULT 'center'; -- 'center', 'repeat', or 'disabled'
ALTER TABLE profiles ADD COLUMN watermark_sections TEXT[] DEFAULT ARRAY['profile', 'works', 'gallery']; -- sections where watermark is enabled