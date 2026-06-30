import { UserPlus, Search, MessageCircle, Star } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Verify with UCF Email",
    description: "Sign up with your @ucf.edu email to join the verified student community.",
  },
  {
    icon: Search,
    step: "02",
    title: "Explore & Discover",
    description: "Browse marketplace listings, housing, tutors, jobs, events, and deals.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect Safely",
    description: "Message sellers, tutors, and roommates directly through the platform.",
  },
  {
    icon: Star,
    step: "04",
    title: "Build Your Trust Score",
    description: "Complete transactions, leave reviews, and grow your campus reputation.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold">How It Works</h2>
      <p className="mb-8 text-sm text-muted">Get started in minutes</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <div key={item.step} className="relative">
            <span className="mb-3 block text-3xl font-black text-gold/20">
              {item.step}
            </span>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <item.icon className="h-5 w-5 text-gold" />
            </div>
            <h3 className="mb-1 font-semibold">{item.title}</h3>
            <p className="text-sm text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
