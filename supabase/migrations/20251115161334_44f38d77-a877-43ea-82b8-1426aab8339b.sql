-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own blocks" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blocks" 
ON public.blocked_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.blocked_users 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.blocked_users
ADD CONSTRAINT blocked_users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.blocked_users
ADD CONSTRAINT blocked_users_blocked_user_id_fkey 
FOREIGN KEY (blocked_user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Add expires_at column to opportunities for expiration notifications
ALTER TABLE public.opportunities
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for expired opportunities query
CREATE INDEX idx_opportunities_expires_at 
ON public.opportunities(expires_at) 
WHERE expires_at IS NOT NULL;