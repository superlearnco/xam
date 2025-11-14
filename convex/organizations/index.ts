import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Get an organization by ID
export const get = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const organization = await ctx.db.get(args.orgId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if user is a member
    const isMember = organization.members.includes(user._id);
    if (!isMember) {
      throw new Error("Unauthorized");
    }

    return organization;
  },
});

// List all organizations for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get organizations where user is a member
    const allOrganizations = await ctx.db.query("organizations").collect();
    const userOrganizations = allOrganizations.filter((org) =>
      org.members.includes(user._id)
    );

    return userOrganizations.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new organization
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      createdBy: user._id,
      members: [user._id],
      sharedCredits: true,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize AI credits for the organization
    await ctx.db.insert("aiCredits", {
      organizationId,
      balance: 0,
      plan: "free",
      periodUsage: 0,
      lastUpdated: now,
    });

    // Update user's organizationId
    await ctx.db.patch(user._id, {
      organizationId,
    });

    return organizationId;
  },
});

// Add a member to an organization
export const addMember = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const organization = await ctx.db.get(args.orgId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if user is the creator
    if (organization.createdBy !== user._id) {
      throw new Error("Unauthorized: Only the creator can add members");
    }

    // Check if user to add exists
    const userToAdd = await ctx.db.get(args.userId);
    if (!userToAdd) {
      throw new Error("User to add not found");
    }

    // Check if user is already a member
    if (organization.members.includes(args.userId)) {
      throw new Error("User is already a member");
    }

    // Add member
    await ctx.db.patch(args.orgId, {
      members: [...organization.members, args.userId],
      updatedAt: Date.now(),
    });

    // Update user's organizationId
    await ctx.db.patch(args.userId, {
      organizationId: args.orgId,
    });

    return { success: true };
  },
});

// Remove a member from an organization
export const removeMember = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const organization = await ctx.db.get(args.orgId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if user is the creator
    if (organization.createdBy !== user._id) {
      throw new Error("Unauthorized: Only the creator can remove members");
    }

    // Cannot remove the creator
    if (args.userId === organization.createdBy) {
      throw new Error("Cannot remove the organization creator");
    }

    // Check if user is a member
    if (!organization.members.includes(args.userId)) {
      throw new Error("User is not a member");
    }

    // Remove member
    const updatedMembers = organization.members.filter((id) => id !== args.userId);
    await ctx.db.patch(args.orgId, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    // Update user's organizationId
    await ctx.db.patch(args.userId, {
      organizationId: undefined,
    });

    return { success: true };
  },
});
