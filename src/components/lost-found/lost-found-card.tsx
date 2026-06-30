import type { LostFoundItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface LostFoundCardProps {
  item: LostFoundItem;
}

export function LostFoundCard({ item }: LostFoundCardProps) {
  const isLost = item.status === "lost";

  return (
    <Card hover>
      <CardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold">{item.title}</h3>
          <Badge variant={isLost ? "warning" : "success"}>
            {isLost ? (
              <>
                <AlertCircle className="mr-1 h-3 w-3" /> Lost
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3" /> Found
              </>
            )}
          </Badge>
        </div>
        <p className="mb-3 text-sm text-muted">{item.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(item.date)}
          </span>
        </div>
        <Badge variant="outline" className="mt-2">
          {item.category}
        </Badge>
      </CardContent>
      <CardFooter className="justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar initials={item.reporter.avatar} size="sm" verified={item.reporter.verified} />
          <span className="text-xs">{item.reporter.name}</span>
        </div>
        <Button size="sm" variant="outline">
          {isLost ? "I Found This" : "Claim Item"}
        </Button>
      </CardFooter>
    </Card>
  );
}
