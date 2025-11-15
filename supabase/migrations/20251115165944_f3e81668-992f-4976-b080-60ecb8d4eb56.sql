-- Create swipes table to track all swipe actions
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_on_work_index INTEGER DEFAULT 0,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_swipe UNIQUE (user_id, swiped_user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX idx_swipes_swiped_user_id ON public.swipes(swiped_user_id);

-- Enable RLS on swipes
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for swipes
CREATE POLICY "Users can view their own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swipes"
  ON public.swipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create matches table for confirmed matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'unmatched')),
  CONSTRAINT unique_match UNIQUE (user1_id, user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- Create indexes for matches
CREATE INDEX idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX idx_matches_conversation_id ON public.matches(conversation_id);
CREATE INDEX idx_matches_status ON public.matches(status);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to calculate match compatibility score (0-100)
CREATE OR REPLACE FUNCTION calculate_match_score(user1 UUID, user2 UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  shared_skills INTEGER;
  shared_programs INTEGER;
  distance_km DOUBLE PRECISION;
  p1 RECORD;
  p2 RECORD;
BEGIN
  -- Get both profiles
  SELECT * INTO p1 FROM profiles WHERE id = user1;
  SELECT * INTO p2 FROM profiles WHERE id = user2;
  
  IF p1 IS NULL OR p2 IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Skills compatibility (0-40 points)
  IF p1.skills IS NOT NULL AND p2.skills IS NOT NULL THEN
    SELECT COUNT(DISTINCT skill) INTO shared_skills
    FROM (
      SELECT unnest(p1.skills) as skill
      INTERSECT
      SELECT unnest(p2.skills) as skill
    ) AS common_skills;
    score := score + LEAST(shared_skills * 10, 40);
  END IF;
  
  -- Programs compatibility (0-30 points)
  IF p1.programs IS NOT NULL AND p2.programs IS NOT NULL THEN
    SELECT COUNT(DISTINCT program) INTO shared_programs
    FROM (
      SELECT unnest(p1.programs) as program
      INTERSECT
      SELECT unnest(p2.programs) as program
    ) AS common_programs;
    score := score + LEAST(shared_programs * 10, 30);
  END IF;
  
  -- Location proximity (0-30 points)
  IF p1.latitude IS NOT NULL AND p2.latitude IS NOT NULL THEN
    distance_km := calculate_distance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    
    IF distance_km < 10 THEN score := score + 30;
    ELSIF distance_km < 25 THEN score := score + 20;
    ELSIF distance_km < 50 THEN score := score + 10;
    ELSIF distance_km < 100 THEN score := score + 5;
    END IF;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to handle mutual match creation
CREATE OR REPLACE FUNCTION handle_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
  reverse_swipe RECORD;
  new_conversation_id UUID;
  match_quality INTEGER;
  ordered_user1_id UUID;
  ordered_user2_id UUID;
BEGIN
  -- Only process likes
  IF NEW.action NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;

  -- Check if the other user also liked back
  SELECT * INTO reverse_swipe
  FROM swipes
  WHERE user_id = NEW.swiped_user_id
    AND swiped_user_id = NEW.user_id
    AND action IN ('like', 'super_like');
  
  IF FOUND THEN
    -- Order user IDs consistently
    ordered_user1_id := LEAST(NEW.user_id, NEW.swiped_user_id);
    ordered_user2_id := GREATEST(NEW.user_id, NEW.swiped_user_id);
    
    -- Check if match already exists
    IF EXISTS (
      SELECT 1 FROM matches 
      WHERE user1_id = ordered_user1_id 
      AND user2_id = ordered_user2_id
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Calculate match quality score
    match_quality := calculate_match_score(NEW.user_id, NEW.swiped_user_id);
    
    -- Create conversation immediately
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (ordered_user1_id, ordered_user2_id)
    RETURNING id INTO new_conversation_id;
    
    -- Create match record
    INSERT INTO matches (user1_id, user2_id, matched_at, match_score, conversation_id, status, last_interaction_at)
    VALUES (
      ordered_user1_id,
      ordered_user2_id,
      NOW(),
      match_quality,
      new_conversation_id,
      'active',
      NOW()
    );
    
    -- Create notifications for both users
    INSERT INTO notifications (user_id, type, title, message, related_user_id)
    VALUES 
      (NEW.user_id, 'match', 'New Match! 🎉', 'You matched with someone!', NEW.swiped_user_id),
      (NEW.swiped_user_id, 'match', 'New Match! 🎉', 'You matched with someone!', NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update match interaction timestamp
CREATE OR REPLACE FUNCTION update_match_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches
  SET last_interaction_at = NOW()
  WHERE conversation_id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create match on mutual like
DROP TRIGGER IF EXISTS on_mutual_like ON public.swipes;
CREATE TRIGGER on_mutual_like
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION handle_mutual_match();

-- Trigger to update match activity on new messages
DROP TRIGGER IF EXISTS update_match_interaction ON public.messages;
CREATE TRIGGER update_match_interaction
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_match_last_interaction();

-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;