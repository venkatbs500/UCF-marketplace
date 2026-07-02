-- =============================================================================
-- Knight Market — Core Product Schema (001)
-- =============================================================================
-- Run once in the Supabase SQL Editor (or via supabase db push when CLI is set up).
-- Frontend is NOT wired to these tables yet — this prepares the production backend.
--
-- Includes: tables, indexes, updated_at triggers, RLS policies, storage buckets.
-- Rollback: supabase/sql/001_core_product_schema_rollback.sql
-- Setup guide: docs/supabase-core-schema-setup.md
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Reusable trigger: keep updated_at current
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_initials text,
  bio text,
  major text,
  year text,
  campus_area text,
  interests text[] NOT NULL DEFAULT '{}',
  trust_score integer NOT NULL DEFAULT 75,
  is_verified_student boolean NOT NULL DEFAULT true,
  has_completed_onboarding boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_trust_score_range CHECK (trust_score >= 0 AND trust_score <= 100)
);

CREATE INDEX profiles_email_idx ON public.profiles (email);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. listings
-- ---------------------------------------------------------------------------

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  condition text NOT NULL,
  location text NOT NULL DEFAULT '',
  campus_area text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  pickup_options text[] NOT NULL DEFAULT '{}',
  is_negotiable boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  saved_count integer NOT NULL DEFAULT 0 CHECK (saved_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listings_status_check CHECK (
    status IN ('active', 'sold', 'reserved', 'draft')
  ),
  CONSTRAINT listings_condition_check CHECK (
    condition IN ('new', 'like-new', 'good', 'fair', 'poor')
  ),
  CONSTRAINT listings_category_check CHECK (
    category IN (
      'textbooks', 'furniture', 'electronics', 'scooters', 'gaming',
      'kitchen', 'dorm-essentials', 'clothes', 'tickets', 'free-stuff'
    )
  )
);

CREATE INDEX listings_status_idx ON public.listings (status);
CREATE INDEX listings_seller_id_idx ON public.listings (seller_id);
CREATE INDEX listings_category_created_at_idx ON public.listings (category, created_at DESC);
CREATE INDEX listings_created_at_idx ON public.listings (created_at DESC);

CREATE TRIGGER listings_set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. housing_posts
-- ---------------------------------------------------------------------------

CREATE TABLE public.housing_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  rent numeric(10, 2) CHECK (rent IS NULL OR rent >= 0),
  bedrooms integer CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms numeric(3, 1) CHECK (bathrooms IS NULL OR bathrooms >= 0),
  apartment_name text,
  location text NOT NULL DEFAULT '',
  move_in_date date,
  move_out_date date,
  images text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT housing_posts_type_check CHECK (
    type IN ('sublease', 'roommate', 'lease_transfer', 'review')
  ),
  CONSTRAINT housing_posts_status_check CHECK (
    status IN ('active', 'closed', 'draft')
  )
);

CREATE INDEX housing_posts_status_idx ON public.housing_posts (status);
CREATE INDEX housing_posts_user_id_idx ON public.housing_posts (user_id);
CREATE INDEX housing_posts_type_idx ON public.housing_posts (type);

CREATE TRIGGER housing_posts_set_updated_at
  BEFORE UPDATE ON public.housing_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. roommate_profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.roommate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  bio text NOT NULL DEFAULT '',
  budget_min numeric(10, 2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max numeric(10, 2) CHECK (budget_max IS NULL OR budget_max >= 0),
  preferred_area text,
  move_in_date date,
  lifestyle_tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT roommate_profiles_status_check CHECK (
    status IN ('active', 'paused')
  ),
  CONSTRAINT roommate_profiles_budget_range CHECK (
    budget_min IS NULL
    OR budget_max IS NULL
    OR budget_min <= budget_max
  )
);

CREATE INDEX roommate_profiles_status_idx ON public.roommate_profiles (status);
CREATE INDEX roommate_profiles_user_id_idx ON public.roommate_profiles (user_id);

CREATE TRIGGER roommate_profiles_set_updated_at
  BEFORE UPDATE ON public.roommate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. tutoring_profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.tutoring_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  subjects text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  hourly_rate numeric(10, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  availability text[] NOT NULL DEFAULT '{}',
  rating numeric(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tutoring_profiles_status_check CHECK (
    status IN ('active', 'paused')
  )
);

CREATE INDEX tutoring_profiles_status_idx ON public.tutoring_profiles (status);
CREATE INDEX tutoring_profiles_user_id_idx ON public.tutoring_profiles (user_id);

CREATE TRIGGER tutoring_profiles_set_updated_at
  BEFORE UPDATE ON public.tutoring_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. campus_jobs
-- ---------------------------------------------------------------------------

CREATE TABLE public.campus_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  organization text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  pay text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  time_commitment text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_jobs_status_check CHECK (
    status IN ('active', 'closed', 'draft')
  )
);

CREATE INDEX campus_jobs_status_idx ON public.campus_jobs (status);
CREATE INDEX campus_jobs_posted_by_idx ON public.campus_jobs (posted_by);

CREATE TRIGGER campus_jobs_set_updated_at
  BEFORE UPDATE ON public.campus_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. campus_events
-- ---------------------------------------------------------------------------

CREATE TABLE public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date,
  event_time text,
  location text NOT NULL DEFAULT '',
  host text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_events_status_check CHECK (
    status IN ('active', 'cancelled', 'draft')
  )
);

CREATE INDEX campus_events_status_idx ON public.campus_events (status);
CREATE INDEX campus_events_posted_by_idx ON public.campus_events (posted_by);
CREATE INDEX campus_events_event_date_idx ON public.campus_events (event_date);

CREATE TRIGGER campus_events_set_updated_at
  BEFORE UPDATE ON public.campus_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. lost_found_items
-- ---------------------------------------------------------------------------

CREATE TABLE public.lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  location text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  contact_preference text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lost_found_items_type_check CHECK (
    type IN ('lost', 'found')
  ),
  CONSTRAINT lost_found_items_status_check CHECK (
    status IN ('open', 'resolved', 'draft')
  ),
  CONSTRAINT lost_found_items_category_check CHECK (
    category IN ('id-cards', 'electronics', 'keys', 'clothing', 'books', 'other')
  )
);

CREATE INDEX lost_found_items_status_idx ON public.lost_found_items (status);
CREATE INDEX lost_found_items_user_id_idx ON public.lost_found_items (user_id);
CREATE INDEX lost_found_items_type_idx ON public.lost_found_items (type);

CREATE TRIGGER lost_found_items_set_updated_at
  BEFORE UPDATE ON public.lost_found_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. student_discounts
-- ---------------------------------------------------------------------------

CREATE TABLE public.student_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  business_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_text text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_discounts_status_check CHECK (
    status IN ('active', 'expired', 'draft')
  )
);

CREATE INDEX student_discounts_status_idx ON public.student_discounts (status);
CREATE INDEX student_discounts_posted_by_idx ON public.student_discounts (posted_by);

CREATE TRIGGER student_discounts_set_updated_at
  BEFORE UPDATE ON public.student_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. conversations
-- ---------------------------------------------------------------------------

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  housing_post_id uuid REFERENCES public.housing_posts (id) ON DELETE SET NULL,
  tutor_profile_id uuid REFERENCES public.tutoring_profiles (id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  participant_ids uuid[] NOT NULL,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_participant_ids_not_empty CHECK (
    cardinality(participant_ids) >= 2
  ),
  CONSTRAINT conversations_creator_is_participant CHECK (
    created_by = ANY (participant_ids)
  )
);

CREATE INDEX conversations_participant_ids_gin_idx
  ON public.conversations USING GIN (participant_ids);
CREATE INDEX conversations_last_message_at_idx
  ON public.conversations (last_message_at DESC NULLS LAST);
CREATE INDEX conversations_listing_id_idx ON public.conversations (listing_id);
CREATE INDEX conversations_housing_post_id_idx ON public.conversations (housing_post_id);
CREATE INDEX conversations_tutor_profile_id_idx ON public.conversations (tutor_profile_id);

-- ---------------------------------------------------------------------------
-- 11. messages
-- ---------------------------------------------------------------------------

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT messages_body_not_empty CHECK (length(trim(body)) > 0)
);

CREATE INDEX messages_conversation_id_created_at_idx
  ON public.messages (conversation_id, created_at DESC);
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);

-- ---------------------------------------------------------------------------
-- 12. saved_listings
-- ---------------------------------------------------------------------------

CREATE TABLE public.saved_listings (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX saved_listings_user_id_idx ON public.saved_listings (user_id);
CREATE INDEX saved_listings_listing_id_idx ON public.saved_listings (listing_id);

-- ---------------------------------------------------------------------------
-- 13. reviews
-- ---------------------------------------------------------------------------

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_not_self CHECK (reviewer_id <> reviewee_id)
);

CREATE INDEX reviews_reviewee_id_idx ON public.reviews (reviewee_id);
CREATE INDEX reviews_reviewer_id_idx ON public.reviews (reviewer_id);
CREATE INDEX reviews_listing_id_idx ON public.reviews (listing_id);
CREATE INDEX reviews_created_at_idx ON public.reviews (created_at DESC);

-- ---------------------------------------------------------------------------
-- 14. reports
-- ---------------------------------------------------------------------------

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_status_check CHECK (
    status IN ('open', 'reviewed', 'resolved', 'dismissed')
  ),
  CONSTRAINT reports_reason_not_empty CHECK (length(trim(reason)) > 0)
);

CREATE INDEX reports_status_idx ON public.reports (status);
CREATE INDEX reports_reporter_id_idx ON public.reports (reporter_id);
CREATE INDEX reports_target_idx ON public.reports (target_type, target_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- profiles -------------------------------------------------------------------

CREATE POLICY profiles_select_authenticated
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- listings -------------------------------------------------------------------

CREATE POLICY listings_select_active
  ON public.listings
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY listings_select_own
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY listings_insert_own
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY listings_update_own
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY listings_delete_own
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- housing_posts --------------------------------------------------------------

CREATE POLICY housing_posts_select_active
  ON public.housing_posts
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY housing_posts_select_own
  ON public.housing_posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY housing_posts_insert_own
  ON public.housing_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY housing_posts_update_own
  ON public.housing_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY housing_posts_delete_own
  ON public.housing_posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- roommate_profiles ----------------------------------------------------------

CREATE POLICY roommate_profiles_select_active
  ON public.roommate_profiles
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY roommate_profiles_select_own
  ON public.roommate_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY roommate_profiles_insert_own
  ON public.roommate_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY roommate_profiles_update_own
  ON public.roommate_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY roommate_profiles_delete_own
  ON public.roommate_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- tutoring_profiles ----------------------------------------------------------

CREATE POLICY tutoring_profiles_select_active
  ON public.tutoring_profiles
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY tutoring_profiles_select_own
  ON public.tutoring_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY tutoring_profiles_insert_own
  ON public.tutoring_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tutoring_profiles_update_own
  ON public.tutoring_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tutoring_profiles_delete_own
  ON public.tutoring_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- campus_jobs ----------------------------------------------------------------

CREATE POLICY campus_jobs_select_active
  ON public.campus_jobs
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY campus_jobs_select_own
  ON public.campus_jobs
  FOR SELECT
  TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY campus_jobs_insert_authenticated
  ON public.campus_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY campus_jobs_update_own
  ON public.campus_jobs
  FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY campus_jobs_delete_own
  ON public.campus_jobs
  FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());

-- campus_events --------------------------------------------------------------

CREATE POLICY campus_events_select_active
  ON public.campus_events
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY campus_events_select_own
  ON public.campus_events
  FOR SELECT
  TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY campus_events_insert_authenticated
  ON public.campus_events
  FOR INSERT
  TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY campus_events_update_own
  ON public.campus_events
  FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY campus_events_delete_own
  ON public.campus_events
  FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());

-- lost_found_items -----------------------------------------------------------

CREATE POLICY lost_found_items_select_open
  ON public.lost_found_items
  FOR SELECT
  TO public
  USING (status = 'open');

CREATE POLICY lost_found_items_select_own
  ON public.lost_found_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY lost_found_items_insert_own
  ON public.lost_found_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY lost_found_items_update_own
  ON public.lost_found_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY lost_found_items_delete_own
  ON public.lost_found_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- student_discounts ----------------------------------------------------------

CREATE POLICY student_discounts_select_active
  ON public.student_discounts
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY student_discounts_select_own
  ON public.student_discounts
  FOR SELECT
  TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY student_discounts_insert_authenticated
  ON public.student_discounts
  FOR INSERT
  TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY student_discounts_update_own
  ON public.student_discounts
  FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY student_discounts_delete_own
  ON public.student_discounts
  FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());

-- saved_listings -------------------------------------------------------------

CREATE POLICY saved_listings_select_own
  ON public.saved_listings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY saved_listings_insert_own
  ON public.saved_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_listings_delete_own
  ON public.saved_listings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- conversations --------------------------------------------------------------

CREATE POLICY conversations_select_participant
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY (participant_ids));

CREATE POLICY conversations_insert_participant
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = ANY (participant_ids)
    AND created_by = auth.uid()
  );

-- messages -------------------------------------------------------------------

CREATE POLICY messages_select_participant
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND auth.uid() = ANY (c.participant_ids)
    )
  );

CREATE POLICY messages_insert_participant
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND auth.uid() = ANY (c.participant_ids)
    )
  );

-- reviews --------------------------------------------------------------------

CREATE POLICY reviews_select_public
  ON public.reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY reviews_insert_own
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY reviews_update_own
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY reviews_delete_own
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());

-- reports --------------------------------------------------------------------

CREATE POLICY reports_insert_authenticated
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY reports_select_own
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
-- 5 MB limit per file. Public read. Authenticated users upload to {uid}/ paths.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'listing-images',
    'listing-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'housing-images',
    'housing-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'lost-found-images',
    'lost-found-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'event-images',
    'event-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'profile-avatars',
    'profile-avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  )
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (storage.objects RLS is enabled by default in Supabase)

-- listing-images
CREATE POLICY listing_images_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');

CREATE POLICY listing_images_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY listing_images_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY listing_images_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- housing-images
CREATE POLICY housing_images_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'housing-images');

CREATE POLICY housing_images_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'housing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY housing_images_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'housing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY housing_images_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'housing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- lost-found-images
CREATE POLICY lost_found_images_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'lost-found-images');

CREATE POLICY lost_found_images_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lost-found-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY lost_found_images_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lost-found-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY lost_found_images_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lost-found-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- event-images
CREATE POLICY event_images_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event-images');

CREATE POLICY event_images_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY event_images_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY event_images_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- profile-avatars
CREATE POLICY profile_avatars_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-avatars');

CREATE POLICY profile_avatars_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY profile_avatars_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY profile_avatars_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
