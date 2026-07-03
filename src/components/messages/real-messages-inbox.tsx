"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, RefreshCw, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getConversation,
  getMyConversations,
  sendMessage,
} from "@/lib/services/supabase-messaging-service";
import type {
  ConversationPreview,
  MessageThreadItem,
} from "@/lib/services/supabase-messaging-types";
import { formatRelativeTime, cn } from "@/lib/utils";

type ThreadData = {
  conversationId: string;
  conversation: ConversationPreview;
  messages: MessageThreadItem[];
};

export function RealMessagesInbox() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("conversation");
  const userId = user?.id;

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    void getMyConversations(userId).then((result) => {
      if (cancelled) return;
      setConversations(result.conversations);
      setListError(result.error ?? null);
      setListLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!selectedId || !userId) return;

    let cancelled = false;

    void getConversation(selectedId, userId).then((result) => {
      if (cancelled) return;
      if (!result.conversation) {
        setThreadData(null);
        setThreadError(result.error ?? "Conversation not found.");
        return;
      }
      setThreadData({
        conversationId: selectedId,
        conversation: result.conversation,
        messages: result.messages,
      });
      setThreadError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId, userId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadData?.messages]);

  const threadLoading =
    Boolean(selectedId) &&
    threadData?.conversationId !== selectedId &&
    !threadError;

  const activeConversation =
    threadData?.conversationId === selectedId ? threadData.conversation : null;
  const messages =
    threadData?.conversationId === selectedId ? threadData.messages : [];

  const showThreadOnMobile = Boolean(selectedId);

  const reloadConversations = async () => {
    if (!userId) return;
    const result = await getMyConversations(userId);
    setConversations(result.conversations);
    setListError(result.error ?? null);
  };

  const reloadThread = async (conversationId: string) => {
    if (!userId) return;
    const result = await getConversation(conversationId, userId);
    if (!result.conversation) {
      setThreadData(null);
      setThreadError(result.error ?? "Conversation not found.");
      return;
    }
    setThreadData({
      conversationId,
      conversation: result.conversation,
      messages: result.messages,
    });
    setThreadError(null);
  };

  const handleSelectConversation = (id: string) => {
    router.replace(`/messages?conversation=${id}`, { scroll: false });
  };

  const handleSend = async () => {
    if (!userId || !selectedId || sending) return;
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setSendError(null);
    const result = await sendMessage(selectedId, userId, body);
    setSending(false);

    if (!result.message) {
      setSendError(result.error ?? "We could not send your message.");
      return;
    }

    setDraft("");
    setThreadData((current) =>
      current?.conversationId === selectedId
        ? { ...current, messages: [...current.messages, result.message!] }
        : current
    );
    await reloadConversations();
  };

  const handleRefresh = async () => {
    await reloadConversations();
    if (selectedId) {
      await reloadThread(selectedId);
    }
  };

  const emptyState = useMemo(
    () => (
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
    ),
    []
  );

  if (listLoading && conversations.length === 0) {
    return (
      <AppShell>
        <LoadingSpinner className="min-h-[40vh]" label="Loading messages..." />
      </AppShell>
    );
  }

  if (!listLoading && conversations.length === 0 && !selectedId) {
    return (
      <AppShell>
        <SectionHeading
          title="Messages"
          subtitle="Chat with verified UCF students"
        />
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <Shield className="h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-muted">
            Messages are limited to verified students to reduce spam.
          </p>
        </div>
        {listError && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            {listError}
          </p>
        )}
        {emptyState}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Messages"
          subtitle="Chat with verified UCF students"
        />
        <Button variant="outline" size="sm" onClick={() => void handleRefresh()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <Shield className="h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm text-muted">
          Messages are limited to verified students to reduce spam.
        </p>
      </div>

      {listError && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          We could not load conversations. Please try again.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:glass-card lg:h-[calc(100vh-280px)]">
        <div
          className={cn(
            "space-y-2 lg:col-span-1 lg:border-r lg:border-white/10 lg:p-4 lg:overflow-y-auto",
            showThreadOnMobile && "hidden lg:block"
          )}
          data-testid="messages-conversation-list"
        >
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => handleSelectConversation(conversation.id)}
              data-testid={`conversation-${conversation.id}`}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-colors",
                selectedId === conversation.id
                  ? "border border-gold/20 bg-gold/10"
                  : "glass-card hover:bg-white/5"
              )}
            >
              <Avatar
                initials={conversation.otherParticipant.avatarInitials}
                size="md"
                verified={conversation.otherParticipant.isVerifiedStudent}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {conversation.otherParticipant.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeTime(conversation.lastMessageAt)}
                  </span>
                </div>
                {conversation.listingTitle && (
                  <Badge variant="outline" className="my-1 text-[10px]">
                    {conversation.listingTitle}
                  </Badge>
                )}
                <p className="truncate text-sm text-muted">{conversation.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>

        <div
          className={cn(
            "flex min-h-[420px] flex-col lg:col-span-2",
            !showThreadOnMobile && "hidden lg:flex"
          )}
          data-testid="messages-thread-panel"
        >
          {showThreadOnMobile && (
            <div className="mb-3 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.replace("/messages", { scroll: false })}
              >
                Back to conversations
              </Button>
            </div>
          )}

          {threadLoading ? (
            <LoadingSpinner className="flex-1" label="Loading conversation..." />
          ) : threadError && !activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-sm text-muted">{threadError}</p>
              <Button variant="outline" onClick={() => void handleRefresh()}>
                Try again
              </Button>
            </div>
          ) : activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <Avatar
                  initials={activeConversation.otherParticipant.avatarInitials}
                  size="md"
                  verified={activeConversation.otherParticipant.isVerifiedStudent}
                />
                <div>
                  <p className="font-semibold">{activeConversation.otherParticipant.name}</p>
                  <p className="text-xs text-muted">
                    {activeConversation.listingTitle
                      ? `Re: ${activeConversation.listingTitle}`
                      : "Marketplace conversation"}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        message.isOwnMessage
                          ? "bg-gold/20 text-foreground"
                          : "bg-white/5 text-foreground"
                      )}
                      data-testid={`message-${message.id}`}
                    >
                      <p>{message.body}</p>
                      <p className="mt-1 text-[10px] text-muted">
                        {formatRelativeTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>

              <div className="border-t border-white/10 p-4">
                {sendError && (
                  <p role="alert" className="mb-2 text-xs text-red-400">
                    {sendError}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    data-testid="message-input"
                  />
                  <Button
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                    data-testid="send-message-button"
                  >
                    {sending ? "Sending..." : "Send"}
                  </Button>
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
