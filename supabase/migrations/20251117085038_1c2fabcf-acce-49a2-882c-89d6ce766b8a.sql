-- ============================================
-- PHASE 1: ADMIN ROLE SYSTEM
-- ============================================

-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role assignments
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 2: SECURITY TABLES
-- ============================================

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- user_id, IP address, or combination
  action TEXT NOT NULL, -- 'signup', 'login', 'report', 'message', etc.
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE (identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for efficient rate limit lookups
CREATE INDEX idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);

-- Suspicious activity tracking
CREATE TABLE public.suspicious_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  activity_type TEXT NOT NULL, -- 'bot_behavior', 'honeypot_filled', 'rate_limit_exceeded', etc.
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.suspicious_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view suspicious activity"
  ON public.suspicious_activity
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_suspicious_activity_user ON public.suspicious_activity(user_id);
CREATE INDEX idx_suspicious_activity_created ON public.suspicious_activity(created_at DESC);

-- Audit logs for security events
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user_banned', 'content_deleted', 'role_assigned', etc.
  target_type TEXT, -- 'user', 'work', 'comment', etc.
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Privacy settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  disable_view_tracking BOOLEAN DEFAULT false,
  anonymous_browsing BOOLEAN DEFAULT false,
  who_can_see_profile TEXT DEFAULT 'everyone', -- 'everyone', 'matches_only', 'nobody'
  who_can_message TEXT DEFAULT 'everyone', -- 'everyone', 'matches_only'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own privacy settings"
  ON public.privacy_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
  ON public.privacy_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PHASE 3: FIX EXISTING FUNCTION SEARCH PATHS
-- ============================================

-- Fix is_user_adult function
CREATE OR REPLACE FUNCTION public.is_user_adult(user_birth_date date)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN user_birth_date IS NOT NULL AND 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, user_birth_date)) >= 18;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fix calculate_match_score function
CREATE OR REPLACE FUNCTION public.calculate_match_score(user1 uuid, user2 uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
  shared_skills INTEGER;
  shared_programs INTEGER;
  distance_km DOUBLE PRECISION;
  p1 RECORD;
  p2 RECORD;
BEGIN
  SELECT * INTO p1 FROM public.profiles WHERE id = user1;
  SELECT * INTO p2 FROM public.profiles WHERE id = user2;
  
  IF p1 IS NULL OR p2 IS NULL THEN
    RETURN 0;
  END IF;
  
  IF p1.skills IS NOT NULL AND p2.skills IS NOT NULL THEN
    SELECT COUNT(DISTINCT skill) INTO shared_skills
    FROM (
      SELECT unnest(p1.skills) as skill
      INTERSECT
      SELECT unnest(p2.skills) as skill
    ) AS common_skills;
    score := score + LEAST(shared_skills * 10, 40);
  END IF;
  
  IF p1.programs IS NOT NULL AND p2.programs IS NOT NULL THEN
    SELECT COUNT(DISTINCT program) INTO shared_programs
    FROM (
      SELECT unnest(p1.programs) as program
      INTERSECT
      SELECT unnest(p2.programs) as program
    ) AS common_programs;
    score := score + LEAST(shared_programs * 10, 30);
  END IF;
  
  IF p1.latitude IS NOT NULL AND p2.latitude IS NOT NULL THEN
    distance_km := public.calculate_distance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    
    IF distance_km < 10 THEN score := score + 30;
    ELSIF distance_km < 25 THEN score := score + 20;
    ELSIF distance_km < 50 THEN score := score + 10;
    ELSIF distance_km < 100 THEN score := score + 5;
    END IF;
  END IF;
  
  RETURN score;
END;
$$;

-- Fix handle_mutual_match function
CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reverse_swipe RECORD;
  new_conversation_id UUID;
  match_quality INTEGER;
  ordered_user1_id UUID;
  ordered_user2_id UUID;
BEGIN
  IF NEW.action NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO reverse_swipe
  FROM public.swipes
  WHERE user_id = NEW.swiped_user_id
    AND swiped_user_id = NEW.user_id
    AND action IN ('like', 'super_like');
  
  IF FOUND THEN
    ordered_user1_id := LEAST(NEW.user_id, NEW.swiped_user_id);
    ordered_user2_id := GREATEST(NEW.user_id, NEW.swiped_user_id);
    
    IF EXISTS (
      SELECT 1 FROM public.matches 
      WHERE user1_id = ordered_user1_id 
      AND user2_id = ordered_user2_id
    ) THEN
      RETURN NEW;
    END IF;
    
    match_quality := public.calculate_match_score(NEW.user_id, NEW.swiped_user_id);
    
    INSERT INTO public.conversations (user1_id, user2_id)
    VALUES (ordered_user1_id, ordered_user2_id)
    RETURNING id INTO new_conversation_id;
    
    INSERT INTO public.matches (user1_id, user2_id, matched_at, match_score, conversation_id, status, last_interaction_at)
    VALUES (
      ordered_user1_id,
      ordered_user2_id,
      NOW(),
      match_quality,
      new_conversation_id,
      'active',
      NOW()
    );
    
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
    VALUES 
      (NEW.user_id, 'match', 'New Match! 🎉', 'You matched with someone!', NEW.swiped_user_id),
      (NEW.swiped_user_id, 'match', 'New Match! 🎉', 'You matched with someone!', NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_match_last_interaction function
CREATE OR REPLACE FUNCTION public.update_match_last_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.matches
  SET last_interaction_at = NOW()
  WHERE conversation_id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- PHASE 4: UPDATE RLS POLICIES
-- ============================================

-- Drop existing notification creation policy and create secure one
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

CREATE POLICY "Only system can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    -- Allow if user is admin/moderator OR if it's a system-generated notification
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'moderator')
    -- System notifications are created by triggers, not direct inserts
  );

-- Drop existing match creation policy
DROP POLICY IF EXISTS "System can create matches" ON public.matches;

CREATE POLICY "Only system and triggers can create matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (
    -- Matches are created by triggers or admins only
    public.has_role(auth.uid(), 'admin')
  );

-- Update profiles policy to hide sensitive data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles viewable with privacy respected"
  ON public.profiles
  FOR SELECT
  USING (
    CASE 
      -- User can always see their own profile
      WHEN auth.uid() = id THEN true
      -- Admins can see all profiles
      WHEN public.has_role(auth.uid(), 'admin') THEN true
      -- Check privacy settings
      ELSE (
        -- If user has privacy settings, respect them
        NOT EXISTS (
          SELECT 1 FROM public.privacy_settings ps
          WHERE ps.user_id = profiles.id
          AND ps.who_can_see_profile = 'nobody'
        )
        AND
        -- If set to matches_only, check if users are matched
        (
          NOT EXISTS (
            SELECT 1 FROM public.privacy_settings ps
            WHERE ps.user_id = profiles.id
            AND ps.who_can_see_profile = 'matches_only'
          )
          OR
          EXISTS (
            SELECT 1 FROM public.matches m
            WHERE (m.user1_id = auth.uid() AND m.user2_id = profiles.id)
               OR (m.user2_id = auth.uid() AND m.user1_id = profiles.id)
          )
        )
      )
    END
  );

-- Update applications policies for better security
DROP POLICY IF EXISTS "Opportunity creators can view applications" ON public.applications;

CREATE POLICY "Opportunity creators can view applications"
  ON public.applications
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT o.creator_id
      FROM public.opportunities o
      WHERE o.id = applications.opportunity_id
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Add admin policies for reports
CREATE POLICY "Admins can view all reports"
  ON public.reports
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
  ON public.reports
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 5: HELPER FUNCTIONS
-- ============================================

-- Function to check if user is banned (for future use)
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.audit_logs
    WHERE target_id = _user_id
      AND target_type = 'user'
      AND action = 'user_banned'
      AND created_at > NOW() - INTERVAL '30 days' -- Check recent bans
  )
$$;

-- Create a view for public profiles (excludes sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  portfolio_url,
  location,
  skills,
  programs,
  watermark_url,
  watermark_text,
  work_images,
  account_type,
  profile_completed,
  created_at,
  -- Only show location if show_location is true
  CASE WHEN show_location THEN latitude ELSE NULL END as latitude,
  CASE WHEN show_location THEN longitude ELSE NULL END as longitude
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;