"use client";

import React, { createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePictureUrl?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();

  const login = () => {
    openSignIn({
      redirectUrl: "/app",
    });
  };

  const logout = async () => {
    await signOut({
      redirectUrl: "/",
    });
  };

  const refreshUser = () => {
    // Clerk automatically handles user data refresh
    // No manual refresh needed
  };

  const value: AuthContextType = {
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.imageUrl,
        }
      : null,
    isLoading: !isLoaded,
    isAuthenticated: !!user && isLoaded,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
