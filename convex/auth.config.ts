/**
 * Convex Authentication Configuration for Clerk
 *
 * This file provides helper functions for working with Clerk authentication in Convex.
 * Clerk handles all authentication on the frontend, and we just verify the session in Convex.
 */

/**
 * Helper to get Clerk user info from Convex context
 * The identity is automatically populated by ConvexProviderWithClerk
 */
export async function getClerkUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // The identity object contains Clerk user information
  // identity.subject = Clerk user ID
  // identity.email = user email
  // identity.name = user name
  // identity.emailVerified = email verification status

  return {
    clerkUserId: identity.subject,
    email: identity.email,
    name: identity.name,
    emailVerified:
      identity.emailVerified === "true" || identity.emailVerified === true,
  };
}

/**
 * Helper to require authentication in a Convex function
 * Throws an error if user is not authenticated
 */
export async function requireAuth(ctx: any) {
  const user = await getClerkUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
