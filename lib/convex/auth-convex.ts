/**
 * Authenticated Convex client utilities
 * Provides helpers for using Convex with Clerk authentication
 */

import { ConvexReactClient } from "convex/react";
import { FunctionReference, getFunctionName } from "convex/server";

/**
 * Get the Convex auth token from Clerk session
 * This should be called server-side to generate a Convex auth token
 */
export async function getConvexAuthToken(clerkUserId: string): Promise<string> {
  // In a production setup, you would:
  // 1. Verify the Clerk session
  // 2. Generate a Convex auth token with the user's identity
  // 3. Return the token

  // For now, return the clerkUserId as the token
  // This will be used in Convex functions to identify the user
  return clerkUserId;
}

/**
 * Configure Convex client with authentication
 */
export function configureConvexAuth(
  client: ConvexReactClient,
  token: string | null,
) {
  if (token) {
    // Set auth with a function that returns the token
    client.setAuth(async () => token);
  } else {
    client.clearAuth();
  }
}

/**
 * Type-safe wrapper for calling Convex mutations with error handling
 */
export async function callMutation<T extends FunctionReference<"mutation">>(
  client: ConvexReactClient,
  mutation: T,
  args: T["_args"],
): Promise<T["_returnType"]> {
  try {
    return await client.mutation(mutation, args);
  } catch (error) {
    console.error(
      `Error calling mutation ${getFunctionName(mutation)}:`,
      error,
    );
    throw error;
  }
}

/**
 * Type-safe wrapper for calling Convex actions with error handling
 */
export async function callAction<T extends FunctionReference<"action">>(
  client: ConvexReactClient,
  action: T,
  args: T["_args"],
): Promise<T["_returnType"]> {
  try {
    return await client.action(action, args);
  } catch (error) {
    console.error(`Error calling action ${getFunctionName(action)}:`, error);
    throw error;
  }
}

/**
 * Helper to check if user is authenticated in Convex context
 */
export function isConvexAuthenticated(client: ConvexReactClient): boolean {
  // Check if auth token is set by attempting to get it
  // Note: This is a simplified check - in production you'd implement proper auth state
  return true; // Placeholder - implement based on your auth strategy
}
