-- =============================================================================
-- Knight Market — Events Phase 1 (010)
-- =============================================================================
-- Extends campus_events for browse, moderation, messaging, and event metadata.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.campus_events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS event_end_time text,
  ADD COLUMN IF NOT EXISTS external_url text;

COMMENT ON COLUMN public.campus_events.event_type IS
  'social, academic, career, sports, club, volunteer, or other.';
COMMENT ON COLUMN public.campus_events.event_end_time IS
  'Optional end time label (e.g. 9:00 PM).';
COMMENT ON COLUMN public.campus_events.external_url IS
  'Optional external event page link entered by the organizer.';

UPDATE public.campus_events
SET event_type = CASE
  WHEN category ILIKE '%career%' OR category ILIKE '%fair%' THEN 'career'
  WHEN category ILIKE '%sport%' THEN 'sports'
  WHEN category ILIKE '%club%' THEN 'club'
  WHEN category ILIKE '%volunteer%' THEN 'volunteer'
  WHEN category ILIKE '%social%' THEN 'social'
  WHEN category ILIKE '%hackathon%' OR category ILIKE '%academic%' THEN 'academic'
  ELSE 'other'
END
WHERE event_type = 'other' AND category <> '';

ALTER TABLE public.campus_events
  DROP CONSTRAINT IF EXISTS campus_events_status_check;

ALTER TABLE public.campus_events
  ADD CONSTRAINT campus_events_status_check CHECK (
    status IN ('active', 'cancelled', 'draft', 'removed')
  );

ALTER TABLE public.campus_events
  DROP CONSTRAINT IF EXISTS campus_events_event_type_check;

ALTER TABLE public.campus_events
  ADD CONSTRAINT campus_events_event_type_check CHECK (
    event_type IN ('social', 'academic', 'career', 'sports', 'club', 'volunteer', 'other')
  );

CREATE INDEX IF NOT EXISTS campus_events_created_at_idx
  ON public.campus_events (created_at DESC);

CREATE INDEX IF NOT EXISTS campus_events_status_event_date_idx
  ON public.campus_events (status, event_date);

CREATE INDEX IF NOT EXISTS campus_events_event_type_idx
  ON public.campus_events (event_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'campus_events'
      AND policyname = 'campus_events_update_admin'
  ) THEN
    CREATE POLICY campus_events_update_admin
      ON public.campus_events
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Campus event organizer messaging
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS campus_event_id uuid
    REFERENCES public.campus_events (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_campus_event_id_idx
  ON public.conversations (campus_event_id);

UPDATE public.conversations
SET context_type = 'campus_event'
WHERE campus_event_id IS NOT NULL;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_context_type_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_type_check CHECK (
    context_type IN (
      'marketplace_listing',
      'housing_post',
      'tutor_profile',
      'lost_found_item',
      'campus_job',
      'campus_event'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS conversations_campus_event_buyer_unique_idx
  ON public.conversations (campus_event_id, created_by)
  WHERE campus_event_id IS NOT NULL;

-- Campus event reports
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
        'campus_job',
        'campus_event'
      )
    );
END $$;
