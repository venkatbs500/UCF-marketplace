"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  STUDENT_DISCOUNT_TYPE_OPTIONS,
  type CreateStudentDiscountInput,
  type StudentDiscountRecord,
  type StudentDiscountType,
  type UpdateStudentDiscountInput,
} from "@/lib/services/discounts-types";
import { createStudentDiscount, updateStudentDiscount } from "@/lib/services/discounts-service";

type StudentDiscountFormProps = {
  userId: string;
  mode: "create" | "edit";
  initialDiscount?: StudentDiscountRecord;
};

type FormState = {
  title: string;
  businessName: string;
  discountType: StudentDiscountType;
  discountValue: string;
  promoCode: string;
  redemptionUrl: string;
  location: string;
  isOnline: boolean;
  expiresAt: string;
  description: string;
  redemptionInstructions: string;
};

function toFormState(discount?: StudentDiscountRecord): FormState {
  return {
    title: discount?.title ?? "",
    businessName: discount?.businessName ?? "",
    discountType: discount?.discountType ?? "food",
    discountValue: discount?.discountValue ?? "",
    promoCode: discount?.promoCode ?? "",
    redemptionUrl: discount?.redemptionUrl ?? "",
    location: discount?.location ?? "",
    isOnline: discount?.isOnline ?? false,
    expiresAt: discount?.expiresAt?.split("T")[0] ?? "",
    description: discount?.description ?? "",
    redemptionInstructions: discount?.redemptionInstructions ?? "",
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

export function StudentDiscountForm({
  userId,
  mode,
  initialDiscount,
}: StudentDiscountFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialDiscount));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (
      !form.title.trim() ||
      !form.businessName.trim() ||
      !form.discountValue.trim() ||
      !form.description.trim()
    ) {
      setError("Please fill in title, business, offer, and description.");
      return;
    }

    if (!form.isOnline && !form.location.trim()) {
      setError("Please add a location or mark the deal as online.");
      return;
    }

    if (form.redemptionUrl.trim() && !isValidUrl(form.redemptionUrl.trim())) {
      setError("Please enter a valid redemption URL (http or https).");
      return;
    }

    setLoading(true);

    const expiresAt = form.expiresAt.trim()
      ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
      : null;

    if (mode === "create") {
      const input: CreateStudentDiscountInput = {
        postedBy: userId,
        title: form.title,
        businessName: form.businessName,
        description: form.description,
        discountType: form.discountType,
        discountValue: form.discountValue,
        promoCode: form.promoCode.trim() || null,
        redemptionUrl: form.redemptionUrl.trim() || null,
        location: form.location,
        isOnline: form.isOnline,
        expiresAt,
        redemptionInstructions: form.redemptionInstructions,
        status: "active",
      };
      const result = await createStudentDiscount(input);
      setLoading(false);
      if (!result.discount) {
        setError(result.error ?? "We could not post this discount.");
        return;
      }
      router.push(`/discounts/${result.discount.id}`);
      return;
    }

    if (!initialDiscount) return;

    const input: UpdateStudentDiscountInput = {
      title: form.title,
      businessName: form.businessName,
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountValue,
      promoCode: form.promoCode.trim() || null,
      redemptionUrl: form.redemptionUrl.trim() || null,
      location: form.location,
      isOnline: form.isOnline,
      expiresAt,
      redemptionInstructions: form.redemptionInstructions,
    };
    const result = await updateStudentDiscount(initialDiscount.id, userId, input);
    setLoading(false);
    if (!result.discount) {
      setError(result.error ?? "We could not update this discount.");
      return;
    }
    router.push(`/discounts/${result.discount.id}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="discount-title" className="mb-1 block text-sm font-medium">
              Deal title
            </label>
            <Input
              id="discount-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Student lunch special"
              required
            />
          </div>

          <div>
            <label htmlFor="discount-business" className="mb-1 block text-sm font-medium">
              Business / organization
            </label>
            <Input
              id="discount-business"
              value={form.businessName}
              onChange={(event) =>
                setForm((current) => ({ ...current, businessName: event.target.value }))
              }
              placeholder="Campus Coffee Co."
              required
            />
          </div>

          <div>
            <label htmlFor="discount-type" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              id="discount-type"
              value={form.discountType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountType: event.target.value as StudentDiscountType,
                }))
              }
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm"
            >
              {STUDENT_DISCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="discount-value" className="mb-1 block text-sm font-medium">
              Offer summary
            </label>
            <Input
              id="discount-value"
              value={form.discountValue}
              onChange={(event) =>
                setForm((current) => ({ ...current, discountValue: event.target.value }))
              }
              placeholder="15% off with student ID"
              required
            />
          </div>

          <div>
            <label htmlFor="discount-promo" className="mb-1 block text-sm font-medium">
              Promo code (optional)
            </label>
            <Input
              id="discount-promo"
              value={form.promoCode}
              onChange={(event) =>
                setForm((current) => ({ ...current, promoCode: event.target.value }))
              }
              placeholder="KNIGHT15"
            />
          </div>

          <div>
            <label htmlFor="discount-url" className="mb-1 block text-sm font-medium">
              Redemption URL (optional)
            </label>
            <Input
              id="discount-url"
              type="url"
              value={form.redemptionUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, redemptionUrl: event.target.value }))
              }
              placeholder="https://example.com/student-deal"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isOnline}
              onChange={(event) =>
                setForm((current) => ({ ...current, isOnline: event.target.checked }))
              }
              className="rounded border-white/20"
            />
            Online deal
          </label>

          <div>
            <label htmlFor="discount-location" className="mb-1 block text-sm font-medium">
              Location
            </label>
            <Input
              id="discount-location"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Knights Plaza or online"
            />
          </div>

          <div>
            <label htmlFor="discount-expires" className="mb-1 block text-sm font-medium">
              Expiry date (optional)
            </label>
            <Input
              id="discount-expires"
              type="date"
              value={form.expiresAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, expiresAt: event.target.value }))
              }
            />
          </div>

          <div>
            <label htmlFor="discount-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="discount-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              placeholder="What students get and any limits"
              required
            />
          </div>

          <div>
            <label htmlFor="discount-instructions" className="mb-1 block text-sm font-medium">
              Redemption instructions
            </label>
            <textarea
              id="discount-instructions"
              value={form.redemptionInstructions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  redemptionInstructions: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              placeholder="Show student ID at checkout, mention Knight Market, etc."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "create"
                ? "Posting…"
                : "Saving…"
              : mode === "create"
                ? "Post discount"
                : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
