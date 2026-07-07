-- =============================================================================
-- Knight Market — Message deletion + conversation hide + privacy (012)
-- =============================================================================
-- Adds user-facing soft-delete for messages and per-participant "delete for me"
-- (hide) for conversations. Idempotent — safe to run multiple times.
--
-- Product rules encoded here:
--   * Message delete   = soft delete, ONLY the sender can delete their own row.
--                        The row is kept (never hard-deleted from the client) so
--                        the other participant sees "Message deleted" and so
--                        safety moderation can still review reported content.
--   * Conversation hide = "delete for me" only. Each participant has their own
--                        deleted-at timestamp. Hiding never affects the other
--                        participant's copy. If a newer message arrives after the
--                        hide timestamp, the conversation reappears for that user.
--   * Admin moderation (hide_message / is_hidden from 003) stays separate and is
--                        unaffected by user deletion.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- messages: user soft-delete fields
-- -----------------------------------------------------------------------------

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

COMMENT ON COLUMN public.messages.deleted_at IS
  'When the sender soft-deleted this message. Body is retained for safety review but hidden in the app.';
COMMENT ON COLUMN public.messages.deleted_by IS
  'User who deleted the message (should equal sender_id for user deletes).';

CREATE INDEX IF NOT EXISTS messages_conversation_id_deleted_at_idx
  ON public.messages (conversation_id, deleted_at);

-- Allow a sender to UPDATE only their own message rows (used to set deleted_at).
-- This does NOT let a user modify another participant's messages.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'messages_update_own_sender'
  ) THEN
    CREATE POLICY messages_update_own_sender
      ON public.messages
      FOR UPDATE
      TO authenticated
      USING (sender_id = auth.uid())
      WITH CHECK (sender_id = auth.uid());
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- conversations: per-participant hide ("delete for me") timestamps
-- -----------------------------------------------------------------------------
-- buyer_deleted_at  -> applies to the conversation creator (created_by / buyer)
-- seller_deleted_at -> applies to the other participant (listing owner / seller)
-- This mirrors the buyer/seller role split already used for read-state
-- (buyer_last_read_at / seller_last_read_at).

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS buyer_deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS seller_deleted_at timestamptz;

COMMENT ON COLUMN public.conversations.buyer_deleted_at IS
  'When the buyer (creator) hid this conversation from their inbox. Reappears if a newer message arrives.';
COMMENT ON COLUMN public.conversations.seller_deleted_at IS
  'When the seller (other participant) hid this conversation from their inbox. Reappears if a newer message arrives.';

CREATE INDEX IF NOT EXISTS conversations_buyer_deleted_at_idx
  ON public.conversations (buyer_deleted_at);
CREATE INDEX IF NOT EXISTS conversations_seller_deleted_at_idx
  ON public.conversations (seller_deleted_at);

-- Conversation UPDATE is already governed by conversations_update_participant (002),
-- which allows any participant to update the row (last_message_at, read-state, and
-- now the hide timestamps). The app only ever writes the CURRENT user's own
-- buyer_deleted_at / seller_deleted_at column, so one participant does not hide the
-- other participant's copy. Column-level enforcement is intentionally left to the
-- application layer for the private beta; revisit with a trigger if stricter
-- guarantees are required.

-- -----------------------------------------------------------------------------
-- Privacy note (documentation only; no schema effect)
-- -----------------------------------------------------------------------------
-- Message bodies are stored in plaintext for delivery and safety moderation.
-- A database owner can technically read rows in the table editor. Knight Market
-- policy: do not inspect private message content except when reviewing a safety
-- report. A future option is end-to-end encryption, which would remove the ability
-- to moderate reported content and is therefore out of scope for the private beta.
