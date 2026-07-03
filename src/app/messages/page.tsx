"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { MessageCircle, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoModeBadge } from "@/components/ui/demo-mode-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RealMessagesInbox } from "@/components/messages/real-messages-inbox";
import { messagePreviews } from "@/lib/mock-data";
import { formatRelativeTime, cn } from "@/lib/utils";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseMessaging } from "@/lib/messaging-mode";

function DemoMessagesContent() {
  const [activeId, setActiveId] = useState(messagePreviews[0]?.id);
  const active = messagePreviews.find((m) => m.id === activeId);

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
          Messages are limited to verified students to reduce spam.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:glass-card lg:h-[calc(100vh-280px)]">
        <div className="space-y-2 lg:col-span-1 lg:border-r lg:border-white/10 lg:p-4 lg:overflow-y-auto">
          {messagePreviews.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => setActiveId(msg.id)}
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
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeTime(msg.timestamp)}
                  </span>
                </div>
                <Badge variant="outline" className="my-1 text-[10px]">
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
              {msg.unread && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>

        <div className="hidden lg:col-span-2 lg:flex lg:flex-col">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <Avatar
                  initials={active.participant.avatar}
                  size="md"
                  verified={active.participant.verified}
                />
                <div>
                  <p className="font-semibold">{active.participant.name}</p>
                  <p className="text-xs text-muted">Re: {active.context}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="mb-4 h-12 w-12 text-gold/30" />
                <p className="mb-2 font-medium">Chat Preview</p>
                <p className="max-w-sm text-sm text-muted">
                  Demo inbox preview. Real messaging is enabled in Supabase real mode.
                </p>
                <Card className="mt-6 max-w-md text-left">
                  <p className="mb-2 text-xs text-muted">
                    {active.participant.name} · {formatRelativeTime(active.timestamp)}
                  </p>
                  <p className="text-sm">{active.lastMessage}</p>
                </Card>
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
