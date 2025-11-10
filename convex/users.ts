import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  getCurrentUserOrThrow,
  getTierCredits,
} from "./lib/utils";

// Query: Get current user
export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Query: Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});

// Query: Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    return user;
  },
});

// Query: Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

// Query: Get user by Polar customer ID
export const getUserByPolarCustomerId = query({
  args: { polarCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_polarCustomerId", (q) =>
        q.eq("polarCustomerId", args.polarCustomerId),
      )
      .first();

    return user;
  },
});

// Mutation: Create or update user from Clerk authentication
export const syncUserFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        emailVerified: args.emailVerified ?? existingUser.emailVerified,
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user with free tier defaults
    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      role: "teacher",
      credits: getTierCredits("free"),
      subscriptionTier: "free",
      subscriptionStatus: "active",
      emailVerified: args.emailVerified ?? false,
      preferences: {
        emailNotifications: true,
        theme: "system",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
    });

    return userId;
  },
});

// Mutation: Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    await ctx.db.patch(user._id, {
      name: args.name,
      avatar: args.avatar,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Mutation: Update user preferences
export const updatePreferences = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const currentPreferences = user.preferences || {
      emailNotifications: true,
      theme: "system" as const,
    };

    const updatedPreferences = {
      emailNotifications:
        args.emailNotifications !== undefined
          ? args.emailNotifications
          : currentPreferences.emailNotifications,
      theme: args.theme || currentPreferences.theme,
    };

    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Mutation: Complete onboarding

// Mutation: Update subscription tier
export const updateSubscriptionTier = mutation({
  args: {
    tier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    subscriptionStatus: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Add credits for the new tier (additive, not replacement)
    const tierCredits = getTierCredits(args.tier);

    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.subscriptionStatus,
      polarCustomerId: args.polarCustomerId,
      credits: user.credits + tierCredits,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Query: Get user's credit balance
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    let totalCredits = user.credits;

    // Add organization credits if user belongs to one
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    let organizationCredits = 0;
    if (membership) {
      const organization = await ctx.db.get(membership.organizationId);
      if (organization) {
        organizationCredits = organization.credits;
        totalCredits += organizationCredits;
      }
    }

    return {
      personalCredits: user.credits,
      organizationCredits,
      totalCredits,
    };
  },
});

// Mutation: Add credits to user
export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits + args.credits,
      updatedAt: Date.now(),
    });

    return user.credits + args.credits;
  },
});

// Mutation: Deduct credits from user
export const deductCredits = mutation({
  args: {
    credits: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.credits < args.credits) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(user._id, {
      credits: user.credits - args.credits,
      updatedAt: Date.now(),
    });

    return user.credits - args.credits;
  },
});

// Query: Check if user has sufficient credits
export const hasEnoughCredits = query({
  args: { requiredCredits: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return false;
    }

    return user.credits >= args.requiredCredits;
  },
});

// Query: Get user statistics
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Count projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const publishedProjects = projects.filter((p) => p.status === "published");
    const draftProjects = projects.filter((p) => p.status === "draft");

    // Count total questions across all projects
    const allQuestions = await ctx.db
      .query("questions")
      .filter((q) => {
        const projectIds = projects.map((p) => p._id);
        return projectIds.some((id) => q.eq(q.field("projectId"), id));
      })
      .collect();

    // Count submissions across all projects
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => {
        const projectIds = projects.map((p) => p._id);
        return projectIds.some((id) => q.eq(q.field("projectId"), id));
      })
      .collect();

    const gradedSubmissions = submissions.filter((s) => s.status === "marked");

    return {
      totalProjects: projects.length,
      publishedProjects: publishedProjects.length,
      draftProjects: draftProjects.length,
      totalQuestions: allQuestions.length,
      totalSubmissions: submissions.length,
      gradedSubmissions: gradedSubmissions.length,
      credits: user.credits,
      subscriptionTier: user.subscriptionTier,
    };
  },
});
