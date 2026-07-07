import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ConversationChangeCallback = () => void;
type MessageChangeCallback = () => void;

const conversationChannels = new Map<string, RealtimeChannel>();
const messageChannels = new Map<string, RealtimeChannel>();

function getClient(): SupabaseClient | null {
  return getSupabaseBrowserClient();
}

function removeChannel(key: string, registry: Map<string, RealtimeChannel>) {
  const client = getClient();
  const channel = registry.get(key);
  if (!channel || !client) return;
  void client.removeChannel(channel);
  registry.delete(key);
}

export function subscribeToConversations(
  userId: string,
  callback: ConversationChangeCallback
): () => void {
  const client = getClient();
  if (!client || !userId) return () => undefined;

  const key = `conversations:${userId}`;
  removeChannel(key, conversationChannels);

  const channel = client
    .channel(key)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `participant_ids=cs.{${userId}}`,
      },
      () => callback()
    )
    .subscribe();

  conversationChannels.set(key, channel);

  return () => {
    removeChannel(key, conversationChannels);
  };
}

export function subscribeToMessages(
  conversationId: string,
  callback: MessageChangeCallback
): () => void {
  const client = getClient();
  if (!client || !conversationId) return () => undefined;

  const key = `messages:${conversationId}`;
  removeChannel(key, messageChannels);

  const channel = client
    .channel(key)
    .on(
      "postgres_changes",
      {
        // INSERT (new message) and UPDATE (soft delete / moderation hide) so the
        // other participant sees "Message deleted" live without a manual refresh.
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => callback()
    )
    .subscribe();

  messageChannels.set(key, channel);

  return () => {
    removeChannel(key, messageChannels);
  };
}

export function unsubscribeAllMessagingRealtime(): void {
  for (const key of [...conversationChannels.keys()]) {
    removeChannel(key, conversationChannels);
  }
  for (const key of [...messageChannels.keys()]) {
    removeChannel(key, messageChannels);
  }
}
