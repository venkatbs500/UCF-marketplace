import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "./supabase-marketplace-types";
import {
  mapConversationRowToPreview,
  mapMessageRowToThreadItem,
  mapProfileToParticipant,
  type ConversationPreview,
  type ConversationRow,
  type ConversationWithListingRow,
  type MessageRow,
  type MessageThreadItem,
  type UnreadSummary,
} from "./supabase-messaging-types";

export {
  subscribeToConversations,
  subscribeToMessages,
  unsubscribeAllMessagingRealtime,
} from "./supabase-messaging-realtime";

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

type BuyerSellerIds = {
  buyerId: string;
  sellerId: string;
};

const CONVERSATION_SELECT =
  "*, listings(id, title, status, seller_id), housing_posts(id, title, status, user_id), tutoring_profiles(id, display_name, status, user_id, subjects), lost_found_items(id, title, status, user_id), campus_jobs(id, title, status, posted_by), campus_events(id, title, status, posted_by)";

function resolveBuyerSellerIds(
  row: ConversationRow,
  options?: {
    listingSellerId?: string | null;
    housingPosterId?: string | null;
    tutorOwnerId?: string | null;
    lostFoundPosterId?: string | null;
    campusJobPosterId?: string | null;
    campusEventOrganizerId?: string | null;
  }
): BuyerSellerIds {
  if (row.tutor_profile_id && options?.tutorOwnerId) {
    return {
      buyerId: row.created_by,
      sellerId: options.tutorOwnerId,
    };
  }

  if (row.housing_post_id && options?.housingPosterId) {
    return {
      buyerId: row.created_by,
      sellerId: options.housingPosterId,
    };
  }

  if (row.lost_found_item_id && options?.lostFoundPosterId) {
    return {
      buyerId: row.created_by,
      sellerId: options.lostFoundPosterId,
    };
  }

  if (row.campus_job_id && options?.campusJobPosterId) {
    return {
      buyerId: row.created_by,
      sellerId: options.campusJobPosterId,
    };
  }

  if (row.campus_event_id && options?.campusEventOrganizerId) {
    return {
      buyerId: row.created_by,
      sellerId: options.campusEventOrganizerId,
    };
  }

  if (row.listing_id && options?.listingSellerId) {
    return {
      buyerId: row.created_by,
      sellerId: options.listingSellerId,
    };
  }

  const otherParticipant =
    row.participant_ids.find((id) => id !== row.created_by) ?? row.participant_ids[0];
  return {
    buyerId: row.created_by,
    sellerId: otherParticipant,
  };
}

function getLastReadAtForUser(
  row: ConversationRow,
  userId: string,
  options?: {
    listingSellerId?: string | null;
    housingPosterId?: string | null;
    tutorOwnerId?: string | null;
    lostFoundPosterId?: string | null;
    campusJobPosterId?: string | null;
    campusEventOrganizerId?: string | null;
  }
): string | null {
  const { buyerId, sellerId } = resolveBuyerSellerIds(row, options);
  if (userId === buyerId) return row.buyer_last_read_at;
  if (userId === sellerId) return row.seller_last_read_at;
  return row.buyer_last_read_at ?? row.seller_last_read_at;
}

function getParticipantReadContext(
  row: ConversationWithListingRow
): {
  listingSellerId: string | null;
  housingPosterId: string | null;
  tutorOwnerId: string | null;
  lostFoundPosterId: string | null;
  campusJobPosterId: string | null;
  campusEventOrganizerId: string | null;
} {
  return {
    listingSellerId: row.listings?.seller_id ?? null,
    housingPosterId: row.housing_posts?.user_id ?? null,
    tutorOwnerId: row.tutoring_profiles?.user_id ?? null,
    lostFoundPosterId: row.lost_found_items?.user_id ?? null,
    campusJobPosterId: row.campus_jobs?.posted_by ?? null,
    campusEventOrganizerId: row.campus_events?.posted_by ?? null,
  };
}

function countUnreadMessagesInThread(
  messages: MessageRow[],
  userId: string,
  lastReadAt: string | null
): number {
  return messages.filter((message) => {
    if (message.sender_id === userId) return false;
    if (message.is_hidden) return false;
    if (!lastReadAt) return true;
    return message.created_at > lastReadAt;
  }).length;
}

async function fetchListingSellerIds(
  listingIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || listingIds.length === 0) return map;

  const { data } = await client
    .from("listings")
    .select("id, seller_id")
    .in("id", [...new Set(listingIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.seller_id as string);
  }
  return map;
}

async function fetchHousingPosterIds(
  housingPostIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || housingPostIds.length === 0) return map;

  const { data } = await client
    .from("housing_posts")
    .select("id, user_id")
    .in("id", [...new Set(housingPostIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.user_id as string);
  }
  return map;
}

async function fetchTutorOwnerIds(
  tutorProfileIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || tutorProfileIds.length === 0) return map;

  const { data } = await client
    .from("tutoring_profiles")
    .select("id, user_id")
    .in("id", [...new Set(tutorProfileIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.user_id as string);
  }
  return map;
}

async function fetchLostFoundPosterIds(
  itemIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || itemIds.length === 0) return map;

  const { data } = await client
    .from("lost_found_items")
    .select("id, user_id")
    .in("id", [...new Set(itemIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.user_id as string);
  }
  return map;
}

async function fetchCampusJobPosterIds(
  jobIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || jobIds.length === 0) return map;

  const { data } = await client
    .from("campus_jobs")
    .select("id, posted_by")
    .in("id", [...new Set(jobIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.posted_by as string);
  }
  return map;
}

async function fetchCampusEventOrganizerIds(
  eventIds: string[]
): Promise<Map<string, string>> {
  const client = getSupabaseBrowserClient();
  const map = new Map<string, string>();
  if (!client || eventIds.length === 0) return map;

  const { data } = await client
    .from("campus_events")
    .select("id, posted_by")
    .in("id", [...new Set(eventIds)]);

  for (const row of data ?? []) {
    map.set(row.id as string, row.posted_by as string);
  }
  return map;
}

function tutorDisplayTitle(row: ConversationWithListingRow): string | null {
  if (!row.tutor_profile_id) return null;
  if (row.tutoring_profiles?.display_name?.trim()) {
    return row.tutoring_profiles.display_name.trim();
  }
  const firstSubject = row.tutoring_profiles?.subjects?.[0];
  if (firstSubject) return firstSubject;
  return "Tutor profile";
}

function lostFoundDisplayTitle(row: ConversationWithListingRow): string | null {
  if (!row.lost_found_item_id) return null;
  return row.lost_found_items?.title?.trim() || "Lost & Found item";
}

function campusJobDisplayTitle(row: ConversationWithListingRow): string | null {
  if (!row.campus_job_id) return null;
  return row.campus_jobs?.title?.trim() || "Campus job";
}

function campusEventDisplayTitle(row: ConversationWithListingRow): string | null {
  if (!row.campus_event_id) return null;
  return row.campus_events?.title?.trim() || "Campus event";
}

async function countUnreadMessagesForConversation(
  conversationId: string,
  userId: string,
  lastReadAt: string | null
): Promise<number> {
  const client = getSupabaseBrowserClient();
  if (!client) return 0;

  let query = client
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .or("is_hidden.is.null,is_hidden.eq.false");

  if (lastReadAt) {
    query = query.gt("created_at", lastReadAt);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function getConversationUnreadCount(
  userId: string,
  conversationId: string
): Promise<{ count: number; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { count: 0, error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    return { count: 0, error: mapSupabaseError(error) };
  }

  if (!data || !(data.participant_ids as string[]).includes(userId)) {
    return { count: 0 };
  }

  const row = data as ConversationWithListingRow;
  const readContext = getParticipantReadContext(row);
  const lastReadAt = getLastReadAtForUser(row, userId, readContext);
  const count = await countUnreadMessagesForConversation(conversationId, userId, lastReadAt);
  return { count };
}

export async function getUnreadConversationIds(
  userId: string
): Promise<{ conversationIds: string[]; error?: string }> {
  const summary = await getUnreadSummary(userId);
  return {
    conversationIds: summary.unreadConversationIds,
    error: summary.error,
  };
}

export async function getUnreadConversationCount(
  userId: string
): Promise<{ count: number; error?: string }> {
  const summary = await getUnreadSummary(userId);
  return {
    count: summary.totalUnreadConversations,
    error: summary.error,
  };
}

export async function getUnreadSummary(userId: string): Promise<
  UnreadSummary & { error?: string }
> {
  const result = await getMyConversations(userId);
  if (result.error) {
    return {
      totalUnreadConversations: 0,
      totalUnreadMessages: 0,
      unreadConversationIds: [],
      error: result.error,
    };
  }

  const unreadConversationIds = result.conversations
    .filter((conversation) => conversation.unreadCount > 0)
    .map((conversation) => conversation.id);
  const totalUnreadMessages = result.conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0
  );

  return {
    totalUnreadConversations: unreadConversationIds.length,
    totalUnreadMessages,
    unreadConversationIds,
  };
}

export async function markConversationRead(
  userId: string,
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { data, error } = await client
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  if (!data || !(data.participant_ids as string[]).includes(userId)) {
    return { success: false, error: "Conversation not found." };
  }

  const row = data as ConversationWithListingRow;
  const readContext = getParticipantReadContext(row);
  const { buyerId, sellerId } = resolveBuyerSellerIds(row, readContext);
  const now = new Date().toISOString();

  const patch =
    userId === buyerId
      ? { buyer_last_read_at: now }
      : userId === sellerId
        ? { seller_last_read_at: now }
        : null;

  if (!patch) {
    return { success: false, error: "Conversation not found." };
  }

  const { error: updateError } = await client
    .from("conversations")
    .update(patch)
    .eq("id", conversationId);

  if (updateError) {
    return { success: false, error: mapSupabaseError(updateError) };
  }

  return { success: true };
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
    .select(CONVERSATION_SELECT)
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

  const listingSellerIds = await fetchListingSellerIds(
    rows.map((row) => row.listing_id).filter((id): id is string => Boolean(id))
  );
  const housingPosterIds = await fetchHousingPosterIds(
    rows.map((row) => row.housing_post_id).filter((id): id is string => Boolean(id))
  );
  const tutorOwnerIds = await fetchTutorOwnerIds(
    rows.map((row) => row.tutor_profile_id).filter((id): id is string => Boolean(id))
  );
  const lostFoundPosterIds = await fetchLostFoundPosterIds(
    rows.map((row) => row.lost_found_item_id).filter((id): id is string => Boolean(id))
  );
  const campusJobPosterIds = await fetchCampusJobPosterIds(
    rows.map((row) => row.campus_job_id).filter((id): id is string => Boolean(id))
  );
  const campusEventOrganizerIds = await fetchCampusEventOrganizerIds(
    rows.map((row) => row.campus_event_id).filter((id): id is string => Boolean(id))
  );

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
  const messagesByConversation = new Map<string, MessageRow[]>();
  for (const message of (messageData ?? []) as MessageRow[]) {
    const existing = messagesByConversation.get(message.conversation_id) ?? [];
    existing.push(message);
    messagesByConversation.set(message.conversation_id, existing);
  }

  const conversations = rows.map((row) => {
    const otherId = row.participant_ids.find((id) => id !== userId) ?? "";
    const otherProfile = profiles.get(otherId);
    const latest = latestMessages.get(row.id);
    const readContext = {
      listingSellerId: row.listing_id
        ? listingSellerIds.get(row.listing_id) ?? null
        : null,
      housingPosterId: row.housing_post_id
        ? housingPosterIds.get(row.housing_post_id) ?? row.housing_posts?.user_id ?? null
        : null,
      tutorOwnerId: row.tutor_profile_id
        ? tutorOwnerIds.get(row.tutor_profile_id) ?? row.tutoring_profiles?.user_id ?? null
        : null,
      lostFoundPosterId: row.lost_found_item_id
        ? lostFoundPosterIds.get(row.lost_found_item_id) ?? row.lost_found_items?.user_id ?? null
        : null,
      campusJobPosterId: row.campus_job_id
        ? campusJobPosterIds.get(row.campus_job_id) ?? row.campus_jobs?.posted_by ?? null
        : null,
      campusEventOrganizerId: row.campus_event_id
        ? campusEventOrganizerIds.get(row.campus_event_id) ??
          row.campus_events?.posted_by ??
          null
        : null,
    };
    const lastReadAt = getLastReadAtForUser(row, userId, readContext);
    const unreadCount = countUnreadMessagesInThread(
      messagesByConversation.get(row.id) ?? [],
      userId,
      lastReadAt
    );

    return mapConversationRowToPreview(row, userId, {
      otherParticipant: mapProfileToParticipant(otherProfile, otherId),
      listingTitle: row.listings?.title ?? null,
      housingTitle: row.housing_posts?.title ?? null,
      tutorTitle: tutorDisplayTitle(row),
      lostFoundTitle: lostFoundDisplayTitle(row),
      campusJobTitle: campusJobDisplayTitle(row),
      campusEventTitle: campusEventDisplayTitle(row),
      lastMessage: latest?.body ?? null,
      unreadCount,
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
    .select(CONVERSATION_SELECT)
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

  const readContext = getParticipantReadContext(row);
  const lastReadAt = getLastReadAtForUser(row, userId, readContext);

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
  const unreadCount = countUnreadMessagesInThread(
    (messageData ?? []) as MessageRow[],
    userId,
    lastReadAt
  );
  const conversation = mapConversationRowToPreview(row, userId, {
    otherParticipant: mapProfileToParticipant(profiles.get(otherId), otherId),
    listingTitle: row.listings?.title ?? null,
    housingTitle: row.housing_posts?.title ?? null,
    tutorTitle: tutorDisplayTitle(row),
    lostFoundTitle: lostFoundDisplayTitle(row),
    campusJobTitle: campusJobDisplayTitle(row),
    campusEventTitle: campusEventDisplayTitle(row),
    lastMessage: latest?.body ?? null,
    unreadCount,
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
      context_type: "marketplace_listing",
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

export async function getOrCreateHousingConversation(
  housingPostId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: housingPost, error: housingError } = await client
    .from("housing_posts")
    .select("id, user_id, status, title")
    .eq("id", housingPostId)
    .maybeSingle();

  if (housingError) {
    return { conversationId: null, error: mapSupabaseError(housingError) };
  }

  if (!housingPost || housingPost.status !== "active") {
    return { conversationId: null, error: "This housing post is no longer available." };
  }

  const posterId = housingPost.user_id as string;
  if (posterId === buyerId) {
    return {
      conversationId: null,
      error: "You cannot message yourself about your own housing post.",
    };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("housing_post_id", housingPostId)
    .eq("created_by", buyerId)
    .contains("participant_ids", [buyerId, posterId])
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
      housing_post_id: housingPostId,
      context_type: "housing_post",
      created_by: buyerId,
      participant_ids: [buyerId, posterId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("housing_post_id", housingPostId)
        .eq("created_by", buyerId)
        .contains("participant_ids", [buyerId, posterId])
        .maybeSingle();
      if (retry?.id) return { conversationId: retry.id as string };
    }
    return { conversationId: null, error: mapSupabaseError(createError) };
  }

  return { conversationId: created.id as string };
}

export async function getOrCreateTutorConversation(
  tutorProfileId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: tutorProfile, error: tutorError } = await client
    .from("tutoring_profiles")
    .select("id, user_id, status, display_name")
    .eq("id", tutorProfileId)
    .maybeSingle();

  if (tutorError) {
    return { conversationId: null, error: mapSupabaseError(tutorError) };
  }

  if (!tutorProfile || tutorProfile.status !== "active") {
    return { conversationId: null, error: "This tutor profile is no longer available." };
  }

  const tutorUserId = tutorProfile.user_id as string;
  if (tutorUserId === buyerId) {
    return {
      conversationId: null,
      error: "You cannot message yourself about your own tutor profile.",
    };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("tutor_profile_id", tutorProfileId)
    .eq("created_by", buyerId)
    .contains("participant_ids", [buyerId, tutorUserId])
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
      tutor_profile_id: tutorProfileId,
      context_type: "tutor_profile",
      created_by: buyerId,
      participant_ids: [buyerId, tutorUserId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("tutor_profile_id", tutorProfileId)
        .eq("created_by", buyerId)
        .contains("participant_ids", [buyerId, tutorUserId])
        .maybeSingle();
      if (retry?.id) return { conversationId: retry.id as string };
    }
    return { conversationId: null, error: mapSupabaseError(createError) };
  }

  return { conversationId: created.id as string };
}

export async function getOrCreateLostFoundConversation(
  itemId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: lostFoundItem, error: itemError } = await client
    .from("lost_found_items")
    .select("id, user_id, status, title")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    return { conversationId: null, error: mapSupabaseError(itemError) };
  }

  if (!lostFoundItem || lostFoundItem.status !== "active") {
    return { conversationId: null, error: "This lost & found item is no longer available." };
  }

  const posterId = lostFoundItem.user_id as string;
  if (posterId === buyerId) {
    return {
      conversationId: null,
      error: "You cannot message yourself about your own lost & found item.",
    };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("lost_found_item_id", itemId)
    .eq("created_by", buyerId)
    .contains("participant_ids", [buyerId, posterId])
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
      lost_found_item_id: itemId,
      context_type: "lost_found_item",
      created_by: buyerId,
      participant_ids: [buyerId, posterId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("lost_found_item_id", itemId)
        .eq("created_by", buyerId)
        .contains("participant_ids", [buyerId, posterId])
        .maybeSingle();
      if (retry?.id) return { conversationId: retry.id as string };
    }
    return { conversationId: null, error: mapSupabaseError(createError) };
  }

  return { conversationId: created.id as string };
}

export async function getOrCreateCampusJobConversation(
  jobId: string,
  buyerId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: campusJob, error: jobError } = await client
    .from("campus_jobs")
    .select("id, posted_by, status, title")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    return { conversationId: null, error: mapSupabaseError(jobError) };
  }

  if (!campusJob || campusJob.status !== "active") {
    return { conversationId: null, error: "This job is no longer available." };
  }

  const posterId = campusJob.posted_by as string;
  if (posterId === buyerId) {
    return {
      conversationId: null,
      error: "You cannot message yourself about your own job post.",
    };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("campus_job_id", jobId)
    .eq("created_by", buyerId)
    .contains("participant_ids", [buyerId, posterId])
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
      campus_job_id: jobId,
      context_type: "campus_job",
      created_by: buyerId,
      participant_ids: [buyerId, posterId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("campus_job_id", jobId)
        .eq("created_by", buyerId)
        .contains("participant_ids", [buyerId, posterId])
        .maybeSingle();
      if (retry?.id) return { conversationId: retry.id as string };
    }
    return { conversationId: null, error: mapSupabaseError(createError) };
  }

  return { conversationId: created.id as string };
}

export async function getOrCreateCampusEventConversation(
  eventId: string,
  requesterUserId: string
): Promise<{ conversationId: string | null; error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { conversationId: null, error: "Supabase is not configured." };
  }

  const { data: campusEvent, error: eventError } = await client
    .from("campus_events")
    .select("id, posted_by, status, title")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    return { conversationId: null, error: mapSupabaseError(eventError) };
  }

  if (!campusEvent || campusEvent.status !== "active") {
    return { conversationId: null, error: "This event is no longer available." };
  }

  const organizerId = campusEvent.posted_by as string;
  if (organizerId === requesterUserId) {
    return {
      conversationId: null,
      error: "You cannot message yourself about your own event.",
    };
  }

  const { data: existing, error: existingError } = await client
    .from("conversations")
    .select("id")
    .eq("campus_event_id", eventId)
    .eq("created_by", requesterUserId)
    .contains("participant_ids", [requesterUserId, organizerId])
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
      campus_event_id: eventId,
      context_type: "campus_event",
      created_by: requesterUserId,
      participant_ids: [requesterUserId, organizerId],
      last_message_at: now,
    })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError?.code === "23505") {
      const { data: retry } = await client
        .from("conversations")
        .select("id")
        .eq("campus_event_id", eventId)
        .eq("created_by", requesterUserId)
        .contains("participant_ids", [requesterUserId, organizerId])
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
