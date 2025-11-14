import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// List all fields for a project
export const list = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query("fields")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return fields.sort((a, b) => a.order - b.order);
  },
});

// Get a single field by ID
export const get = query({
  args: {
    fieldId: v.id("fields"),
  },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }
    return field;
  },
});

// Create a new field
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("short_text"),
      v.literal("long_text"),
      v.literal("multiple_choice"),
      v.literal("checkbox"),
      v.literal("dropdown"),
      v.literal("file_upload"),
      v.literal("rating"),
      v.literal("date"),
      v.literal("email"),
      v.literal("number")
    ),
    question: v.string(),
    description: v.optional(v.string()),
    marks: v.optional(v.number()),
    required: v.optional(v.boolean()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.union(v.string(), v.array(v.string()))),
    ratingScale: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      })
    ),
    ratingLabels: v.optional(
      v.object({
        min: v.string(),
        max: v.string(),
      })
    ),
    allowedFileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
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

    // Get the highest order number for this project
    const existingFields = await ctx.db
      .query("fields")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const maxOrder = existingFields.length > 0
      ? Math.max(...existingFields.map((f) => f.order))
      : -1;

    const now = Date.now();
    const fieldId = await ctx.db.insert("fields", {
      projectId: args.projectId,
      type: args.type,
      order: maxOrder + 1,
      question: args.question,
      description: args.description,
      marks: args.marks,
      required: args.required ?? true,
      options: args.options,
      correctAnswer: args.correctAnswer,
      ratingScale: args.ratingScale,
      ratingLabels: args.ratingLabels,
      allowedFileTypes: args.allowedFileTypes,
      maxFileSize: args.maxFileSize,
      minLength: args.minLength,
      maxLength: args.maxLength,
      createdAt: now,
      updatedAt: now,
    });

    // Update project's updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: now,
    });

    return fieldId;
  },
});

// Update a field
export const update = mutation({
  args: {
    fieldId: v.id("fields"),
    question: v.optional(v.string()),
    description: v.optional(v.string()),
    marks: v.optional(v.number()),
    required: v.optional(v.boolean()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.union(v.string(), v.array(v.string()))),
    ratingScale: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      })
    ),
    ratingLabels: v.optional(
      v.object({
        min: v.string(),
        max: v.string(),
      })
    ),
    allowedFileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
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

    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    const project = await ctx.db.get(field.projectId);
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

    const updateData: Partial<Doc<"fields">> = {
      updatedAt: Date.now(),
    };

    if (args.question !== undefined) updateData.question = args.question;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.marks !== undefined) updateData.marks = args.marks;
    if (args.required !== undefined) updateData.required = args.required;
    if (args.options !== undefined) updateData.options = args.options;
    if (args.correctAnswer !== undefined) updateData.correctAnswer = args.correctAnswer;
    if (args.ratingScale !== undefined) updateData.ratingScale = args.ratingScale;
    if (args.ratingLabels !== undefined) updateData.ratingLabels = args.ratingLabels;
    if (args.allowedFileTypes !== undefined) updateData.allowedFileTypes = args.allowedFileTypes;
    if (args.maxFileSize !== undefined) updateData.maxFileSize = args.maxFileSize;
    if (args.minLength !== undefined) updateData.minLength = args.minLength;
    if (args.maxLength !== undefined) updateData.maxLength = args.maxLength;

    await ctx.db.patch(args.fieldId, updateData);

    // Update project's updatedAt
    await ctx.db.patch(field.projectId, {
      updatedAt: Date.now(),
    });

    return args.fieldId;
  },
});

// Delete a field
export const deleteField = mutation({
  args: {
    fieldId: v.id("fields"),
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

    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    const project = await ctx.db.get(field.projectId);
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

    const deletedOrder = field.order;
    const projectId = field.projectId;

    await ctx.db.delete(args.fieldId);

    // Reorder remaining fields
    const remainingFields = await ctx.db
      .query("fields")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    for (const f of remainingFields) {
      if (f.order > deletedOrder) {
        await ctx.db.patch(f._id, {
          order: f.order - 1,
          updatedAt: Date.now(),
        });
      }
    }

    // Update project's updatedAt
    await ctx.db.patch(projectId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reorder fields
export const reorder = mutation({
  args: {
    projectId: v.id("projects"),
    fieldIds: v.array(v.id("fields")),
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

    const now = Date.now();

    // Update the order of each field
    for (let i = 0; i < args.fieldIds.length; i++) {
      await ctx.db.patch(args.fieldIds[i], {
        order: i,
        updatedAt: now,
      });
    }

    // Update project's updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: now,
    });

    return { success: true };
  },
});
