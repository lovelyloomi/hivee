-- Add new fields to profiles table for complete profile setup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS programs TEXT[],
ADD COLUMN IF NOT EXISTS watermark_url TEXT,
ADD COLUMN IF NOT EXISTS watermark_text TEXT,
ADD COLUMN IF NOT EXISTS work_images TEXT[],
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Create storage bucket for work images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-images', 'work-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for watermarks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('watermarks', 'watermarks', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for work-images bucket
CREATE POLICY "Users can view all work images"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-images');

CREATE POLICY "Users can upload their own work images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'work-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own work images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'work-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own work images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'work-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for watermarks bucket
CREATE POLICY "Users can view all watermarks"
ON storage.objects FOR SELECT
USING (bucket_id = 'watermarks');

CREATE POLICY "Users can upload their own watermark"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'watermarks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own watermark"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'watermarks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own watermark"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'watermarks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);