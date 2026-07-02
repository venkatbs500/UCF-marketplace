-- =============================================================================
-- Knight Market — Core Product Schema Rollback (001)
-- =============================================================================
-- Reverses supabase/sql/001_core_product_schema.sql
--
-- WARNING: Storage buckets with uploaded files must be emptied manually before
-- this script can delete them. Supabase will reject bucket deletion when objects
-- remain. Use Dashboard → Storage → each bucket → delete all files first, or:
--
--   DELETE FROM storage.objects WHERE bucket_id IN (
--     'listing-images', 'housing-images', 'lost-found-images',
--     'event-images', 'profile-avatars'
--   );
--
-- Run in a non-production environment first to confirm expected behavior.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Storage policies (drop before buckets)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS profile_avatars_delete_own ON storage.objects;
DROP POLICY IF EXISTS profile_avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS profile_avatars_insert_own ON storage.objects;
DROP POLICY IF EXISTS profile_avatars_public_read ON storage.objects;

DROP POLICY IF EXISTS event_images_delete_own ON storage.objects;
DROP POLICY IF EXISTS event_images_update_own ON storage.objects;
DROP POLICY IF EXISTS event_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS event_images_public_read ON storage.objects;

DROP POLICY IF EXISTS lost_found_images_delete_own ON storage.objects;
DROP POLICY IF EXISTS lost_found_images_update_own ON storage.objects;
DROP POLICY IF EXISTS lost_found_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS lost_found_images_public_read ON storage.objects;

DROP POLICY IF EXISTS housing_images_delete_own ON storage.objects;
DROP POLICY IF EXISTS housing_images_update_own ON storage.objects;
DROP POLICY IF EXISTS housing_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS housing_images_public_read ON storage.objects;

DROP POLICY IF EXISTS listing_images_delete_own ON storage.objects;
DROP POLICY IF EXISTS listing_images_update_own ON storage.objects;
DROP POLICY IF EXISTS listing_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS listing_images_public_read ON storage.objects;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- WARNING: fails if buckets still contain objects — empty buckets first.
-- ---------------------------------------------------------------------------

DELETE FROM storage.buckets
WHERE id IN (
  'listing-images',
  'housing-images',
  'lost-found-images',
  'event-images',
  'profile-avatars'
);

-- ---------------------------------------------------------------------------
-- Table RLS policies (explicit drops; tables dropped below also remove policies)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS reports_select_own ON public.reports;
DROP POLICY IF EXISTS reports_insert_authenticated ON public.reports;

DROP POLICY IF EXISTS reviews_delete_own ON public.reviews;
DROP POLICY IF EXISTS reviews_update_own ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_own ON public.reviews;
DROP POLICY IF EXISTS reviews_select_public ON public.reviews;

DROP POLICY IF EXISTS messages_insert_participant ON public.messages;
DROP POLICY IF EXISTS messages_select_participant ON public.messages;

DROP POLICY IF EXISTS conversations_insert_participant ON public.conversations;
DROP POLICY IF EXISTS conversations_select_participant ON public.conversations;

DROP POLICY IF EXISTS saved_listings_delete_own ON public.saved_listings;
DROP POLICY IF EXISTS saved_listings_insert_own ON public.saved_listings;
DROP POLICY IF EXISTS saved_listings_select_own ON public.saved_listings;

DROP POLICY IF EXISTS student_discounts_delete_own ON public.student_discounts;
DROP POLICY IF EXISTS student_discounts_update_own ON public.student_discounts;
DROP POLICY IF EXISTS student_discounts_insert_authenticated ON public.student_discounts;
DROP POLICY IF EXISTS student_discounts_select_own ON public.student_discounts;
DROP POLICY IF EXISTS student_discounts_select_active ON public.student_discounts;

DROP POLICY IF EXISTS lost_found_items_delete_own ON public.lost_found_items;
DROP POLICY IF EXISTS lost_found_items_update_own ON public.lost_found_items;
DROP POLICY IF EXISTS lost_found_items_insert_own ON public.lost_found_items;
DROP POLICY IF EXISTS lost_found_items_select_own ON public.lost_found_items;
DROP POLICY IF EXISTS lost_found_items_select_open ON public.lost_found_items;

DROP POLICY IF EXISTS campus_events_delete_own ON public.campus_events;
DROP POLICY IF EXISTS campus_events_update_own ON public.campus_events;
DROP POLICY IF EXISTS campus_events_insert_authenticated ON public.campus_events;
DROP POLICY IF EXISTS campus_events_select_own ON public.campus_events;
DROP POLICY IF EXISTS campus_events_select_active ON public.campus_events;

DROP POLICY IF EXISTS campus_jobs_delete_own ON public.campus_jobs;
DROP POLICY IF EXISTS campus_jobs_update_own ON public.campus_jobs;
DROP POLICY IF EXISTS campus_jobs_insert_authenticated ON public.campus_jobs;
DROP POLICY IF EXISTS campus_jobs_select_own ON public.campus_jobs;
DROP POLICY IF EXISTS campus_jobs_select_active ON public.campus_jobs;

DROP POLICY IF EXISTS tutoring_profiles_delete_own ON public.tutoring_profiles;
DROP POLICY IF EXISTS tutoring_profiles_update_own ON public.tutoring_profiles;
DROP POLICY IF EXISTS tutoring_profiles_insert_own ON public.tutoring_profiles;
DROP POLICY IF EXISTS tutoring_profiles_select_own ON public.tutoring_profiles;
DROP POLICY IF EXISTS tutoring_profiles_select_active ON public.tutoring_profiles;

DROP POLICY IF EXISTS roommate_profiles_delete_own ON public.roommate_profiles;
DROP POLICY IF EXISTS roommate_profiles_update_own ON public.roommate_profiles;
DROP POLICY IF EXISTS roommate_profiles_insert_own ON public.roommate_profiles;
DROP POLICY IF EXISTS roommate_profiles_select_own ON public.roommate_profiles;
DROP POLICY IF EXISTS roommate_profiles_select_active ON public.roommate_profiles;

DROP POLICY IF EXISTS housing_posts_delete_own ON public.housing_posts;
DROP POLICY IF EXISTS housing_posts_update_own ON public.housing_posts;
DROP POLICY IF EXISTS housing_posts_insert_own ON public.housing_posts;
DROP POLICY IF EXISTS housing_posts_select_own ON public.housing_posts;
DROP POLICY IF EXISTS housing_posts_select_active ON public.housing_posts;

DROP POLICY IF EXISTS listings_delete_own ON public.listings;
DROP POLICY IF EXISTS listings_update_own ON public.listings;
DROP POLICY IF EXISTS listings_insert_own ON public.listings;
DROP POLICY IF EXISTS listings_select_own ON public.listings;
DROP POLICY IF EXISTS listings_select_active ON public.listings;

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;

-- ---------------------------------------------------------------------------
-- Tables (dependency order — children first)
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.saved_listings CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.student_discounts CASCADE;
DROP TABLE IF EXISTS public.lost_found_items CASCADE;
DROP TABLE IF EXISTS public.campus_events CASCADE;
DROP TABLE IF EXISTS public.campus_jobs CASCADE;
DROP TABLE IF EXISTS public.tutoring_profiles CASCADE;
DROP TABLE IF EXISTS public.roommate_profiles CASCADE;
DROP TABLE IF EXISTS public.housing_posts CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ---------------------------------------------------------------------------
-- Trigger function (safe to drop after tables are gone)
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
