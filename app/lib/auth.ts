import { redirect } from "react-router";
import { useAuth } from "@clerk/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

const convexClient = new ConvexHttpClient(
  import.meta.env.VITE_CONVEX_URL as string
);

/**
 * Check if user is authenticated (client-side hook)
 */
export function useIsAuthenticated(): boolean {
  const { isSignedIn, isLoaded } = useAuth();
  return isLoaded && !!isSignedIn;
}

/**
 * Get current user from Convex (client-side hook)
 */
export function useCurrentUser() {
  const user = useQuery(api.users.getCurrentUser);
  return user;
}

/**
 * Get user's organization (client-side hook)
 */
export function useUserOrganization() {
  const organization = useQuery(api.users.getOrganization);
  return organization;
}

/**
 * Require authentication in a loader function
 * Redirects to sign-in if not authenticated
 *
 * @param userId - The userId from Clerk (available in loader context after auth)
 * @param redirectTo - Optional redirect path after sign-in
 * @returns The userId if authenticated
 * @throws Redirect if not authenticated
 */
export function requireAuth(
  userId: string | null | undefined,
  redirectTo?: string
): string {
  if (!userId) {
    const params = redirectTo
      ? `?redirect_url=${encodeURIComponent(redirectTo)}`
      : "";
    throw redirect(`/sign-in${params}`);
  }
  return userId;
}

/**
 * Check if user has access to a project
 * User has access if:
 * 1. They own the project, OR
 * 2. The project belongs to their organization and they are a member
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @param organizationId - The current user's organization ID (optional)
 * @returns true if user has access
 */
export function canAccessProject(
  project: { userId: Id<"users">; organizationId?: Id<"organizations"> },
  userId: Id<"users">,
  organizationId?: Id<"organizations">
): boolean {
  // User owns the project
  if (project.userId === userId) {
    return true;
  }

  // Project belongs to user's organization
  if (organizationId && project.organizationId === organizationId) {
    return true;
  }

  return false;
}

/**
 * Require project ownership or organization access
 * Throws redirect to dashboard if user doesn't have access
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @param organizationId - The current user's organization ID (optional)
 * @throws Redirect if user doesn't have access
 */
export function requireProjectAccess(
  project: { userId: Id<"users">; organizationId?: Id<"organizations"> } | null,
  userId: Id<"users">,
  organizationId?: Id<"organizations">
): void {
  if (!project) {
    throw redirect("/dashboard");
  }

  if (!canAccessProject(project, userId, organizationId)) {
    throw redirect("/dashboard");
  }
}

/**
 * Check if user is the owner of a project (not just organization member)
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @returns true if user owns the project
 */
export function isProjectOwner(
  project: { userId: Id<"users"> },
  userId: Id<"users">
): boolean {
  return project.userId === userId;
}

/**
 * Require project ownership (stricter than access)
 * Used for sensitive operations like deleting or publishing
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @throws Redirect if user is not the owner
 */
export function requireProjectOwnership(
  project: { userId: Id<"users"> } | null,
  userId: Id<"users">
): void {
  if (!project) {
    throw redirect("/dashboard");
  }

  if (!isProjectOwner(project, userId)) {
    throw redirect("/dashboard");
  }
}

/**
 * Check if a project is publicly accessible
 * Projects are public if they are published
 *
 * @param project - The project to check
 * @returns true if project is publicly accessible
 */
export function isProjectPublic(project: {
  status: "draft" | "published" | "archived";
}): boolean {
  return project.status === "published";
}

/**
 * Check if user can view project submissions
 * User can view submissions if they have access to the project
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @param organizationId - The current user's organization ID (optional)
 * @returns true if user can view submissions
 */
export function canViewSubmissions(
  project: { userId: Id<"users">; organizationId?: Id<"organizations"> },
  userId: Id<"users">,
  organizationId?: Id<"organizations">
): boolean {
  return canAccessProject(project, userId, organizationId);
}

/**
 * Check if user can mark/grade submissions
 * User can mark if they have access to the project
 *
 * @param project - The project to check
 * @param userId - The current user's ID
 * @param organizationId - The current user's organization ID (optional)
 * @returns true if user can mark submissions
 */
export function canMarkSubmissions(
  project: { userId: Id<"users">; organizationId?: Id<"organizations"> },
  userId: Id<"users">,
  organizationId?: Id<"organizations">
): boolean {
  return canAccessProject(project, userId, organizationId);
}

/**
 * Check if user belongs to an organization
 *
 * @param organizationId - The user's organization ID
 * @returns true if user belongs to an organization
 */
export function hasOrganization(
  organizationId: Id<"organizations"> | undefined
): boolean {
  return !!organizationId;
}

/**
 * Check if user is member of specific organization
 *
 * @param organization - The organization to check
 * @param userId - The current user's ID
 * @returns true if user is a member
 */
export function isOrganizationMember(
  organization: { members: Id<"users">[] },
  userId: Id<"users">
): boolean {
  return organization.members.includes(userId);
}

/**
 * Check if user is creator of organization
 *
 * @param organization - The organization to check
 * @param userId - The current user's ID
 * @returns true if user created the organization
 */
export function isOrganizationCreator(
  organization: { createdBy: Id<"users"> },
  userId: Id<"users">
): boolean {
  return organization.createdBy === userId;
}

/**
 * Get redirect URL from search params or default
 *
 * @param request - The request object
 * @param defaultPath - Default path if no redirect URL in params
 * @returns The redirect URL
 */
export function getRedirectUrl(
  request: Request,
  defaultPath: string = "/dashboard"
): string {
  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get("redirect_url");
  return redirectUrl || defaultPath;
}

/**
 * Get current user data in a loader function
 * This uses the Convex HTTP client to fetch user data server-side
 *
 * @param userId - The Clerk user ID from auth context
 * @returns The user from Convex or null
 */
export async function getUserInLoader(tokenIdentifier: string): Promise<any> {
  try {
    const user = await convexClient.query(api.users.findUserByToken, {
      tokenIdentifier,
    });
    return user;
  } catch (error) {
    console.error("Error fetching user in loader:", error);
    return null;
  }
}

/**
 * Get user's organization in a loader function
 *
 * @param tokenIdentifier - The Clerk token identifier
 * @returns The organization or null
 */
export async function getUserOrganizationInLoader(
  tokenIdentifier: string
): Promise<any> {
  try {
    // First get the user to check if they have an organization
    const user = await getUserInLoader(tokenIdentifier);
    if (!user || !user.organizationId) {
      return null;
    }

    // TODO: Uncomment when Convex API regenerates with organizations module
    // Get the organization
    // const organization = await convexClient.query(api.organizations.get, {
    //   orgId: user.organizationId,
    // });
    // return organization;

    // Temporary: return null until API regenerates
    return null;
  } catch (error) {
    console.error("Error fetching organization in loader:", error);
    return null;
  }
}

/**
 * Ensure user exists in Convex database (upsert)
 * Call this in loaders that require authentication to ensure user is created
 *
 * @param tokenIdentifier - The Clerk token identifier
 * @returns The user ID
 */
export async function ensureUserExists(
  tokenIdentifier: string
): Promise<Id<"users">> {
  try {
    // This will create or update the user
    const user = await convexClient.mutation(api.users.upsertUser, {});
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user._id;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw redirect("/sign-in");
  }
}

/**
 * Helper to get auth data in loaders
 * Returns userId from LoaderArgs after Clerk authentication
 *
 * @param args - LoaderArgs from React Router
 * @returns userId or null
 */
export function getAuthFromLoader(args: any): string | null {
  // After rootAuthLoader runs, auth data is available in context
  // The userId is available from Clerk's auth state
  return args.context?.auth?.userId || null;
}
