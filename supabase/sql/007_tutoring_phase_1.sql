-- =============================================================================
-- Knight Market — Tutoring Phase 1 (007)
-- =============================================================================
-- Extends tutoring_profiles for browse, moderation, and tutor messaging.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.tutoring_profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS tutoring_format text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_preference text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.tutoring_profiles.display_name IS
  'Optional public display name; falls back to profile full_name in the app.';
COMMENT ON COLUMN public.tutoring_profiles.tutoring_format IS
  'online, in_person, or both.';
COMMENT ON COLUMN public.tutoring_profiles.experience IS
  'Tutoring experience or credentials summary.';
COMMENT ON COLUMN public.tutoring_profiles.meeting_preference IS
  'Preferred meeting location or online platform notes.';

UPDATE public.tutoring_profiles
SET status = 'inactive'
WHERE status = 'paused';

ALTER TABLE public.tutoring_profiles
  DROP CONSTRAINT IF EXISTS tutoring_profiles_status_check;

ALTER TABLE public.tutoring_profiles
  ADD CONSTRAINT tutoring_profiles_status_check CHECK (
    status IN ('active', 'inactive', 'removed')
  );

ALTER TABLE public.tutoring_profiles
  DROP CONSTRAINT IF EXISTS tutoring_profiles_format_check;

ALTER TABLE public.tutoring_profiles
  ADD CONSTRAINT tutoring_profiles_format_check CHECK (
    tutoring_format IN ('online', 'in_person', 'both')
  );

CREATE INDEX IF NOT EXISTS tutoring_profiles_subjects_gin_idx
  ON public.tutoring_profiles USING GIN (subjects);

CREATE INDEX IF NOT EXISTS tutoring_profiles_hourly_rate_idx
  ON public.tutoring_profiles (hourly_rate);

CREATE INDEX IF NOT EXISTS tutoring_profiles_created_at_idx
  ON public.tutoring_profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS tutoring_profiles_status_created_at_idx
  ON public.tutoring_profiles (status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS tutoring_profiles_user_id_unique_idx
  ON public.tutoring_profiles (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tutoring_profiles'
      AND policyname = 'tutoring_profiles_update_admin'
  ) THEN
    CREATE POLICY tutoring_profiles_update_admin
      ON public.tutoring_profiles
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_tutor_profile_buyer_unique_idx
  ON public.conversations (tutor_profile_id, created_by)
  WHERE tutor_profile_id IS NOT NULL;

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
        'tutor_profile'
      )
    );
END $$;
