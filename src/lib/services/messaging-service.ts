import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import type {
  ConversationPreview,
  MessageThreadItem,
  UnreadSummary,
} from "./supabase-messaging-types";
import {
  getConversation,
  getConversationUnreadCount,
  getMyConversations,
  getOrCreateListingConversation,
  getUnreadConversationCount,
  getUnreadConversationIds,
  getUnreadSummary,
  markConversationRead,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
} from "./supabase-messaging-service";

export type { ConversationPreview, MessageThreadItem, UnreadSummary };

export {
  usesSupabaseMessaging,
  subscribeToConversations,
  subscribeToMessages,
};

export const supabaseMessagingService = {
  getMyConversations,
  getConversation,
  getOrCreateListingConversation,
  sendMessage,
  getUnreadConversationCount,
  getConversationUnreadCount,
  markConversationRead,
  getUnreadConversationIds,
  getUnreadSummary,
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
