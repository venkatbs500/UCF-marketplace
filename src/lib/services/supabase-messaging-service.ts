import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  mapConversationRowToPreview,
  mapMessageRowToThreadItem,
  mapProfileToParticipant,
  type ConversationPreview,
  type ConversationWithListingRow,
  type MessageRow,
  type MessageThreadItem,
} from "./supabase-messaging-types";

const MAX_MESSAGE_LENGTH = 1000;

function mapSupabaseError(error: { message?: string } | null): string {
  const message = error?.message?.trim();
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  return "Something went wrong. Please try again.";
}

async function fetchProfilesByIds(ids: string[]): Promise<Map<string, ProfileRow>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, ProfileRow>();
  if (!client || ids.length === 0) return map;

  const { data } = await client.from("profiles").select("*").in("id", [...new Set(ids)]);
  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(row.id, row);
  }
  return map;
}

function latestMessageByConversation(
  messages: MessageRow[]
): Map<string, MessageRow> {
  const map = new Map<string, MessageRow>();
  for (const message of messages) {
    const existing = map.get(message.conversation_id);
    if (!existing || message.created_at > existing.created_at) {
      map.set(message.conversation_id, message);
    }
  }
  return map;
}

export async function getMyConversations(userId: string): Promise<{
  conversations: ConversationPreview[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversations: [], error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("conversations")
    .select("*, listings(id, title, status)")
    .contains("participant_ids", [userId])
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { conversations: [], error: mapSupabaseError(error) };
  }

  const rows = (data ?? []) as ConversationWithListingRow[];
  if (rows.length === 0) {
    return { conversations: [] };
  }

  const conversationIds = rows.map((row) => row.id);
  const otherParticipantIds = rows.flatMap((row) =>
    row.participant_ids.filter((id) => id !== userId)
  );

  const profiles = await fetchProfilesByIds(otherParticipantIds);

  const { data: messageData, error: messageError } = await client
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messageError) {
    return { conversations: [], error: mapSupabaseError(messageError) };
  }

  const latestMessages = latestMessageByConversation((messageData ?? []) as MessageRow[]);

  const conversations = rows.map((row) => {
    const otherId = row.participant_ids.find((id) => id !== userId) ?? "";
    const otherProfile = profiles.get(otherId);
    const latest = latestMessages.get(row.id);

    return mapConversationRowToPreview(row, userId, {
      otherParticipant: mapProfileToParticipant(otherProfile, otherId),
      listingTitle: row.listings?.title ?? null,
      lastMessage: latest?.body ?? null,
    });
  });

  return { conversations };
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<{
  conversation: ConversationPreview | null;
  messages: MessageThreadItem[];
  error?: string;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversation: null, messages: [], error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("conversations")
    .select("*, listings(id, title, status)")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    return { conversation: null, messages: [], error: mapSupabaseError(error) };
  }

  if (!data) {
    return { conversation: null, messages: [] };
  }

  const row = data as ConversationWithListingRow;
  if (!row.participant_ids.includes(userId)) {
    return { conversation: null, messages: [], error: "Conversation not found." };
  }

  const otherId = row.participant_ids.find((id) => id !== userId) ?? "";
  const profiles = await fetchProfilesByIds([...row.participant_ids, userId]);

  const { data: messageData, error: messageError } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messageError) {
    return { conversation: null, messages: [], error: mapSupabaseError(messageError) };
  }

  const messages = ((messageData ?? []) as MessageRow[]).map((message) => {
    const senderProfile = profiles.get(message.sender_id);
    const senderName = mapProfileToParticipant(senderProfile, message.sender_id).name;
    return mapMessageRowToThreadItem(message, userId, senderName);
  });

  const latest = messages[messages.length - 1];
  const conversation = mapConversationRowToPreview(row, userId, {
    otherParticipant: mapProfileToParticipant(profiles.get(otherId), otherId),
    listingTitle: row.listings?.title ?? null,
    lastMessage: latest?.body ?? null,
  });

  return { conversation, messages };
}

export async function getOrCreateListingConversation(
  listingId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: listing, error: listingError } = await client
    .from("listings")
    .select("id, seller_id, status, title")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return { conversationId: null, error: mapSupabaseError(listingError) };
  }

  if (!listing || listing.status !== "active") {
    return { conversationId: null, error: "This listing is no longer available." };
  }

  const sellerId = listing.seller_id as string;
  if (sellerId === buyerId) {
    return { conversationId: null, error: "You cannot message yourself about your own listing." };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .contains("participant_ids", [buyerId, sellerId])
    .maybeSingle();

  if (existingError) {
    return { conversationId: null, error: mapSupabaseError(existingError) };
  }

  if (existing?.id) {
    return { conversationId: existing.id as string };
  }

  const now = new Date().toISOString();
  const { data: created, error: createError } = await client
    .from("conversations")
    .insert({
      listing_id: listingId,
      created_by: buyerId,
      participant_ids: [buyerId, sellerId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .contains("participant_ids", [buyerId, sellerId])
        .maybeSingle();
      if (retry?.id) return { conversationId: retry.id as string };
    }
    return { conversationId: null, error: mapSupabaseError(createError) };
  }

  return { conversationId: created.id as string };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<{ message: MessageThreadItem | null; error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { message: null, error: "Please enter a message." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { message: null, error: "Messages must be 1000 characters or fewer." };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { message: null, error: "Supabase is not configured." };
  }

  const { data: conversation, error: conversationError } = await client
    .from("conversations")
    .select("participant_ids")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    return { message: null, error: mapSupabaseError(conversationError) };
  }

  if (!conversation || !(conversation.participant_ids as string[]).includes(senderId)) {
    return { message: null, error: "Conversation not found." };
  }

  const { data: inserted, error: insertError } = await client
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: trimmed,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return { message: null, error: mapSupabaseError(insertError) };
  }

  const { error: updateError } = await client
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (updateError) {
    return { message: null, error: mapSupabaseError(updateError) };
  }

  const profiles = await fetchProfilesByIds([senderId]);
  const senderName = mapProfileToParticipant(profiles.get(senderId), senderId).name;

  return {
    message: mapMessageRowToThreadItem(inserted as MessageRow, senderId, senderName),
  };
}
