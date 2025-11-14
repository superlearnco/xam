import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

// List all projects for the current user
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

    // Get projects owned by user
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get projects from user's organization
    let orgProjects: Doc<"projects">[] = [];
    if (user.organizationId) {
      orgProjects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .collect();
    }

    // Combine and deduplicate
    const allProjects = [...userProjects];
    for (const proj of orgProjects) {
      if (!allProjects.find((p) => p._id === proj._id)) {
        allProjects.push(proj);
      }
    }

    return allProjects.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get a single project by ID
export const get = query({
  args: {
    projectId: v.id("projects"),
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

    return project;
  },
});

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    description: v.optional(v.string()),
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
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      organizationId: user.organizationId,
      name: args.name,
      type: args.type,
      description: args.description,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // Create default project options
    await ctx.db.insert("projectOptions", {
      projectId,
      requireLogin: false,
      showProgressBar: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      instantFeedback: false,
      showCorrectAnswers: false,
      showScore: true,
      allowMultipleSubmissions: false,
      showSubmissionConfirmation: true,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

// Update a project
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
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

    const updateData: Partial<Doc<"projects">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.projectId, updateData);

    return args.projectId;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
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

    // Delete all related data
    // Delete fields
    const fields = await ctx.db
      .query("fields")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    // Delete project options
    const options = await ctx.db
      .query("projectOptions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    if (options) {
      await ctx.db.delete(options._id);
    }

    // Delete submissions and responses
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const submission of submissions) {
      // Delete responses
      const responses = await ctx.db
        .query("responses")
        .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
        .collect();
      for (const response of responses) {
        await ctx.db.delete(response._id);
      }
      await ctx.db.delete(submission._id);
    }

    // Finally delete the project
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

// Publish a project
export const publish = mutation({
  args: {
    projectId: v.id("projects"),
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

    // Generate a unique URL slug
    const publishedUrl = `${project._id}`;

    await ctx.db.patch(args.projectId, {
      status: "published",
      publishedUrl,
      updatedAt: Date.now(),
    });

    return { publishedUrl };
  },
});

// Unpublish a project
export const unpublish = mutation({
  args: {
    projectId: v.id("projects"),
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

    await ctx.db.patch(args.projectId, {
      status: "draft",
      publishedUrl: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get project by published URL (public access)
export const getByPublishedUrl = query({
  args: {
    publishedUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("publishedUrl"), args.publishedUrl))
      .collect();

    if (projects.length === 0) {
      return null;
    }

    const project = projects[0];

    // Only return if published
    if (project.status !== "published") {
      return null;
    }

    return project;
  },
});

// Get project stats for dashboard
export const getStats = query({
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

    // Get projects owned by user
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get projects from user's organization
    let orgProjects: Doc<"projects">[] = [];
    if (user.organizationId) {
      orgProjects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .collect();
    }

    // Combine and deduplicate
    const allProjects = [...userProjects];
    for (const proj of orgProjects) {
      if (!allProjects.find((p) => p._id === proj._id)) {
        allProjects.push(proj);
      }
    }

    // Calculate counts by type
    const testCount = allProjects.filter((p) => p.type === "test").length;
    const essayCount = allProjects.filter((p) => p.type === "essay").length;
    const surveyCount = allProjects.filter((p) => p.type === "survey").length;

    // Calculate submission counts
    let totalSubmissions = 0;
    for (const project of allProjects) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      totalSubmissions += submissions.length;
    }

    return {
      testCount,
      essayCount,
      surveyCount,
      totalProjects: allProjects.length,
      totalSubmissions,
    };
  },
});
