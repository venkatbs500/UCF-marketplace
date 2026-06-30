"use client";

import type { Tutor } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProtectedActionButton } from "@/components/auth/protected-action-button";
import { Star, Clock, BookOpen } from "lucide-react";

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="mb-4 flex items-center gap-3">
          <Avatar
            initials={tutor.user.avatar}
            size="lg"
            verified={tutor.user.verified}
          />
          <div className="flex-1">
            <h3 className="font-semibold">{tutor.user.name}</h3>
            <p className="text-xs text-muted">
              {tutor.user.major} · {tutor.user.year}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="font-medium">{tutor.rating}</span>
              <span className="text-muted">
                ({tutor.reviewCount} reviews · {tutor.sessionsCompleted} sessions)
              </span>
            </div>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted">{tutor.bio}</p>
        <div className="mb-3 flex flex-wrap gap-1">
          {tutor.subjects.map((s) => (
            <Badge key={s} variant="default">
              {s}
            </Badge>
          ))}
        </div>
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <Clock className="h-3 w-3" />
          {tutor.availability.join(" · ")}
        </div>
        <p className="text-lg font-bold text-gold">
          {formatPrice(tutor.hourlyRate)}/hr
        </p>
      </CardContent>
      <CardFooter className="border-t border-white/5 pt-3">
        <ProtectedActionButton size="sm" className="w-full" unlockedLabel="Ready">
          <BookOpen className="h-3.5 w-3.5" />
          Book Session
        </ProtectedActionButton>
      </CardFooter>
    </Card>
  );
}
