"use client";

import { AuthProvider } from "./auth-provider";
import { SavedListingsProvider } from "./saved-listings-provider";
import { UserListingsProvider } from "./user-listings-provider";
import { UnreadMessagesProvider } from "./unread-messages-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UnreadMessagesProvider>
        <SavedListingsProvider>
          <UserListingsProvider>{children}</UserListingsProvider>
        </SavedListingsProvider>
      </UnreadMessagesProvider>
    </AuthProvider>
  );
}
