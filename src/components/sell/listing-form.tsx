"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPUS_AREA_OPTIONS } from "@/lib/onboarding-options";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";
import { MOCK_IMAGE_PLACEHOLDERS, PICKUP_OPTIONS } from "@/lib/marketplace-utils";
import { useUserListings } from "@/components/providers/user-listings-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SellProgress } from "./sell-progress";
import { cn } from "@/lib/utils";
import type { ListingCondition, MarketplaceCategory } from "@/lib/types";

export function ListingForm() {
  const router = useRouter();
  const { currentDraft, updateDraft } = useUserListings();
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !currentDraft.tags.includes(tag)) {
      updateDraft({ tags: [...currentDraft.tags, tag] });
    }
    setTagInput("");
  };

  const togglePickup = (option: string) => {
    const has = currentDraft.pickupOptions.includes(option);
    updateDraft({
      pickupOptions: has
        ? currentDraft.pickupOptions.filter((o) => o !== option)
        : [...currentDraft.pickupOptions, option],
    });
  };

  const toggleImage = (emoji: string) => {
    const has = currentDraft.images.includes(emoji);
    updateDraft({
      images: has
        ? currentDraft.images.filter((i) => i !== emoji)
        : [...currentDraft.images, emoji].slice(0, 5),
    });
  };

  const canContinueStep1 =
    currentDraft.title.trim() &&
    currentDraft.category &&
    currentDraft.condition &&
    currentDraft.price !== "" &&
    currentDraft.campusArea &&
    currentDraft.location.trim();

  const canContinueStep2 = currentDraft.description.trim().length >= 20;

  const goToPreview = () => {
    router.push("/sell/preview");
  };

  return (
    <div>
      <SellProgress currentStep={step} />

      {step === 1 && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-5 pt-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input
                placeholder="What are you selling?"
                value={currentDraft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sell-category" className="mb-2 block text-sm font-medium">Category</label>
                <select
                  id="sell-category"
                  value={currentDraft.category}
                  onChange={(e) =>
                    updateDraft({ category: e.target.value as MarketplaceCategory })
                  }
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {MARKETPLACE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sell-condition" className="mb-2 block text-sm font-medium">Condition</label>
                <select
                  id="sell-condition"
                  value={currentDraft.condition}
                  onChange={(e) =>
                    updateDraft({ condition: e.target.value as ListingCondition })
                  }
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={currentDraft.price}
                  onChange={(e) => updateDraft({ price: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={currentDraft.isNegotiable}
                    onChange={(e) => updateDraft({ isNegotiable: e.target.checked })}
                    className="rounded border-white/20"
                  />
                  Price is negotiable
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="sell-campus-area" className="mb-2 block text-sm font-medium">Campus Area</label>
              <select
                id="sell-campus-area"
                value={currentDraft.campusArea}
                onChange={(e) => updateDraft({ campusArea: e.target.value })}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                <option value="">Select area</option>
                {CAMPUS_AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Pickup Location</label>
              <Input
                placeholder="e.g. Libra, Knights Plaza"
                value={currentDraft.location}
                onChange={(e) => updateDraft({ location: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Pickup Options</label>
              <div className="flex flex-wrap gap-2">
                {PICKUP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => togglePickup(opt)}
                    className={cn(
                      "rounded-2xl px-3 py-1.5 text-xs font-medium",
                      currentDraft.pickupOptions.includes(opt)
                        ? "gold-gradient text-black"
                        : "glass-card text-muted"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-5 pt-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                rows={5}
                placeholder="Describe your item — condition, flaws, why you're selling..."
                value={currentDraft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                className="flex w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              />
              <p className="mt-1 text-xs text-muted">Minimum 20 characters</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. textbook, dorm"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              {currentDraft.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentDraft.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        updateDraft({
                          tags: currentDraft.tags.filter((t) => t !== tag),
                        })
                      }
                      className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!canContinueStep2}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-5 pt-6">
            <p className="text-sm text-muted">
              Select placeholder images for your listing. Real uploads coming soon.
            </p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {MOCK_IMAGE_PLACEHOLDERS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleImage(emoji)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-2xl text-3xl transition-all",
                    currentDraft.images.includes(emoji)
                      ? "bg-gold/20 ring-2 ring-gold"
                      : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)}>
                Continue to Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-5 pt-6 text-center">
            <p className="text-sm text-muted">
              Review your listing on the preview page before publishing.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1" onClick={goToPreview}>
                Open Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
