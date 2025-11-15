-- Create opportunity_favorites table
CREATE TABLE public.opportunity_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- Enable Row Level Security
ALTER TABLE public.opportunity_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own opportunity favorites" 
ON public.opportunity_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opportunity favorites" 
ON public.opportunity_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunity favorites" 
ON public.opportunity_favorites 
FOR DELETE 
USING (auth.uid() = user_id);