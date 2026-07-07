import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteStorageFilesSafely,
} from "./supabase-storage-cleanup";

const LISTING_IMAGES_BUCKET = "listing-images";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateListingImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Please upload JPEG, PNG, or WebP images.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Each image must be under 5 MB.";
  }
  return null;
}

export function validateListingImageCount(count: number): string | null {
  if (count < 1) {
    return "Please add at least one image.";
  }
  if (count > MAX_IMAGE_COUNT) {
    return "You can upload up to 5 images.";
  }
  return null;
}

function sanitizeFileName(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return base.replace(/^-+|-+$/g, "") || "image";
}

export function createSafeImagePath(userId: string, file: File): string {
  const safeName = sanitizeFileName(file.name);
  const randomId = Math.random().toString(36).slice(2, 10);
  return `${userId}/${Date.now()}-${randomId}-${safeName}`;
}

export async function uploadListingImages(
  files: File[],
  userId: string
): Promise<{ success: true; urls: string[] } | { success: false; error: string }> {
  const countError = validateListingImageCount(files.length);
  if (countError) {
    return { success: false, error: countError };
  }

  for (const file of files) {
    const validationError = validateListingImage(file);
    if (validationError) {
      return { success: false, error: validationError };
    }
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return {
      success: false,
      error: "Supabase is not configured. Check your environment variables.",
    };
  }

  const urls: string[] = [];

  for (const file of files) {
    const path = createSafeImagePath(userId, file);
    const { error } = await client.storage
      .from(LISTING_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return {
        success: false,
        error: "We could not upload your images. Please try again.",
      };
    }

    const { data } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return {
        success: false,
        error: "We could not upload your images. Please try again.",
      };
    }
    urls.push(data.publicUrl);
  }

  return { success: true, urls };
}

export async function deleteListingImagesForUser(
  imageUrls: string[],
  userId: string
): Promise<void> {
  await deleteStorageFilesSafely(LISTING_IMAGES_BUCKET, imageUrls, {
    userIdPrefix: userId,
  });
}
