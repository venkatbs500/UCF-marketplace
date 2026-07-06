"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LOST_FOUND_CATEGORIES } from "@/lib/constants";
import {
  type CreateLostFoundItemInput,
  type LostFoundCategory,
  type LostFoundItemRecord,
  type LostFoundItemType,
  type UpdateLostFoundItemInput,
} from "@/lib/services/lost-found-types";
import {
  createLostFoundItem,
  updateLostFoundItem,
  uploadLostFoundImages,
} from "@/lib/services/lost-found-service";

type LostFoundItemFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialItem?: LostFoundItemRecord;
};

type FormState = {
  itemType: LostFoundItemType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  itemDate: string;
};

function toFormState(item?: LostFoundItemRecord): FormState {
  return {
    itemType: item?.itemType ?? "lost",
    title: item?.title ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "other",
    location: item?.location ?? "",
    itemDate: item?.itemDate ?? "",
  };
}

export function LostFoundItemForm({ userId, mode, initialItem }: LostFoundItemFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialItem));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages] = useState<string[]>(initialItem?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const imagePreviews = useMemo(
    () => [...existingImages, ...imageFiles.map((file) => URL.createObjectURL(file))],
    [existingImages, imageFiles]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError("Please fill in title, description, and location.");
      return;
    }

    setLoading(true);

    let images = [...existingImages];
    if (imageFiles.length > 0) {
      const upload = await uploadLostFoundImages(imageFiles, userId);
      if (!upload.success) {
        setLoading(false);
        setError(upload.error);
        return;
      }
      images = [...images, ...upload.urls];
    }

    if (mode === "create") {
      const input: CreateLostFoundItemInput = {
        userId,
        itemType: form.itemType,
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        itemDate: form.itemDate || null,
        images,
        status: "active",
      };
      const result = await createLostFoundItem(input);
      setLoading(false);
      if (!result.item) {
        setError(result.error ?? "We could not create your post. Please try again.");
        return;
      }
      router.push(`/lost-found/${result.item.id}`);
      return;
    }

    const updateInput: UpdateLostFoundItemInput = {
      itemType: form.itemType,
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      itemDate: form.itemDate || null,
      images,
    };
    const result = await updateLostFoundItem(initialItem!.id, userId, updateInput);
    setLoading(false);
    if (!result.item) {
      setError(result.error ?? "We could not update your post. Please try again.");
      return;
    }
    router.push(`/lost-found/${result.item.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-muted">
            Do not reveal every identifying detail publicly. Ask claimants to verify ownership
            before returning items like IDs or electronics.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Type</span>
              <select
                value={form.itemType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    itemType: event.target.value as LostFoundItemType,
                  }))
                }
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4"
              >
                <option value="lost">Lost item</option>
                <option value="found">Found item</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as LostFoundCategory,
                  }))
                }
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4"
              >
                {LOST_FOUND_CATEGORIES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label htmlFor="lost-found-title" className="mb-2 block text-sm font-medium">
              Title
            </label>
            <Input
              id="lost-found-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Lost AirPods case near library"
              required
            />
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              placeholder="Share helpful details without posting full identifying info."
              required
            />
          </label>

          <div>
            <label htmlFor="lost-found-location" className="mb-2 block text-sm font-medium">
              Location / area
            </label>
            <Input
              id="lost-found-location"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="e.g. John C. Hitt Library, RWC Gym"
              required
            />
          </div>

          <div>
            <label htmlFor="lost-found-date" className="mb-2 block text-sm font-medium">
              Date lost or found (optional)
            </label>
            <Input
              id="lost-found-date"
              type="date"
              value={form.itemDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, itemDate: event.target.value }))
              }
            />
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Photos (optional, up to 5)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setImageFiles(files.slice(0, 5));
              }}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:text-sm file:font-medium"
            />
          </label>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="overflow-hidden rounded-xl border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? mode === "create"
            ? "Posting…"
            : "Saving…"
          : mode === "create"
            ? "Post item"
            : "Save changes"}
      </Button>
    </form>
  );
}
