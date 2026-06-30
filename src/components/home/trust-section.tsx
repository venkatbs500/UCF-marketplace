import { Shield, Mail, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TRUST_DISCLAIMER } from "@/lib/constants";

const trustPoints = [
  {
    icon: Mail,
    title: "UCF Email Verification",
    description:
      "Only students with a verified @ucf.edu email can join. No randos, no scams.",
  },
  {
    icon: Shield,
    title: "Trust Score System",
    description:
      "Every user builds a trust score through verified transactions and reviews.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description:
      "Rate sellers, tutors, and roommates. Real feedback from real students.",
  },
  {
    icon: Users,
    title: "Student-Only Community",
    description:
      "A safe space built by students, for students. Not affiliated with UCF officially.",
  },
];

export function TrustSection() {
  return (
    <section className="rounded-3xl glass-card p-8 md:p-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold md:text-3xl">
          Built on <span className="text-gold-gradient">Trust</span>
        </h2>
        <p className="text-sm text-muted">
          Knight Market is designed to keep the campus community safe
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((point) => (
          <Card key={point.title} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
              <point.icon className="h-6 w-6 text-gold" />
            </div>
            <h3 className="mb-1 text-sm font-semibold">{point.title}</h3>
            <p className="text-xs text-muted">{point.description}</p>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted">{TRUST_DISCLAIMER}</p>
    </section>
  );
}
