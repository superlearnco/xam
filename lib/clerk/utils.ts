import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

/**
 * Get the current user's Clerk ID from the session
 * Returns null if not authenticated
 */
export async function getCurrentClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current user's Clerk ID or throw an error
 * Throws if not authenticated
 */
export async function getCurrentClerkUserIdOrThrow(): Promise<string> {
  const userId = await getCurrentClerkUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

/**
 * Get the full current user object from Clerk
 * Returns null if not authenticated
 */
export async function getCurrentClerkUser(): Promise<User | null> {
  return await currentUser();
}

/**
 * Get the full current user object or throw an error
 * Throws if not authenticated
 */
export async function getCurrentClerkUserOrThrow(): Promise<User> {
  const user = await getCurrentClerkUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Extract user data from Clerk user object for Convex sync
 */
export function extractUserDataForConvex(clerkUser: User) {
  const email = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!email) {
    throw new Error("User must have a primary email address");
  }

  return {
    clerkUserId: clerkUser.id,
    email,
    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email,
    avatar: clerkUser.imageUrl || undefined,
    emailVerified: clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.verification?.status === "verified",
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentClerkUserId();
  return !!userId;
}
