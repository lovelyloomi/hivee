-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  portfolio_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_type TEXT NOT NULL,
  description TEXT NOT NULL,
  payment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Everyone can view opportunities
CREATE POLICY "Everyone can view opportunities"
  ON public.opportunities FOR SELECT
  USING (true);

-- Authenticated users can create opportunities
CREATE POLICY "Authenticated users can create opportunities"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Users can update their own opportunities
CREATE POLICY "Users can update their own opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = creator_id);

-- Users can delete their own opportunities
CREATE POLICY "Users can delete their own opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = creator_id);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_url TEXT,
  cv_url TEXT,
  motivation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, applicant_id)
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own applications
CREATE POLICY "Applicants can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Opportunity creators can view applications to their opportunities
CREATE POLICY "Opportunity creators can view applications"
  ON public.applications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT creator_id FROM public.opportunities WHERE id = opportunity_id
    )
  );

-- Authenticated users can create applications
CREATE POLICY "Authenticated users can create applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  favorited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, favorited_user_id),
  CHECK (user_id != favorited_user_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create favorites
CREATE POLICY "Users can create favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for CVs and portfolios
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false);

-- Storage policies for applications bucket
CREATE POLICY "Users can upload their own application files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'applications' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own application files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applications' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Opportunity creators can view application files
CREATE POLICY "Opportunity creators can view applicant files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applications' AND
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.opportunities o ON a.opportunity_id = o.id
      WHERE o.creator_id = auth.uid()
      AND (storage.foldername(name))[1] = a.applicant_id::text
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();