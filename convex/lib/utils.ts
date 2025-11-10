import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

/**
 * Utility functions for Convex operations
 */

// Get current user from auth
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Look up user by clerkUserId
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) =>
      q.eq("clerkUserId", identity.subject as string),
    )
    .first();

  return user;
}

// Get current user or throw error
export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

// Check if user owns a project
export async function checkProjectOwnership(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">,
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project) {
    return false;
  }

  // Check if user is owner
  if (project.userId === userId) {
    return true;
  }

  // Check if user is a collaborator
  if (project.collaborators && project.collaborators.includes(userId)) {
    return true;
  }

  // Check if user is in the same organization
  if (project.organizationId) {
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("organizationId"), project.organizationId))
      .first();
    if (membership && membership.status === "active") {
      return true;
    }
  }

  return false;
}

// Check user has enough credits
export async function hasEnoughCredits(
  user: any,
  requiredCredits: number,
): Promise<boolean> {
  return user.credits >= requiredCredits;
}

// Deduct credits from user
export async function deductCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  credits: number,
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.credits < credits) {
    throw new Error("Insufficient credits");
  }

  await ctx.db.patch(userId, {
    credits: user.credits - credits,
    updatedAt: Date.now(),
  });
}

// Add credits to user
export async function addCredits(
  ctx: MutationCtx,
  userId: Id<"users">,
  credits: number,
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await ctx.db.patch(userId, {
    credits: user.credits + credits,
    updatedAt: Date.now(),
  });
}

// Generate a unique access code for projects
export function generateAccessCode(length: number = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Calculate percentage score
export function calculatePercentage(earned: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((earned / total) * 100);
}

// Check if submission passed based on passing score
export function didPass(percentage: number, passingScore?: number): boolean {
  if (!passingScore) return true;
  return percentage >= passingScore;
}

// Get subscription tier credits allocation
export function getTierCredits(
  tier: "free" | "starter" | "pro" | "enterprise",
): number {
  const credits = {
    free: 10,
    starter: 100,
    pro: 500,
    enterprise: 2000,
  };
  return credits[tier];
}

// Check if user has access to a feature based on tier
export function hasFeatureAccess(
  userTier: "free" | "starter" | "pro" | "enterprise",
  requiredTier: "free" | "starter" | "pro" | "enterprise",
): boolean {
  const tierHierarchy = {
    free: 0,
    starter: 1,
    pro: 2,
    enterprise: 3,
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Create notification helper
export async function createNotification(
  ctx: MutationCtx,
  params: {
    userId: Id<"users">;
    type:
      | "submission"
      | "marking_complete"
      | "grade_released"
      | "deadline_reminder"
      | "credit_low"
      | "plan_upgrade";
    title: string;
    message: string;
    link?: string;
  },
): Promise<Id<"notifications">> {
  return await ctx.db.insert("notifications", {
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    read: false,
    createdAt: Date.now(),
  });
}

// Track analytics event
export async function trackAnalyticsEvent(
  ctx: MutationCtx,
  params: {
    userId?: Id<"users">;
    eventType: string;
    metadata: any;
    projectId?: Id<"projects">;
  },
): Promise<Id<"analyticsEvents">> {
  return await ctx.db.insert("analyticsEvents", {
    userId: params.userId,
    eventType: params.eventType,
    metadata: params.metadata,
    projectId: params.projectId,
    timestamp: Date.now(),
  });
}

// Get user's available credits (personal + organization)
export async function getTotalAvailableCredits(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return 0;
  }

  let totalCredits = user.credits;

  // Add organization credits if user belongs to one
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("status"), "active"))
    .first();

  if (membership) {
    const organization = await ctx.db.get(membership.organizationId);
    if (organization) {
      totalCredits += organization.credits;
    }
  }

  return totalCredits;
}

// Format date for display
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Paginate results
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResults<T> {
  results: T[];
  total: number;
  hasMore: boolean;
}

export function paginateArray<T>(
  array: T[],
  params: PaginationParams = {},
): PaginatedResults<T> {
  const limit = params.limit || 20;
  const offset = params.offset || 0;

  const results = array.slice(offset, offset + limit);
  const hasMore = offset + limit < array.length;

  return {
    results,
    total: array.length,
    hasMore,
  };
}
