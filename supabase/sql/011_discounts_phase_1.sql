-- =============================================================================
-- Knight Market — Student Discounts Phase 1 (011)
-- =============================================================================
-- Extends student_discounts for browse, moderation, messaging, and deal metadata.
-- Idempotent — safe to run multiple times.
-- =============================================================================

ALTER TABLE public.student_discounts
  ADD COLUMN IF NOT EXISTS discount_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS discount_value text,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS redemption_url text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS redemption_instructions text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.student_discounts.discount_type IS
  'food, tech, books, services, fitness, entertainment, housing, or other.';
COMMENT ON COLUMN public.student_discounts.discount_value IS
  'Short offer summary (e.g. 15% off, Free drink). Falls back to discount_text.';
COMMENT ON COLUMN public.student_discounts.promo_code IS
  'Optional public promo code.';
COMMENT ON COLUMN public.student_discounts.redemption_url IS
  'Optional external redemption link.';
COMMENT ON COLUMN public.student_discounts.expires_at IS
  'Optional expiry timestamp.';
COMMENT ON COLUMN public.student_discounts.is_online IS
  'True when the deal is online-only.';
COMMENT ON COLUMN public.student_discounts.redemption_instructions IS
  'How students can redeem the deal.';

UPDATE public.student_discounts
SET discount_value = discount_text
WHERE discount_value IS NULL AND discount_text <> '';

UPDATE public.student_discounts
SET discount_type = CASE
  WHEN category ILIKE '%food%' OR category ILIKE '%coffee%' THEN 'food'
  WHEN category ILIKE '%tech%' THEN 'tech'
  WHEN category ILIKE '%book%' THEN 'books'
  WHEN category ILIKE '%print%' OR category ILIKE '%service%' THEN 'services'
  WHEN category ILIKE '%gym%' OR category ILIKE '%fitness%' THEN 'fitness'
  WHEN category ILIKE '%entertain%' THEN 'entertainment'
  WHEN category ILIKE '%housing%' THEN 'housing'
  ELSE 'other'
END
WHERE discount_type = 'other' AND category <> '';

ALTER TABLE public.student_discounts
  DROP CONSTRAINT IF EXISTS student_discounts_status_check;

ALTER TABLE public.student_discounts
  ADD CONSTRAINT student_discounts_status_check CHECK (
    status IN ('active', 'expired', 'draft', 'removed')
  );

ALTER TABLE public.student_discounts
  DROP CONSTRAINT IF EXISTS student_discounts_discount_type_check;

ALTER TABLE public.student_discounts
  ADD CONSTRAINT student_discounts_discount_type_check CHECK (
    discount_type IN (
      'food',
      'tech',
      'books',
      'services',
      'fitness',
      'entertainment',
      'housing',
      'other'
    )
  );

CREATE INDEX IF NOT EXISTS student_discounts_created_at_idx
  ON public.student_discounts (created_at DESC);

CREATE INDEX IF NOT EXISTS student_discounts_status_expires_at_idx
  ON public.student_discounts (status, expires_at);

CREATE INDEX IF NOT EXISTS student_discounts_discount_type_idx
  ON public.student_discounts (discount_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_discounts'
      AND policyname = 'student_discounts_update_admin'
  ) THEN
    CREATE POLICY student_discounts_update_admin
      ON public.student_discounts
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Student discount poster messaging
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS student_discount_id uuid
    REFERENCES public.student_discounts (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_student_discount_id_idx
  ON public.conversations (student_discount_id);

UPDATE public.conversations
SET context_type = 'student_discount'
WHERE student_discount_id IS NOT NULL;

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
      'campus_event',
      'student_discount'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS conversations_student_discount_buyer_unique_idx
  ON public.conversations (student_discount_id, created_by)
  WHERE student_discount_id IS NOT NULL;

-- Student discount reports
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
        'campus_event',
        'student_discount'
      )
    );
END $$;
