import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PublishSuccessCardProps {
  sellerId?: string;
  onCreateAnother?: () => void;
  onDismiss?: () => void;
}

export function PublishSuccessCard({
  sellerId,
  onCreateAnother,
  onDismiss,
}: PublishSuccessCardProps) {
  return (
    <Card className="max-w-lg border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
      <CardContent className="py-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-gold" />
        <h2 className="mb-2 text-2xl font-bold">Listing Published!</h2>
        <p className="mb-6 text-sm text-muted">
          Your listing is now live on Knight Market. Verified students can browse and message you.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/marketplace" onClick={onDismiss}>
            <Button className="w-full sm:w-auto">View Marketplace</Button>
          </Link>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCreateAnother}
          >
            Create Another Listing
          </Button>
          {sellerId ? (
            <Link href={`/sellers/${sellerId}`} onClick={onDismiss}>
              <Button variant="outline" className="w-full sm:w-auto">
                View Seller Profile
              </Button>
            </Link>
          ) : (
            <Link href="/profile" onClick={onDismiss}>
              <Button variant="outline" className="w-full sm:w-auto">
                View Profile
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
