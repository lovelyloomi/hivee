-- Create chat-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true);

-- Add media columns to messages table
ALTER TABLE messages
ADD COLUMN media_url text,
ADD COLUMN media_type text;

-- Create profile_views table
CREATE TABLE profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(viewer_id, viewed_profile_id, viewed_at)
);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile views"
ON profile_views FOR SELECT
USING (auth.uid() = viewed_profile_id);

CREATE POLICY "Anyone can create profile views"
ON profile_views FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Create work_views table
CREATE TABLE work_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  work_id uuid REFERENCES works(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone DEFAULT now()
);

ALTER TABLE work_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work owners can view their work views"
ON work_views FOR SELECT
USING (work_id IN (SELECT id FROM works WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create work views"
ON work_views FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Create reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
ON reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Add profile_visibility to profiles
ALTER TABLE profiles
ADD COLUMN profile_visibility text DEFAULT 'public',
ADD COLUMN show_location boolean DEFAULT true,
ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_on_match boolean DEFAULT true,
  email_on_message boolean DEFAULT true,
  email_on_opportunity boolean DEFAULT true,
  email_on_comment boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
ON notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Storage policies for chat-media bucket
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own chat media"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);