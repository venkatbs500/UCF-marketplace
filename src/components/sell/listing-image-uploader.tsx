"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  validateListingImage,
  validateListingImageCount,
} from "@/lib/services/supabase-image-service";

interface ListingImageUploaderProps {
  files: File[];
  previewUrls: string[];
  onChange: (files: File[]) => void;
  error?: string | null;
}

export function ListingImageUploader({
  files,
  previewUrls,
  onChange,
  error,
}: ListingImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handleSelect = (incoming: FileList | null) => {
    if (!incoming) return;
    setLocalError(null);

    const next = [...files, ...Array.from(incoming)];
    const countError = validateListingImageCount(next.length);
    if (countError) {
      setLocalError(countError);
      return;
    }

    for (const file of Array.from(incoming)) {
      const validationError = validateListingImage(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
    }

    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Listing preview ${index + 1}`}
              className="aspect-square h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {files.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 text-sm text-muted transition-colors hover:bg-white/10"
            )}
          >
            <ImagePlus className="h-6 w-6" />
            Add image
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleSelect(event.target.files)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload photos
        </Button>
        <p className="text-xs text-muted">JPEG, PNG, or WebP · up to 5 images · 5 MB each</p>
      </div>

      {displayError && (
        <p role="alert" className="text-sm text-red-400">
          {displayError}
        </p>
      )}
    </div>
  );
}
