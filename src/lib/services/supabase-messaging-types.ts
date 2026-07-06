import type { ProfileRow } from "./supabase-marketplace-types";

export type ConversationContextType =
  | "marketplace_listing"
  | "housing_post"
  | "tutor_profile"
  | "lost_found_item"
  | "unknown";

export type ConversationRow = {
  id: string;
  listing_id: string | null;
  housing_post_id: string | null;
  tutor_profile_id: string | null;
  lost_found_item_id?: string | null;
  context_type?: string | null;
  created_by: string;
  participant_ids: string[];
  last_message_at: string | null;
  buyer_last_read_at: string | null;
  seller_last_read_at: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  is_hidden?: boolean;
};

export type ConversationWithListingRow = ConversationRow & {
  listings?: { id: string; title: string; status: string; seller_id?: string } | null;
  housing_posts?: {
    id: string;
    title: string;
    status: string;
    user_id?: string;
  } | null;
  tutoring_profiles?: {
    id: string;
    display_name: string | null;
    status: string;
    user_id?: string;
    subjects?: string[] | null;
  } | null;
  lost_found_items?: {
    id: string;
    title: string;
    status: string;
    user_id?: string;
  } | null;
};

export type ConversationContext = {
  contextType: ConversationContextType;
  contextTitle: string | null;
  contextId: string | null;
  contextHref: string | null;
  contextLabel: string;
};

export function getConversationContext(
  row: ConversationRow,
  options?: {
    listingTitle?: string | null;
    housingTitle?: string | null;
    tutorTitle?: string | null;
    lostFoundTitle?: string | null;
  }
): ConversationContext {
  if (row.tutor_profile_id) {
    return {
      contextType: "tutor_profile",
      contextTitle: options?.tutorTitle ?? null,
      contextId: row.tutor_profile_id,
      contextHref: `/tutoring/${row.tutor_profile_id}`,
      contextLabel: "Tutoring",
    };
  }

  if (row.housing_post_id) {
    return {
      contextType: "housing_post",
      contextTitle: options?.housingTitle ?? null,
      contextId: row.housing_post_id,
      contextHref: `/housing/${row.housing_post_id}`,
      contextLabel: "Housing",
    };
  }

  if (row.lost_found_item_id) {
    return {
      contextType: "lost_found_item",
      contextTitle: options?.lostFoundTitle ?? null,
      contextId: row.lost_found_item_id,
      contextHref: `/lost-found/${row.lost_found_item_id}`,
      contextLabel: "Lost & Found",
    };
  }

  if (row.listing_id) {
    return {
      contextType: "marketplace_listing",
      contextTitle: options?.listingTitle ?? null,
      contextId: row.listing_id,
      contextHref: `/marketplace/${row.listing_id}`,
      contextLabel: "Marketplace",
    };
  }

  return {
    contextType: "unknown",
    contextTitle: null,
    contextId: null,
    contextHref: null,
    contextLabel: "Conversation",
  };
}

export type CreateConversationInput = {
  listingId: string;
  buyerId: string;
  sellerId: string;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  body: string;
};

export type ConversationParticipant = {
  id: string;
  name: string;
  avatarInitials: string;
  isVerifiedStudent: boolean;
};

export type ConversationPreview = {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  housingPostId: string | null;
  contextType: ConversationContextType;
  contextTitle: string | null;
  contextId: string | null;
  contextHref: string | null;
  contextLabel: string;
  otherParticipant: ConversationParticipant;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  unreadCount: number;
};

export type UnreadSummary = {
  totalUnreadConversations: number;
  totalUnreadMessages: number;
  unreadConversationIds: string[];
};

export type MessageThreadItem = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isOwnMessage: boolean;
  isHidden: boolean;
};

function participantName(profile: ProfileRow | null | undefined): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  return "Verified student";
}

function participantInitials(profile: ProfileRow | null | undefined): string {
  if (profile?.avatar_initials?.trim()) return profile.avatar_initials.trim();
  const name = participantName(profile);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (name.slice(0, 2) || "VS").toUpperCase();
}

export function mapProfileToParticipant(
  profile: ProfileRow | null | undefined,
  userId: string
): ConversationParticipant {
  return {
    id: userId,
    name: participantName(profile),
    avatarInitials: participantInitials(profile),
    isVerifiedStudent: profile?.is_verified_student ?? true,
  };
}

export function mapConversationRowToPreview(
  row: ConversationRow,
  currentUserId: string,
  options: {
    otherParticipant: ConversationParticipant;
    listingTitle?: string | null;
    housingTitle?: string | null;
    tutorTitle?: string | null;
    lostFoundTitle?: string | null;
    lastMessage?: string | null;
    unreadCount?: number;
  }
): ConversationPreview {
  const otherId =
    row.participant_ids.find((id) => id !== currentUserId) ?? options.otherParticipant.id;
  const unreadCount = options.unreadCount ?? 0;
  const context = getConversationContext(row, {
    listingTitle: options.listingTitle,
    housingTitle: options.housingTitle,
    tutorTitle: options.tutorTitle,
    lostFoundTitle: options.lostFoundTitle,
  });

  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle:
      context.contextType === "marketplace_listing" ? context.contextTitle : null,
    housingPostId: row.housing_post_id,
    contextType: context.contextType,
    contextTitle: context.contextTitle,
    contextId: context.contextId,
    contextHref: context.contextHref,
    contextLabel: context.contextLabel,
    otherParticipant: { ...options.otherParticipant, id: otherId },
    lastMessage: options.lastMessage?.trim() || "Conversation started",
    lastMessageAt: row.last_message_at ?? row.created_at,
    unread: unreadCount > 0,
    unreadCount,
  };
}

export function mapMessageRowToThreadItem(
  row: MessageRow,
  currentUserId: string,
  senderName: string
): MessageThreadItem {
  return {
    id: row.id,
    body: row.is_hidden ? "Message hidden by moderation" : row.body,
    senderId: row.sender_id,
    senderName,
    createdAt: row.created_at,
    isOwnMessage: row.sender_id === currentUserId,
    isHidden: Boolean(row.is_hidden),
  };
}
