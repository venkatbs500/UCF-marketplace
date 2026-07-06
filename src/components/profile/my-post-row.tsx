"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatRelativeTime } from "@/lib/utils";

type MyPostRowProps = {
  title: string;
  href: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: string;
  editHref?: string;
  statusActionLabel?: string;
  onStatusAction?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  testId?: string;
};

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function MyPostRow({
  title,
  href,
  status,
  createdAt,
  updatedAt,
  metadata,
  editHref,
  statusActionLabel,
  onStatusAction,
  onDelete,
  deleteLabel = "Delete",
  testId,
}: MyPostRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusAction = async () => {
    if (!onStatusAction) return;
    setActing(true);
    setActionError(null);
    try {
      await onStatusAction();
    } catch {
      setActionError("We could not update this post.");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setActing(true);
    setActionError(null);
    try {
      await onDelete();
      setConfirmDelete(false);
    } catch {
      setActionError("We could not delete this post.");
    } finally {
      setActing(false);
    }
  };

  const isActive = status === "active";

  return (
    <>
      <Card data-testid={testId}>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Link href={href} className="font-medium hover:text-gold">
                {title}
              </Link>
              <Badge variant={isActive ? "success" : "warning"}>
                {formatStatusLabel(status)}
              </Badge>
            </div>
            {metadata && <p className="text-sm text-muted">{metadata}</p>}
            <p className="mt-1 text-xs text-muted">
              Posted {formatDate(createdAt)}
              {updatedAt && updatedAt !== createdAt
                ? ` · Updated ${formatRelativeTime(updatedAt)}`
                : ""}
            </p>
            {actionError && (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {actionError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={href}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
            {editHref && (
              <Link href={editHref}>
                <Button variant="secondary" size="sm" className="gap-1">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            )}
            {onStatusAction && statusActionLabel && isActive && (
              <Button
                variant="secondary"
                size="sm"
                disabled={acting}
                onClick={() => void handleStatusAction()}
              >
                {statusActionLabel}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                disabled={acting}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this post?"
        description="This will remove it from Knight Market. You can create a new one later."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmTestId="confirm-delete-post"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
