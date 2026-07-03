"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import {
  AUTH_ROUTES,
  consumeAuthRedirect,
  rememberAuthRedirect,
} from "@/lib/auth";
import {
  YEAR_OPTIONS,
  CAMPUS_AREA_OPTIONS,
  INTEREST_OPTIONS,
  type CampusAreaOption,
  type InterestOption,
  type YearOption,
} from "@/lib/onboarding-options";
import { cn } from "@/lib/utils";
import { TRUST_DISCLAIMER } from "@/lib/constants";

export function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOnboarding } = useAuth();
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState<YearOption | "">("");
  const [campusArea, setCampusArea] = useState<CampusAreaOption | "">("");
  const [interests, setInterests] = useState<InterestOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rememberAuthRedirect(searchParams.get("redirect"));
  }, [searchParams]);

  const toggleInterest = (interest: InterestOption) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!year || !campusArea) {
      setError("Please select your year and campus area.");
      return;
    }

    setLoading(true);
    const result = await completeOnboarding({
      name,
      major,
      year,
      campusArea,
      interests,
    });
    setLoading(false);

    if (result.success) {
      router.push(consumeAuthRedirect(AUTH_ROUTES.marketplace));
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Complete your profile</h1>
        <p className="text-sm text-muted">
          Help us personalize Knight Market for your campus life.
        </p>
      </div>

      <Card className="border-gold/20">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-gold" />
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="major" className="mb-2 block text-sm font-medium">
                Major
              </label>
              <Input
                id="major"
                placeholder="Computer Science"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Year</label>
              <div className="flex flex-wrap gap-2">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={cn(
                      "rounded-2xl px-3 py-1.5 text-xs font-medium transition-all",
                      year === y
                        ? "gold-gradient text-black"
                        : "glass-card text-muted hover:text-foreground"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="campusArea" className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-gold" />
                Campus Area
              </label>
              <select
                id="campusArea"
                value={campusArea}
                onChange={(e) => setCampusArea(e.target.value as CampusAreaOption)}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                required
              >
                <option value="">Select your area</option>
                {CAMPUS_AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Interests <span className="text-muted">(select at least one)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "rounded-2xl px-3 py-1.5 text-xs font-medium transition-all",
                      interests.includes(interest)
                        ? "gold-gradient text-black"
                        : "glass-card text-muted hover:text-foreground"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Setting up..." : "Join Knight Market"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Badge variant="secondary">Verified student safety</Badge>
        <Badge variant="outline">No spam, no randos</Badge>
      </div>

      <p className="mt-6 text-center text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </motion.div>
  );
}
