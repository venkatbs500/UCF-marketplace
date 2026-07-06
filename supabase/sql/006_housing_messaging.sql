-- =============================================================================
-- Knight Market — Housing messaging (006)
-- =============================================================================
-- conversations already has housing_post_id from 001. This patch adds explicit
-- context_type, backfills existing rows, and prevents duplicate housing threads.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS context_type text NOT NULL DEFAULT 'marketplace_listing';

COMMENT ON COLUMN public.conversations.context_type IS
  'Conversation context: marketplace_listing, housing_post, or tutor_profile.';

UPDATE public.conversations
SET context_type = 'housing_post'
WHERE housing_post_id IS NOT NULL;

UPDATE public.conversations
SET context_type = 'marketplace_listing'
WHERE listing_id IS NOT NULL
  AND housing_post_id IS NULL;

UPDATE public.conversations
SET context_type = 'tutor_profile'
WHERE tutor_profile_id IS NOT NULL
  AND listing_id IS NULL
  AND housing_post_id IS NULL;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_context_type_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_type_check CHECK (
    context_type IN ('marketplace_listing', 'housing_post', 'tutor_profile')
  );

-- One housing thread per interested student per post (buyer = created_by).
CREATE UNIQUE INDEX IF NOT EXISTS conversations_housing_post_buyer_unique_idx
  ON public.conversations (housing_post_id, created_by)
  WHERE housing_post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS conversations_context_type_idx
  ON public.conversations (context_type);

-- RLS from 001/002 already allows participants to select/insert/update.
-- messages policies join conversations.participant_ids — no change required.
-- Realtime publication from 004 covers conversations/messages.
