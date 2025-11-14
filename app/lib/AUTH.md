# Authentication & Authorization Guide

This document explains how authentication and authorization work in the XAM application.

## Overview

XAM uses a multi-layered authentication approach:
- **Clerk** for user authentication (sign-in/sign-up)
- **Convex** for data access and server-side authorization
- **React Router** loaders for route-level protection

## Architecture

### 1. Client-Side Authentication (Clerk)

Clerk handles all user authentication on the client side:
- Sign in/Sign up flows
- Session management
- Token generation
- User identity

### 2. Server-Side Authorization (Convex)

All data access goes through Convex functions that check:
- User identity via `ctx.auth.getUserIdentity()`
- Project ownership
- Organization membership
- Permission levels

### 3. Route Protection (React Router)

Route loaders check authentication before rendering:
- Extract userId from Clerk auth context
- Redirect to sign-in if not authenticated
- Fetch user data from Convex
- Pass data to components

## File Structure

```
app/lib/
├── auth.ts              # Convex-dependent auth utilities
├── auth-helpers.ts      # Pure auth helper functions
├── auth.test.ts         # Test suite (26 tests)
└── AUTH.md             # This documentation
```

## Auth Helpers

### Client-Side Hooks

#### `useIsAuthenticated()`
Check if user is currently authenticated.

```typescript
const isAuthenticated = useIsAuthenticated();
if (!isAuthenticated) {
  // Show sign-in prompt
}
```

#### `useCurrentUser()`
Get the current user from Convex database.

```typescript
const user = useCurrentUser();
console.log(user?.name, user?.email);
```

#### `useUserOrganization()`
Get the user's organization (if they belong to one).

```typescript
const organization = useUserOrganization();
if (organization) {
  console.log("Organization:", organization.name);
}
```

### Loader Helpers

#### `requireAuth(userId, redirectTo?)`
Require authentication in a loader. Throws redirect if not authenticated.

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  requireAuth(userId, "/projects/123/editor");
  // ... rest of loader
}
```

#### `getUserInLoader(tokenIdentifier)`
Get user data in a loader context (server-side).

```typescript
const user = await getUserInLoader(tokenIdentifier);
```

#### `ensureUserExists(tokenIdentifier)`
Create or update user in Convex database.

```typescript
const userId = await ensureUserExists(tokenIdentifier);
```

### Authorization Helpers (Pure Functions)

#### `canAccessProject(project, userId, organizationId?)`
Check if user has access to a project.

```typescript
if (canAccessProject(project, user._id, user.organizationId)) {
  // User can access this project
}
```

Access is granted if:
- User owns the project, OR
- Project belongs to user's organization

#### `isProjectOwner(project, userId)`
Stricter check - only returns true if user owns the project.

```typescript
if (isProjectOwner(project, user._id)) {
  // User is the owner (not just org member)
}
```

#### `isProjectPublic(project)`
Check if project is published and publicly accessible.

```typescript
if (isProjectPublic(project)) {
  // Anyone can view this project
}
```

#### `canViewSubmissions(project, userId, organizationId?)`
Check if user can view submissions for a project.

```typescript
if (canViewSubmissions(project, user._id, user.organizationId)) {
  // User can view submissions
}
```

#### `canMarkSubmissions(project, userId, organizationId?)`
Check if user can mark/grade submissions.

```typescript
if (canMarkSubmissions(project, user._id, user.organizationId)) {
  // User can mark submissions
}
```

## Route Protection Patterns

### Protected Routes (Authenticated Users Only)

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  // 1. Check authentication
  const { userId } = await getAuth(args);
  if (!userId) {
    throw redirect("/sign-in?redirect_url=/projects/" + projectId + "/editor");
  }

  try {
    // 2. Fetch data (authorization checked in Convex)
    const project = await fetchQuery(api.projects.get, { 
      projectId: projectId as any 
    });

    if (!project) {
      throw redirect("/dashboard");
    }

    return { project };
  } catch (error) {
    console.error("Error:", error);
    throw redirect("/dashboard");
  }
}
```

### Public Routes (Published Projects)

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  try {
    // No authentication required
    const project = await fetchQuery(api.projects.getByPublishedUrl, {
      publishedUrl: projectId,
    });

    if (!project || project.status !== "published") {
      throw redirect("/");
    }

    return { project };
  } catch (error) {
    throw redirect("/");
  }
}
```

## Convex Authorization Pattern

All Convex functions check authorization:

```typescript
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // 1. Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // 2. Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 3. Get resource
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // 4. Check authorization
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    return project;
  },
});
```

## Organization-Based Access

### How It Works

1. Users can optionally belong to an organization
2. Projects can be assigned to an organization
3. All organization members can access organization projects
4. Organization creator has additional permissions

### Database Schema

```typescript
users: {
  organizationId?: Id<"organizations">
}

projects: {
  userId: Id<"users">          // Owner
  organizationId?: Id<"organizations">  // Optional org
}

organizations: {
  createdBy: Id<"users">
  members: Id<"users">[]
  sharedCredits: boolean
}
```

### Checking Organization Access

```typescript
// In Convex function
const hasAccess =
  project.userId === user._id ||  // User owns it
  (user.organizationId && project.organizationId === user.organizationId);  // Org member

// In component
if (canAccessProject(project, user._id, user.organizationId)) {
  // User has access
}
```

## Best Practices

### 1. Always Check Auth in Loaders

```typescript
// Good
const { userId } = await getAuth(args);
if (!userId) throw redirect("/sign-in");

// Bad - no auth check
// Just fetching data without checking who's requesting it
```

### 2. Let Convex Handle Authorization

```typescript
// Good - Convex function checks authorization
const project = await fetchQuery(api.projects.get, { projectId });

// Bad - fetching without authorization check
// This bypasses the security layer
```

### 3. Use Helper Functions

```typescript
// Good
if (canAccessProject(project, userId, orgId)) { ... }

// Bad - duplicate logic
if (project.userId === userId || 
    (orgId && project.organizationId === orgId)) { ... }
```

### 4. Handle Errors Gracefully

```typescript
try {
  const data = await fetchQuery(...);
  return { data };
} catch (error) {
  console.error("Error:", error);
  throw redirect("/dashboard");  // Safe fallback
}
```

## Testing

All auth helpers are thoroughly tested in `auth.test.ts`:

```bash
pnpm test app/lib/auth.test.ts
```

Tests cover:
- Project access control (owner, org member, non-member)
- Organization membership checks
- Public project access
- Redirect URL handling
- Edge cases (empty arrays, undefined values)

## Security Considerations

1. **Never trust client-side checks** - Always verify on server
2. **Use Convex functions** - They run on the server with proper auth
3. **Check both user and organization** - Projects can be shared
4. **Redirect on error** - Don't expose sensitive error messages
5. **Use HTTPS** - Always in production
6. **Rotate secrets** - Keep Clerk and Convex keys secure

## Common Patterns

### Check if user can edit

```typescript
if (isProjectOwner(project, user._id)) {
  // Only owner can delete/publish
} else if (canAccessProject(project, user._id, user.organizationId)) {
  // Org members can edit but not delete
}
```

### Conditional UI rendering

```typescript
{canMarkSubmissions(project, user._id, user.organizationId) && (
  <Button onClick={handleMark}>Mark Submission</Button>
)}
```

### Loading user data

```typescript
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  requireAuth(userId);
  
  const [user, organization] = await Promise.all([
    getUserInLoader(userId),
    getUserOrganizationInLoader(userId)
  ]);
  
  return { user, organization };
}
```

## Troubleshooting

### "Unauthenticated" error
- User is not signed in
- Session expired
- Check Clerk configuration

### "Unauthorized" error
- User doesn't have permission
- Project doesn't belong to user or their org
- Check ownership and organization membership

### Redirect loop
- Check if redirect URL is valid
- Ensure protected routes have auth checks
- Verify Clerk is configured correctly

### "User not found" error
- User not synced to Convex database
- Call `ensureUserExists()` in loader
- Check user creation in Clerk webhook