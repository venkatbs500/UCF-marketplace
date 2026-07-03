"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { isDemoDataEnabled } from "@/lib/product-mode";
import { usesSupabaseMessaging } from "@/lib/messaging-mode";
import { messagePreviews } from "@/lib/mock-data";
import {
  getUnreadConversationCount,
  subscribeToConversations,
} from "@/lib/services/supabase-messaging-service";

type UnreadMessagesContextValue = {
  unreadCount: number;
  isLoading: boolean;
  realtimeConnected: boolean;
  refreshUnread: () => Promise<void>;
  markDemoConversationRead: (conversationId: string) => void;
  isDemoConversationUnread: (conversationId: string) => boolean;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabaseMode = usesSupabaseMessaging();
  const demoMode = isDemoDataEnabled();
  const userId = user?.id ?? null;

  const [supabaseUnreadCount, setSupabaseUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(supabaseMode);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [demoReadIds, setDemoReadIds] = useState<Set<string>>(() => new Set());

  const demoUnreadCount = useMemo(
    () => messagePreviews.filter((preview) => preview.unread && !demoReadIds.has(preview.id)).length,
    [demoReadIds]
  );

  const unreadCount = demoMode && !supabaseMode ? demoUnreadCount : supabaseUnreadCount;

  const refreshUnread = useCallback(async () => {
    if (!supabaseMode || !userId) return;
    const result = await getUnreadConversationCount(userId);
    setSupabaseUnreadCount(result.count);
    setIsLoading(false);
  }, [supabaseMode, userId]);

  useEffect(() => {
    if (!supabaseMode || !userId) {
      return;
    }

    let cancelled = false;

    void getUnreadConversationCount(userId).then((result) => {
      if (cancelled) return;
      setSupabaseUnreadCount(result.count);
      setIsLoading(false);
    });

    const unsubscribe = subscribeToConversations(userId, () => {
      setRealtimeConnected(true);
      void getUnreadConversationCount(userId).then((result) => {
        if (cancelled) return;
        setSupabaseUnreadCount(result.count);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
      setRealtimeConnected(false);
    };
  }, [supabaseMode, userId]);

  const markDemoConversationRead = useCallback((conversationId: string) => {
    setDemoReadIds((current) => {
      if (current.has(conversationId)) return current;
      const next = new Set(current);
      next.add(conversationId);
      return next;
    });
  }, []);

  const isDemoConversationUnread = useCallback(
    (conversationId: string) => {
      const preview = messagePreviews.find((item) => item.id === conversationId);
      return Boolean(preview?.unread && !demoReadIds.has(conversationId));
    },
    [demoReadIds]
  );

  const value = useMemo(
    () => ({
      unreadCount,
      isLoading: demoMode && !supabaseMode ? false : isLoading,
      realtimeConnected: supabaseMode ? realtimeConnected : false,
      refreshUnread,
      markDemoConversationRead,
      isDemoConversationUnread,
    }),
    [
      unreadCount,
      demoMode,
      supabaseMode,
      isLoading,
      realtimeConnected,
      refreshUnread,
      markDemoConversationRead,
      isDemoConversationUnread,
    ]
  );

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error("useUnreadMessages must be used within UnreadMessagesProvider");
  }
  return context;
}
