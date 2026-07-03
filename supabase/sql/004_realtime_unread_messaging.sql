-- =============================================================================
-- Knight Market — Realtime messaging + unread indicators (004)
-- =============================================================================
-- Adds per-participant read timestamps on conversations and enables Supabase
-- Realtime for conversations/messages. Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS buyer_last_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS seller_last_read_at timestamptz;

COMMENT ON COLUMN public.conversations.buyer_last_read_at IS
  'Last time the buyer (conversation creator / listing buyer) read the thread.';
COMMENT ON COLUMN public.conversations.seller_last_read_at IS
  'Last time the seller (listing owner / other participant) read the thread.';

-- conversations UPDATE policy for last_message_at should already exist (002).
-- buyer_last_read_at / seller_last_read_at use the same participant UPDATE policy.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
