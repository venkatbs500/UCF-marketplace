import { AppShell } from "@/components/layout/app-shell";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryStrip } from "@/components/home/category-strip";
import { ProductPreviewGrid } from "@/components/home/product-preview-grid";
import { CampusModules } from "@/components/home/campus-modules";
import { AIPreview } from "@/components/home/ai-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustSection } from "@/components/home/trust-section";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-16">
        <HeroSection />
        <CategoryStrip />
        <ProductPreviewGrid />
        <CampusModules />
        <AIPreview />
        <HowItWorks />
        <TrustSection />
      </div>
    </AppShell>
  );
}
