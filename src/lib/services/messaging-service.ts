import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import type {
  ConversationPreview,
  MessageThreadItem,
} from "./supabase-messaging-types";
import {
  getConversation,
  getMyConversations,
  getOrCreateListingConversation,
  sendMessage,
} from "./supabase-messaging-service";

export type { ConversationPreview, MessageThreadItem };

export { usesSupabaseMessaging };

export const supabaseMessagingService = {
  getMyConversations,
  getConversation,
  getOrCreateListingConversation,
  sendMessage,
};

export type MessagingService = typeof supabaseMessagingService;

export function getActiveMessagingService(): MessagingService {
  return supabaseMessagingService;
}

export async function fetchMyConversationPreviews(
  userId: string
): Promise<{ conversations: ConversationPreview[]; error?: string }> {
  if (!usesSupabaseMessaging()) {
    return { conversations: [] };
  }
  return getMyConversations(userId);
}
