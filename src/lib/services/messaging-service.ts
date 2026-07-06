import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import type { ConversationPreview } from "./supabase-messaging-types";
import {
  getConversation,
  getConversationUnreadCount,
  getMyConversations,
  getOrCreateHousingConversation,
  getOrCreateListingConversation,
  getOrCreateLostFoundConversation,
  getOrCreateCampusJobConversation,
  getOrCreateTutorConversation,
  getUnreadConversationCount,
  getUnreadConversationIds,
  getUnreadSummary,
  markConversationRead,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
} from "./supabase-messaging-service";

export type {
  ConversationContext,
  ConversationContextType,
  ConversationPreview,
  MessageThreadItem,
  UnreadSummary,
} from "./supabase-messaging-types";
export { getConversationContext } from "./supabase-messaging-types";

export {
  usesSupabaseMessaging,
  subscribeToConversations,
  subscribeToMessages,
};

export const DEMO_HOUSING_CONVERSATION_ID = "msg-3";
export const DEMO_TUTOR_CONVERSATION_ID = "msg-2";
export const DEMO_LOST_FOUND_CONVERSATION_ID = "msg-5";
export const DEMO_CAMPUS_JOB_CONVERSATION_ID = "msg-6";

export const supabaseMessagingService = {
  getMyConversations,
  getConversation,
  getOrCreateListingConversation,
  getOrCreateHousingConversation,
  getOrCreateLostFoundConversation,
  getOrCreateCampusJobConversation,
  getOrCreateTutorConversation,
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

export async function openDemoHousingConversation(
  housingPostId: string
): Promise<{ conversationId: string }> {
  void housingPostId;
  return { conversationId: DEMO_HOUSING_CONVERSATION_ID };
}

export async function openDemoTutorConversation(
  tutorProfileId: string
): Promise<{ conversationId: string }> {
  void tutorProfileId;
  return { conversationId: DEMO_TUTOR_CONVERSATION_ID };
}

export async function openDemoLostFoundConversation(
  itemId: string
): Promise<{ conversationId: string }> {
  void itemId;
  return { conversationId: DEMO_LOST_FOUND_CONVERSATION_ID };
}

export async function openDemoCampusJobConversation(
  jobId: string
): Promise<{ conversationId: string }> {
  void jobId;
  return { conversationId: DEMO_CAMPUS_JOB_CONVERSATION_ID };
}

export async function fetchMyConversationPreviews(
  userId: string
): Promise<{ conversations: ConversationPreview[]; error?: string }> {
  if (!usesSupabaseMessaging()) {
    return { conversations: [] };
  }
  return getMyConversations(userId);
}
