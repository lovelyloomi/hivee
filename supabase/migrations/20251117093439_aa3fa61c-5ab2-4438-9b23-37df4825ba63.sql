-- Add work_type to opportunities table
ALTER TABLE opportunities ADD COLUMN work_type TEXT CHECK (work_type IN ('commission', 'part_time', 'full_time'));

-- Add status and conversation_id to applications table
ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE applications ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Update conversations table to support application-based chats
ALTER TABLE conversations ADD COLUMN application_id UUID REFERENCES applications(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD COLUMN is_application_chat BOOLEAN DEFAULT false;

-- Add RLS policy for application-based conversations
CREATE POLICY "Users can view application conversations" ON conversations
FOR SELECT
USING (
  is_application_chat = true 
  AND (
    user1_id = auth.uid() 
    OR user2_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM applications a
      WHERE a.conversation_id = conversations.id
      AND (a.applicant_id = auth.uid() OR a.opportunity_id IN (
        SELECT id FROM opportunities WHERE creator_id = auth.uid()
      ))
    )
  )
);

-- Add index for performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_conversation_id ON applications(conversation_id);
CREATE INDEX idx_conversations_application_id ON conversations(application_id);