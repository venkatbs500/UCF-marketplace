-- =============================================================================
-- Knight Market — Messaging policy fix (002)
-- =============================================================================
-- Required for sendMessage() to update conversations.last_message_at after insert.
-- Run manually in Supabase SQL Editor if messaging send fails with RLS errors.
-- =============================================================================

CREATE POLICY conversations_update_participant
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY (participant_ids))
  WITH CHECK (auth.uid() = ANY (participant_ids));
