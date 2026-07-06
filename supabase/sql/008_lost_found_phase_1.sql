-- =============================================================================
-- Knight Market — Lost & Found Phase 1 (008)
-- =============================================================================
-- Extends lost_found_items for browse, moderation, messaging, and item dates.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.lost_found_items
  ADD COLUMN IF NOT EXISTS item_date date;

COMMENT ON COLUMN public.lost_found_items.item_date IS
  'Date the item was lost or found (optional).';

-- Migrate legacy open status to active
UPDATE public.lost_found_items
SET status = 'active'
WHERE status = 'open';

ALTER TABLE public.lost_found_items
  DROP CONSTRAINT IF EXISTS lost_found_items_status_check;

ALTER TABLE public.lost_found_items
  ADD CONSTRAINT lost_found_items_status_check CHECK (
    status IN ('active', 'resolved', 'draft', 'removed')
  );

CREATE INDEX IF NOT EXISTS lost_found_items_created_at_idx
  ON public.lost_found_items (created_at DESC);

CREATE INDEX IF NOT EXISTS lost_found_items_status_created_at_idx
  ON public.lost_found_items (status, created_at DESC);

CREATE INDEX IF NOT EXISTS lost_found_items_category_idx
  ON public.lost_found_items (category);

-- Public browse uses active status (replaces open policy from 001)
DROP POLICY IF EXISTS lost_found_items_select_open ON public.lost_found_items;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lost_found_items'
      AND policyname = 'lost_found_items_select_active'
  ) THEN
    CREATE POLICY lost_found_items_select_active
      ON public.lost_found_items
      FOR SELECT
      TO public
      USING (status = 'active');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lost_found_items'
      AND policyname = 'lost_found_items_update_admin'
  ) THEN
    CREATE POLICY lost_found_items_update_admin
      ON public.lost_found_items
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Lost & Found contact messaging
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS lost_found_item_id uuid
    REFERENCES public.lost_found_items (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_lost_found_item_id_idx
  ON public.conversations (lost_found_item_id);

UPDATE public.conversations
SET context_type = 'lost_found_item'
WHERE lost_found_item_id IS NOT NULL;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_context_type_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_type_check CHECK (
    context_type IN (
      'marketplace_listing',
      'housing_post',
      'tutor_profile',
      'lost_found_item'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS conversations_lost_found_item_buyer_unique_idx
  ON public.conversations (lost_found_item_id, created_by)
  WHERE lost_found_item_id IS NOT NULL;

-- Lost & Found reports
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reports_target_type_check'
  ) THEN
    ALTER TABLE public.reports DROP CONSTRAINT reports_target_type_check;
  END IF;

  ALTER TABLE public.reports
    ADD CONSTRAINT reports_target_type_check CHECK (
      target_type IN (
        'listing',
        'message',
        'user',
        'conversation',
        'housing_post',
        'tutor_profile',
        'lost_found_item'
      )
    );
END $$;
