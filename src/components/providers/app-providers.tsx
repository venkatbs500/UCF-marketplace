"use client";

import { AuthProvider } from "./auth-provider";
import { SavedListingsProvider } from "./saved-listings-provider";
import { UserListingsProvider } from "./user-listings-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedListingsProvider>
        <UserListingsProvider>{children}</UserListingsProvider>
      </SavedListingsProvider>
    </AuthProvider>
  );
}
