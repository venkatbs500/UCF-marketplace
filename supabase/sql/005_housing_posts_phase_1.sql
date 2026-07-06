-- =============================================================================
-- Knight Market — Housing posts Phase 1 (005)
-- =============================================================================
-- Extends housing_posts for moderation, reporting, and browse performance.
-- Idempotent — safe to run multiple times.
-- =============================================================================

-- Allow moderation to remove posts from public browse
ALTER TABLE public.housing_posts
  DROP CONSTRAINT IF EXISTS housing_posts_status_check;

ALTER TABLE public.housing_posts
  ADD CONSTRAINT housing_posts_status_check CHECK (
    status IN ('active', 'closed', 'draft', 'removed')
  );

CREATE INDEX IF NOT EXISTS housing_posts_created_at_idx
  ON public.housing_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS housing_posts_status_created_at_idx
  ON public.housing_posts (status, created_at DESC);

-- Admin moderation (uses public.is_admin() from 003)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'housing_posts'
      AND policyname = 'housing_posts_update_admin'
  ) THEN
    CREATE POLICY housing_posts_update_admin
      ON public.housing_posts
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Housing post reports
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
        'housing_post'
      )
    );
END $$;
