-- =============================================================================
-- Knight Market — Jobs Phase 1 (009)
-- =============================================================================
-- Extends campus_jobs for browse, moderation, messaging, and job metadata.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.campus_jobs
  ADD COLUMN IF NOT EXISTS job_type text NOT NULL DEFAULT 'campus',
  ADD COLUMN IF NOT EXISTS is_remote boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requirements text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS application_url text,
  ADD COLUMN IF NOT EXISTS application_instructions text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.campus_jobs.job_type IS
  'part_time, internship, gig, volunteer, research, or campus.';
COMMENT ON COLUMN public.campus_jobs.is_remote IS
  'Whether the role can be done remotely.';
COMMENT ON COLUMN public.campus_jobs.application_url IS
  'Optional external application link entered by the poster.';

UPDATE public.campus_jobs
SET job_type = CASE
  WHEN category ILIKE '%research%' THEN 'research'
  WHEN category ILIKE '%intern%' THEN 'internship'
  WHEN category ILIKE '%volunteer%' THEN 'volunteer'
  WHEN category ILIKE '%gig%' OR category ILIKE '%freelance%' THEN 'gig'
  WHEN category ILIKE '%part%' THEN 'part_time'
  ELSE 'campus'
END
WHERE job_type = 'campus' AND category <> '';

ALTER TABLE public.campus_jobs
  DROP CONSTRAINT IF EXISTS campus_jobs_status_check;

ALTER TABLE public.campus_jobs
  ADD CONSTRAINT campus_jobs_status_check CHECK (
    status IN ('active', 'closed', 'draft', 'removed')
  );

ALTER TABLE public.campus_jobs
  DROP CONSTRAINT IF EXISTS campus_jobs_job_type_check;

ALTER TABLE public.campus_jobs
  ADD CONSTRAINT campus_jobs_job_type_check CHECK (
    job_type IN ('part_time', 'internship', 'gig', 'volunteer', 'research', 'campus')
  );

CREATE INDEX IF NOT EXISTS campus_jobs_created_at_idx
  ON public.campus_jobs (created_at DESC);

CREATE INDEX IF NOT EXISTS campus_jobs_status_created_at_idx
  ON public.campus_jobs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS campus_jobs_job_type_idx
  ON public.campus_jobs (job_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'campus_jobs'
      AND policyname = 'campus_jobs_update_admin'
  ) THEN
    CREATE POLICY campus_jobs_update_admin
      ON public.campus_jobs
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Campus job contact messaging
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS campus_job_id uuid
    REFERENCES public.campus_jobs (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_campus_job_id_idx
  ON public.conversations (campus_job_id);

UPDATE public.conversations
SET context_type = 'campus_job'
WHERE campus_job_id IS NOT NULL;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_context_type_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_type_check CHECK (
    context_type IN (
      'marketplace_listing',
      'housing_post',
      'tutor_profile',
      'lost_found_item',
      'campus_job'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS conversations_campus_job_buyer_unique_idx
  ON public.conversations (campus_job_id, created_by)
  WHERE campus_job_id IS NOT NULL;

-- Campus job reports
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
        'lost_found_item',
        'campus_job'
      )
    );
END $$;
