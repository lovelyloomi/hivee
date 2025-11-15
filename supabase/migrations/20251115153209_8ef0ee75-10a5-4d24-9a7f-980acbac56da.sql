-- Create enum for work file types
CREATE TYPE public.work_file_type AS ENUM ('image', 'pdf', 'video', 'model_3d');

-- Create works table
CREATE TABLE public.works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type work_file_type NOT NULL,
  watermark_url TEXT,
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_comments table
CREATE TABLE public.work_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_likes table
CREATE TABLE public.work_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(work_id, user_id)
);

-- Create work_favorites table
CREATE TABLE public.work_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(work_id, user_id)
);

-- Enable RLS
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for works
CREATE POLICY "Everyone can view works"
  ON public.works FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own works"
  ON public.works FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own works"
  ON public.works FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own works"
  ON public.works FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for work_comments
CREATE POLICY "Everyone can view comments"
  ON public.work_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.work_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.work_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.work_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for work_likes
CREATE POLICY "Everyone can view likes"
  ON public.work_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON public.work_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.work_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for work_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.work_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON public.work_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.work_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for works
INSERT INTO storage.buckets (id, name, public)
VALUES ('works', 'works', true);

-- Storage policies for works bucket
CREATE POLICY "Anyone can view works"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'works');

CREATE POLICY "Authenticated users can upload works"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'works' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own works"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'works' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own works"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'works' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Triggers for updated_at
CREATE TRIGGER update_works_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.works;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_favorites;