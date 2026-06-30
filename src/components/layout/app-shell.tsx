import { TopNav, TrustBanner } from "./top-nav";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TrustBanner />
      <TopNav />
      <main className="flex-1 pb-20 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
