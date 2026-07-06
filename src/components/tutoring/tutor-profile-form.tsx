"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  TUTORING_FORMAT_OPTIONS,
  type CreateTutorProfileInput,
  type TutorProfileItem,
  type TutoringFormat,
  type UpdateTutorProfileInput,
} from "@/lib/services/tutoring-types";
import { createTutorProfile, updateTutorProfile } from "@/lib/services/tutoring-service";

type TutorProfileFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialProfile?: TutorProfileItem;
};

type FormState = {
  displayName: string;
  subjects: string;
  bio: string;
  hourlyRate: string;
  availability: string;
  tutoringFormat: TutoringFormat;
  experience: string;
  meetingPreference: string;
};

function toFormState(profile?: TutorProfileItem): FormState {
  return {
    displayName: profile?.displayName ?? "",
    subjects: profile?.subjects.join(", ") ?? "",
    bio: profile?.bio ?? "",
    hourlyRate: profile?.hourlyRate != null ? String(profile.hourlyRate) : "",
    availability: profile?.availability.join(", ") ?? "",
    tutoringFormat: profile?.tutoringFormat ?? "both",
    experience: profile?.experience ?? "",
    meetingPreference: profile?.meetingPreference ?? "",
  };
}

export function TutorProfileForm({ userId, mode, initialProfile }: TutorProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialProfile));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const subjects = form.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);
    const availability = form.availability
      .split(",")
      .map((slot) => slot.trim())
      .filter(Boolean);

    if (!form.bio.trim() || subjects.length === 0) {
      setError("Please add a bio and at least one subject.");
      return;
    }

    const hourlyRate = form.hourlyRate.trim() ? Number(form.hourlyRate) : null;
    if (form.hourlyRate.trim() && Number.isNaN(hourlyRate)) {
      setError("Please enter a valid hourly rate.");
      return;
    }

    setLoading(true);

    const payload: CreateTutorProfileInput = {
      userId,
      displayName: form.displayName.trim() || null,
      subjects,
      bio: form.bio,
      hourlyRate,
      availability,
      tutoringFormat: form.tutoringFormat,
      experience: form.experience,
      meetingPreference: form.meetingPreference,
      status: "active",
    };

    if (mode === "create") {
      const result = await createTutorProfile(payload);
      setLoading(false);
      if (!result.profile) {
        setError(result.error ?? "We could not create your tutor profile.");
        return;
      }
      router.push(`/tutoring/${result.profile.id}`);
      return;
    }

    if (!initialProfile) {
      setLoading(false);
      setError("Missing tutor profile to edit.");
      return;
    }

    const updatePayload: UpdateTutorProfileInput = { ...payload };
    const result = await updateTutorProfile(initialProfile.id, userId, updatePayload);
    setLoading(false);
    if (!result.profile) {
      setError(result.error ?? "We could not update your tutor profile.");
      return;
    }
    router.push(`/tutoring/${result.profile.id}`);
  };

  return (
    <Card className="border-gold/20">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="tutor-profile-form">
          <div>
            <label htmlFor="tutor-display-name" className="mb-2 block text-sm font-medium">
              Display name
            </label>
            <Input
              id="tutor-display-name"
              value={form.displayName}
              onChange={(event) => setForm((c) => ({ ...c, displayName: event.target.value }))}
              placeholder="Optional — defaults to your profile name"
            />
          </div>

          <div>
            <label htmlFor="tutor-subjects" className="mb-2 block text-sm font-medium">
              Subjects / courses
            </label>
            <Input
              id="tutor-subjects"
              value={form.subjects}
              onChange={(event) => setForm((c) => ({ ...c, subjects: event.target.value }))}
              placeholder="Calculus, Physics, Computer Science"
              required
            />
            <p className="mt-1 text-xs text-muted">Separate subjects with commas.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tutor-rate" className="mb-2 block text-sm font-medium">
                Hourly rate
              </label>
              <Input
                id="tutor-rate"
                type="number"
                min="0"
                step="1"
                value={form.hourlyRate}
                onChange={(event) => setForm((c) => ({ ...c, hourlyRate: event.target.value }))}
                placeholder="25"
              />
            </div>
            <div>
              <label htmlFor="tutor-format" className="mb-2 block text-sm font-medium">
                Tutoring format
              </label>
              <select
                id="tutor-format"
                value={form.tutoringFormat}
                onChange={(event) =>
                  setForm((c) => ({
                    ...c,
                    tutoringFormat: event.target.value as TutoringFormat,
                  }))
                }
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                {TUTORING_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tutor-availability" className="mb-2 block text-sm font-medium">
              Availability
            </label>
            <Input
              id="tutor-availability"
              value={form.availability}
              onChange={(event) => setForm((c) => ({ ...c, availability: event.target.value }))}
              placeholder="Mon 2-6pm, Wed 3-7pm"
            />
            <p className="mt-1 text-xs text-muted">Separate time slots with commas.</p>
          </div>

          <div>
            <label htmlFor="tutor-bio" className="mb-2 block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="tutor-bio"
              value={form.bio}
              onChange={(event) => setForm((c) => ({ ...c, bio: event.target.value }))}
              rows={4}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Tell students about your tutoring style and experience."
            />
          </div>

          <div>
            <label htmlFor="tutor-experience" className="mb-2 block text-sm font-medium">
              Experience / credentials
            </label>
            <textarea
              id="tutor-experience"
              value={form.experience}
              onChange={(event) => setForm((c) => ({ ...c, experience: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Optional — relevant coursework, certifications, or tutoring history"
            />
          </div>

          <div>
            <label htmlFor="tutor-meeting" className="mb-2 block text-sm font-medium">
              Meeting preference
            </label>
            <Input
              id="tutor-meeting"
              value={form.meetingPreference}
              onChange={(event) =>
                setForm((c) => ({ ...c, meetingPreference: event.target.value }))
              }
              placeholder="Library, Zoom, campus study rooms..."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? mode === "create"
                ? "Creating profile..."
                : "Saving changes..."
              : mode === "create"
                ? "Become a tutor"
                : "Save tutor profile"}
          </Button>

          <p className="text-xs text-muted">
            Booking and payments are coming later. Students can message you to coordinate sessions.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
