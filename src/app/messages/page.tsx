"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Shield, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RealMessagesInbox } from "@/components/messages/real-messages-inbox";
import { useUnreadMessages } from "@/components/providers/unread-messages-provider";
import { UnreadBadge } from "@/components/ui/unread-badge";
import type { MessagePreview } from "@/lib/types";
import { messagePreviews } from "@/lib/mock-data";
import { formatRelativeTime, cn } from "@/lib/utils";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseMessaging } from "@/lib/messaging-mode";

function demoContextLabel(contextType: MessagePreview["contextType"]): string {
  if (contextType === "housing") return "Housing";
  if (contextType === "listing") return "Marketplace";
  if (contextType === "tutoring") return "Tutoring";
  if (contextType === "lost-found") return "Lost & Found";
  if (contextType === "jobs") return "Jobs";
  if (contextType === "events") return "Events";
  if (contextType === "discounts") return "Discounts";
  return "General";
}

type DemoThreadMessage = {
  id: string;
  body: string;
  isOwnMessage: boolean;
  timestamp: string;
};

function buildDemoThread(preview: MessagePreview): DemoThreadMessage[] {
  return [
    {
      id: `${preview.id}-in`,
      body: preview.lastMessage,
      isOwnMessage: false,
      timestamp: preview.timestamp,
    },
    {
      id: `${preview.id}-out`,
      body: "Sounds good — thanks for reaching out!",
      isOwnMessage: true,
      timestamp: preview.timestamp,
    },
  ];
}

function DemoMessagesContent() {
  const searchParams = useSearchParams();
  const conversationFromUrl = searchParams.get("conversation");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(() => new Set());
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState<string | null>(null);
  const [pendingHideId, setPendingHideId] = useState<string | null>(null);
  const { markDemoConversationRead, isDemoConversationUnread } = useUnreadMessages();

  const visiblePreviews = messagePreviews.filter((preview) => !hiddenIds.has(preview.id));

  const activeId =
    (pickedId && !hiddenIds.has(pickedId) ? pickedId : null) ??
    visiblePreviews.find((preview) => preview.id === conversationFromUrl)?.id ??
    visiblePreviews[0]?.id;
  const active = visiblePreviews.find((m) => m.id === activeId);

  const handleSelect = (id: string) => {
    setPickedId(id);
    if (messagePreviews.find((preview) => preview.id === id)?.unread) {
      markDemoConversationRead(id);
    }
  };

  useEffect(() => {
    if (activeId && messagePreviews.find((preview) => preview.id === activeId)?.unread) {
      markDemoConversationRead(activeId);
    }
  }, [activeId, markDemoConversationRead]);

  const confirmDeleteMessage = () => {
    if (!pendingDeleteMessageId) return;
    setDeletedMessageIds((current) => {
      const next = new Set(current);
      next.add(pendingDeleteMessageId);
      return next;
    });
    setPendingDeleteMessageId(null);
  };

  const confirmHideConversation = () => {
    if (!pendingHideId) return;
    setHiddenIds((current) => {
      const next = new Set(current);
      next.add(pendingHideId);
      return next;
    });
    if (pickedId === pendingHideId) setPickedId(null);
    setPendingHideId(null);
  };

  const threadMessages = active ? buildDemoThread(active) : [];

  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <SectionHeading
          title="Messages"
          subtitle="Chat with sellers, tutors, and roommates"
        />
        <DemoModeBadge />
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <Shield className="h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm text-muted">
          Chats are between verified students. Report unsafe messages. Knight Market only
          reviews message content when needed for safety reports.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:glass-card lg:h-[calc(100vh-280px)]">
        <div
          className="space-y-2 lg:col-span-1 lg:border-r lg:border-white/10 lg:p-4 lg:overflow-y-auto"
          data-testid="messages-conversation-list"
        >
          {visiblePreviews.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => handleSelect(msg.id)}
              data-testid={`conversation-${msg.id}`}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-colors",
                activeId === msg.id
                  ? "bg-gold/10 border border-gold/20"
                  : "glass-card hover:bg-white/5"
              )}
            >
              <Avatar
                initials={msg.participant.avatar}
                size="md"
                verified={msg.participant.verified}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{msg.participant.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {isDemoConversationUnread(msg.id) && <UnreadBadge count={1} />}
                    <span className="text-xs text-muted">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="my-1 text-[10px]" data-testid="conversation-context-label">
                  {demoContextLabel(msg.contextType)}
                </Badge>
                <Badge variant="outline" className="my-1 ml-1 text-[10px]">
                  {msg.context}
                </Badge>
                <p
                  className={cn(
                    "truncate text-sm",
                    msg.unread ? "font-medium text-foreground" : "text-muted"
                  )}
                >
                  {msg.lastMessage}
                </p>
              </div>
              {isDemoConversationUnread(msg.id) && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" />
              )}
            </button>
          ))}
          {visiblePreviews.length === 0 && (
            <p className="p-4 text-sm text-muted" data-testid="demo-empty-conversations">
              No conversations in your inbox.
            </p>
          )}
        </div>

        <div className="hidden lg:col-span-2 lg:flex lg:flex-col" data-testid="messages-thread-panel">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <Avatar
                  initials={active.participant.avatar}
                  size="md"
                  verified={active.participant.verified}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{active.participant.name}</p>
                  <p className="text-xs text-muted">Re: {active.context}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto gap-1.5"
                  onClick={() => setPendingHideId(active.id)}
                  data-testid="delete-conversation-button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete conversation
                </Button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadMessages.map((message) => {
                  const isDeleted = deletedMessageIds.has(message.id);
                  return (
                    <div
                      key={message.id}
                      className={cn("flex", message.isOwnMessage ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.isOwnMessage ? "bg-gold/20 text-foreground" : "bg-white/5 text-foreground",
                          isDeleted && "opacity-70"
                        )}
                        data-testid={`message-${message.id}`}
                      >
                        <p className={cn(isDeleted && "italic text-muted")}>
                          {isDeleted ? "Message deleted" : message.body}
                        </p>
                        <p className="mt-1 text-[10px] text-muted">
                          {formatRelativeTime(message.timestamp)}
                        </p>
                        {message.isOwnMessage && !isDeleted && (
                          <div className="mt-1 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5"
                              onClick={() => setPendingDeleteMessageId(message.id)}
                              data-testid={`message-delete-${message.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        )}
                        {!message.isOwnMessage && !isDeleted && (
                          <div className="mt-1 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5"
                              disabled
                              data-testid={`message-report-${message.id}`}
                            >
                              Report
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                  <input
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    disabled
                  />
                  <button
                    type="button"
                    className="rounded-2xl gold-gradient px-4 py-2 text-sm font-medium text-black opacity-50"
                    disabled
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted">
              Select a conversation
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteMessageId)}
        title="Delete this message?"
        description="This deletes the message for everyone in the chat. The other person will see “Message deleted.” This cannot be undone."
        confirmLabel="Delete message"
        cancelLabel="Cancel"
        confirmTestId="confirm-delete-message"
        destructive
        onConfirm={confirmDeleteMessage}
        onCancel={() => setPendingDeleteMessageId(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingHideId)}
        title="Delete this conversation?"
        description="This removes the conversation from your inbox. It will not delete it for the other person, and it can reappear if they send a new message."
        confirmLabel="Delete conversation"
        cancelLabel="Cancel"
        confirmTestId="confirm-hide-conversation"
        destructive
        onConfirm={confirmHideConversation}
        onCancel={() => setPendingHideId(null)}
      />
    </AppShell>
  );
}

function MessagesContent() {
  if (usesSupabaseMessaging()) {
    return <RealMessagesInbox />;
  }
  if (isDemoDataEnabled()) {
    return <DemoMessagesContent />;
  }
  return (
    <AppShell>
      <SectionHeading
        title="Messages"
        subtitle="Chat with verified UCF students"
      />
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="When you contact a seller, your conversations will appear here."
        action={
          <Link href="/marketplace">
            <Button>Browse marketplace</Button>
          </Link>
        }
      />
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <AppShell>
            <LoadingSpinner className="min-h-[40vh]" label="Loading messages..." />
          </AppShell>
        }
      >
        <MessagesContent />
      </Suspense>
    </AuthGuard>
  );
}
