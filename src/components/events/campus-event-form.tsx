"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  CAMPUS_EVENT_TYPE_OPTIONS,
  type CampusEventRecord,
  type CampusEventType,
  type CreateCampusEventInput,
  type UpdateCampusEventInput,
} from "@/lib/services/events-types";
import {
  createCampusEvent,
  updateCampusEvent,
  uploadEventImages,
} from "@/lib/services/events-service";

type CampusEventFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialEvent?: CampusEventRecord;
};

type FormState = {
  title: string;
  eventType: CampusEventType;
  description: string;
  location: string;
  host: string;
  eventDate: string;
  eventTime: string;
  eventEndTime: string;
  externalUrl: string;
};

function toFormState(event?: CampusEventRecord): FormState {
  return {
    title: event?.title ?? "",
    eventType: event?.eventType ?? "social",
    description: event?.description ?? "",
    location: event?.location ?? "",
    host: event?.host ?? "",
    eventDate: event?.eventDate ?? "",
    eventTime: event?.eventTime ?? "",
    eventEndTime: event?.eventEndTime ?? "",
    externalUrl: event?.externalUrl ?? "",
  };
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CampusEventForm({ userId, mode, initialEvent }: CampusEventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialEvent));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages] = useState<string[]>(initialEvent?.images ?? []);
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

    if (form.externalUrl.trim() && !isValidUrl(form.externalUrl.trim())) {
      setError("Please enter a valid external URL starting with http:// or https://.");
      return;
    }

    setLoading(true);

    let images = [...existingImages];
    if (imageFiles.length > 0) {
      const upload = await uploadEventImages(imageFiles, userId);
      if (!upload.success) {
        setLoading(false);
        setError(upload.error);
        return;
      }
      images = [...images, ...upload.urls];
    }

    if (mode === "create") {
      const input: CreateCampusEventInput = {
        postedBy: userId,
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        eventDate: form.eventDate || null,
        eventTime: form.eventTime,
        eventEndTime: form.eventEndTime || null,
        location: form.location,
        host: form.host,
        images,
        externalUrl: form.externalUrl.trim() || null,
        status: "active",
      };
      const result = await createCampusEvent(input);
      setLoading(false);
      if (!result.event) {
        setError(result.error ?? "We could not create your event. Please try again.");
        return;
      }
      router.push(`/events/${result.event.id}`);
      return;
    }

    const updateInput: UpdateCampusEventInput = {
      title: form.title,
      description: form.description,
      eventType: form.eventType,
      eventDate: form.eventDate || null,
      eventTime: form.eventTime,
      eventEndTime: form.eventEndTime || null,
      location: form.location,
      host: form.host,
      images,
      externalUrl: form.externalUrl.trim() || null,
    };
    const result = await updateCampusEvent(initialEvent!.id, userId, updateInput);
    setLoading(false);
    if (!result.event) {
      setError(result.error ?? "We could not update your event. Please try again.");
      return;
    }
    router.push(`/events/${result.event.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-muted">
            Meet in public campus spaces. Be careful with off-platform links. Report suspicious
            events.
          </div>

          <div>
            <label htmlFor="event-title" className="mb-2 block text-sm font-medium">
              Event title
            </label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Knight Hacks info session"
              required
            />
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Event type</span>
            <select
              value={form.eventType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  eventType: event.target.value as CampusEventType,
                }))
              }
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4"
            >
              {CAMPUS_EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <label htmlFor="event-host" className="mb-2 block text-sm font-medium">
              Host / club / organization (optional)
            </label>
            <Input
              id="event-host"
              value={form.host}
              onChange={(event) => setForm((current) => ({ ...current, host: event.target.value }))}
              placeholder="e.g. Pre-Med Society"
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
              placeholder="What should students know about this event?"
              required
            />
          </label>

          <div>
            <label htmlFor="event-location" className="mb-2 block text-sm font-medium">
              Location
            </label>
            <Input
              id="event-location"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="e.g. Student Union, Memory Mall"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="event-date" className="mb-2 block text-sm font-medium">
                Event date
              </label>
              <Input
                id="event-date"
                type="date"
                value={form.eventDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventDate: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="event-start" className="mb-2 block text-sm font-medium">
                Start time
              </label>
              <Input
                id="event-start"
                value={form.eventTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventTime: event.target.value }))
                }
                placeholder="6:00 PM"
              />
            </div>
            <div>
              <label htmlFor="event-end" className="mb-2 block text-sm font-medium">
                End time
              </label>
              <Input
                id="event-end"
                value={form.eventEndTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventEndTime: event.target.value }))
                }
                placeholder="9:00 PM"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-external-url" className="mb-2 block text-sm font-medium">
              External URL (optional)
            </label>
            <Input
              id="event-external-url"
              type="url"
              value={form.externalUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, externalUrl: event.target.value }))
              }
              placeholder="https://example.com/event"
            />
            <p className="mt-1 text-xs text-muted">
              Knight Market cannot verify external event pages yet.
            </p>
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
            ? "Post event"
            : "Save changes"}
      </Button>
    </form>
  );
}
