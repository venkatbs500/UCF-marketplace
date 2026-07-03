-- =============================================================================
-- Knight Market — Moderation reports and admin tooling (003)
-- =============================================================================
-- Safe to run after 001/002. This patch is idempotent where possible.
-- Run manually in Supabase SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Admin users table + helper
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_users'
      AND policyname = 'admin_users_select_self'
  ) THEN
    CREATE POLICY admin_users_select_self
      ON public.admin_users
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- reports table upgrades
-- -----------------------------------------------------------------------------

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS details text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution_note text;

ALTER TABLE public.reports
  ALTER COLUMN reporter_id SET NOT NULL,
  ALTER COLUMN target_type SET NOT NULL,
  ALTER COLUMN target_id SET NOT NULL,
  ALTER COLUMN reason SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'open',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reports_target_type_check'
      AND conrelid = 'public.reports'::regclass
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_target_type_check CHECK (
        target_type IN ('listing', 'message', 'user', 'conversation')
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reports_status_check'
      AND conrelid = 'public.reports'::regclass
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_status_check CHECK (
        status IN ('open', 'reviewed', 'resolved', 'dismissed')
      );
  END IF;
END
$$;

-- Keep legacy/old check names from previous migration if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reports_reason_not_empty'
      AND conrelid = 'public.reports'::regclass
  ) THEN
    -- already present in 001; no-op
    NULL;
  ELSE
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_reason_not_empty CHECK (length(trim(reason)) > 0);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS reports_reviewed_by_idx ON public.reports (reviewed_by);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reports'
      AND policyname = 'reports_select_admin'
  ) THEN
    CREATE POLICY reports_select_admin
      ON public.reports
      FOR SELECT
      TO authenticated
      USING (public.is_admin());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reports'
      AND policyname = 'reports_update_admin'
  ) THEN
    CREATE POLICY reports_update_admin
      ON public.reports
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- listing moderation: allow 'removed' and admin updates
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  status_check text;
BEGIN
  SELECT pg_get_constraintdef(oid)
    INTO status_check
  FROM pg_constraint
  WHERE conrelid = 'public.listings'::regclass
    AND conname = 'listings_status_check';

  IF status_check IS NOT NULL AND position('removed' in status_check) = 0 THEN
    ALTER TABLE public.listings DROP CONSTRAINT listings_status_check;
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_status_check
      CHECK (status IN ('active', 'sold', 'reserved', 'draft', 'removed'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listings'
      AND policyname = 'listings_update_admin'
  ) THEN
    CREATE POLICY listings_update_admin
      ON public.listings
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- message moderation: hide flag + admin update policy
-- -----------------------------------------------------------------------------

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS messages_is_hidden_idx ON public.messages (is_hidden);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'messages_update_admin'
  ) THEN
    CREATE POLICY messages_update_admin
      ON public.messages
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;
