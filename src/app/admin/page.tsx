import { Suspense } from "react";
import { AdminAccessGate } from "@/components/auth/admin-access-gate";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPage() {
  return (
    <div className="page-container py-10">
      <Suspense
        fallback={
          <LoadingSpinner className="min-h-[50vh]" label="Checking admin access..." />
        }
      >
        <AdminAccessGate />
      </Suspense>
    </div>
  );
}
