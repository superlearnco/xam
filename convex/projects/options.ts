import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// Get project options
export const get = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const options = await ctx.db
      .query("projectOptions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!options) {
      throw new Error("Project options not found");
    }

    return options;
  },
});

// Update project options
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    headerTitle: v.optional(v.string()),
    headerColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    logo: v.optional(v.string()),
    requireLogin: v.optional(v.boolean()),
    password: v.optional(v.string()),
    allowedDomain: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    showProgressBar: v.optional(v.boolean()),
    shuffleQuestions: v.optional(v.boolean()),
    shuffleOptions: v.optional(v.boolean()),
    instantFeedback: v.optional(v.boolean()),
    showCorrectAnswers: v.optional(v.boolean()),
    showScore: v.optional(v.boolean()),
    allowMultipleSubmissions: v.optional(v.boolean()),
    showSubmissionConfirmation: v.optional(v.boolean()),
    confirmationMessage: v.optional(v.string()),
    closeDate: v.optional(v.number()),
    maxSubmissions: v.optional(v.number()),
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

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const options = await ctx.db
      .query("projectOptions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!options) {
      throw new Error("Project options not found");
    }

    const updateData: Partial<Doc<"projectOptions">> = {
      updatedAt: Date.now(),
    };

    if (args.headerTitle !== undefined) updateData.headerTitle = args.headerTitle;
    if (args.headerColor !== undefined) updateData.headerColor = args.headerColor;
    if (args.backgroundColor !== undefined) updateData.backgroundColor = args.backgroundColor;
    if (args.accentColor !== undefined) updateData.accentColor = args.accentColor;
    if (args.logo !== undefined) updateData.logo = args.logo;
    if (args.requireLogin !== undefined) updateData.requireLogin = args.requireLogin;
    if (args.password !== undefined) updateData.password = args.password;
    if (args.allowedDomain !== undefined) updateData.allowedDomain = args.allowedDomain;
    if (args.timeLimit !== undefined) updateData.timeLimit = args.timeLimit;
    if (args.showProgressBar !== undefined) updateData.showProgressBar = args.showProgressBar;
    if (args.shuffleQuestions !== undefined) updateData.shuffleQuestions = args.shuffleQuestions;
    if (args.shuffleOptions !== undefined) updateData.shuffleOptions = args.shuffleOptions;
    if (args.instantFeedback !== undefined) updateData.instantFeedback = args.instantFeedback;
    if (args.showCorrectAnswers !== undefined) updateData.showCorrectAnswers = args.showCorrectAnswers;
    if (args.showScore !== undefined) updateData.showScore = args.showScore;
    if (args.allowMultipleSubmissions !== undefined) updateData.allowMultipleSubmissions = args.allowMultipleSubmissions;
    if (args.showSubmissionConfirmation !== undefined) updateData.showSubmissionConfirmation = args.showSubmissionConfirmation;
    if (args.confirmationMessage !== undefined) updateData.confirmationMessage = args.confirmationMessage;
    if (args.closeDate !== undefined) updateData.closeDate = args.closeDate;
    if (args.maxSubmissions !== undefined) updateData.maxSubmissions = args.maxSubmissions;

    await ctx.db.patch(options._id, updateData);

    // Update project's updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    });

    return options._id;
  },
});
