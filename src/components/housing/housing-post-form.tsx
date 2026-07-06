"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  HOUSING_TYPE_OPTIONS,
  type CreateHousingPostInput,
  type HousingPostItem,
  type HousingPostType,
  type UpdateHousingPostInput,
} from "@/lib/services/housing-types";
import {
  createHousingPost,
  updateHousingPost,
  uploadHousingImages,
} from "@/lib/services/housing-service";

type HousingPostFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialPost?: HousingPostItem;
};

type FormState = {
  type: HousingPostType;
  title: string;
  description: string;
  rent: string;
  location: string;
  apartmentName: string;
  bedrooms: string;
  bathrooms: string;
  moveInDate: string;
  moveOutDate: string;
  tags: string;
};

function toFormState(post?: HousingPostItem): FormState {
  return {
    type: post?.type ?? "sublease",
    title: post?.title ?? "",
    description: post?.description ?? "",
    rent: post?.rent != null ? String(post.rent) : "",
    location: post?.location ?? "",
    apartmentName: post?.apartmentName ?? "",
    bedrooms: post?.bedrooms != null ? String(post.bedrooms) : "",
    bathrooms: post?.bathrooms != null ? String(post.bathrooms) : "",
    moveInDate: post?.moveInDate ?? "",
    moveOutDate: post?.moveOutDate ?? "",
    tags: post?.tags.join(", ") ?? "",
  };
}

export function HousingPostForm({ userId, mode, initialPost }: HousingPostFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialPost));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages] = useState<string[]>(initialPost?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const imagePreviews = useMemo(
    () => [...existingImages, ...imageFiles.map((file) => URL.createObjectURL(file))],
    [existingImages, imageFiles]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setError("Please fill in title, location, and description.");
      return;
    }

    const rent = form.rent.trim() ? Number(form.rent) : null;
    if (form.rent.trim() && Number.isNaN(rent)) {
      setError("Please enter a valid monthly rent.");
      return;
    }

    const bedrooms = form.bedrooms.trim() ? Number(form.bedrooms) : null;
    const bathrooms = form.bathrooms.trim() ? Number(form.bathrooms) : null;
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setLoading(true);

    let images = [...existingImages];
    if (imageFiles.length > 0) {
      const upload = await uploadHousingImages(imageFiles, userId);
      if (!upload.success) {
        setLoading(false);
        setError(upload.error);
        return;
      }
      images = [...images, ...upload.urls];
    }

    if (mode === "create" && images.length === 0) {
      setLoading(false);
      setError("Please add at least one image.");
      return;
    }

    const payload: CreateHousingPostInput = {
      userId,
      type: form.type,
      title: form.title,
      description: form.description,
      rent,
      bedrooms: Number.isNaN(bedrooms) ? null : bedrooms,
      bathrooms: Number.isNaN(bathrooms) ? null : bathrooms,
      apartmentName: form.apartmentName || null,
      location: form.location,
      moveInDate: form.moveInDate || null,
      moveOutDate: form.moveOutDate || null,
      tags,
      images,
      status: "active",
    };

    if (mode === "create") {
      const result = await createHousingPost(payload);
      setLoading(false);
      if (!result.post) {
        setError(result.error ?? "We could not publish your housing post.");
        return;
      }
      router.push(`/housing/${result.post.id}`);
      return;
    }

    if (!initialPost) {
      setLoading(false);
      setError("Missing housing post to edit.");
      return;
    }

    const updatePayload: UpdateHousingPostInput = {
      ...payload,
      images,
    };
    const result = await updateHousingPost(initialPost.id, userId, updatePayload);
    setLoading(false);
    if (!result.post) {
      setError(result.error ?? "We could not update your housing post.");
      return;
    }
    router.push(`/housing/${result.post.id}`);
  };

  return (
    <Card className="border-gold/20">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="housing-post-form">
          <div>
            <label htmlFor="housing-type" className="mb-2 block text-sm font-medium">
              Housing type
            </label>
            <select
              id="housing-type"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as HousingPostType,
                }))
              }
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              {HOUSING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="housing-title" className="mb-2 block text-sm font-medium">
              Title
            </label>
            <Input
              id="housing-title"
              value={form.title}
              onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))}
              placeholder="1BR sublease near campus"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="housing-rent" className="mb-2 block text-sm font-medium">
                Monthly rent
              </label>
              <Input
                id="housing-rent"
                type="number"
                min="0"
                step="1"
                value={form.rent}
                onChange={(event) => setForm((c) => ({ ...c, rent: event.target.value }))}
                placeholder="900"
              />
            </div>
            <div>
              <label htmlFor="housing-location" className="mb-2 block text-sm font-medium">
                Location / area
              </label>
              <Input
                id="housing-location"
                value={form.location}
                onChange={(event) => setForm((c) => ({ ...c, location: event.target.value }))}
                placeholder="NorthView, Main Campus"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="housing-apartment" className="mb-2 block text-sm font-medium">
              Apartment / community name
            </label>
            <Input
              id="housing-apartment"
              value={form.apartmentName}
              onChange={(event) => setForm((c) => ({ ...c, apartmentName: event.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="housing-bedrooms" className="mb-2 block text-sm font-medium">
                Bedrooms
              </label>
              <Input
                id="housing-bedrooms"
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(event) => setForm((c) => ({ ...c, bedrooms: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="housing-bathrooms" className="mb-2 block text-sm font-medium">
                Bathrooms
              </label>
              <Input
                id="housing-bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={form.bathrooms}
                onChange={(event) => setForm((c) => ({ ...c, bathrooms: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="housing-move-in" className="mb-2 block text-sm font-medium">
                Available from
              </label>
              <Input
                id="housing-move-in"
                type="date"
                value={form.moveInDate}
                onChange={(event) => setForm((c) => ({ ...c, moveInDate: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="housing-move-out" className="mb-2 block text-sm font-medium">
                Lease end date
              </label>
              <Input
                id="housing-move-out"
                type="date"
                value={form.moveOutDate}
                onChange={(event) => setForm((c) => ({ ...c, moveOutDate: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="housing-description" className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="housing-description"
              value={form.description}
              onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Share move-in details, utilities, roommate expectations, and pickup logistics."
              required
            />
          </div>

          <div>
            <label htmlFor="housing-tags" className="mb-2 block text-sm font-medium">
              Tags
            </label>
            <Input
              id="housing-tags"
              value={form.tags}
              onChange={(event) => setForm((c) => ({ ...c, tags: event.target.value }))}
              placeholder="Furnished, Parking, Pet friendly"
            />
          </div>

          <div>
            <label htmlFor="housing-images" className="mb-2 block text-sm font-medium">
              Photos
            </label>
            <Input
              id="housing-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setImageFiles(files);
              }}
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imagePreviews.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "create"
                ? "Publishing..."
                : "Saving..."
              : mode === "create"
                ? "Publish housing post"
                : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
