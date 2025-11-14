import type { Id } from "convex/_generated/dataModel";

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
