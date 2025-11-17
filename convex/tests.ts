import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listTests = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.union(v.literal("test"), v.literal("survey"), v.literal("essay"))),
    sortBy: v.optional(v.union(v.literal("name"), v.literal("recency"))),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // Query all tests for this user
    const tests = await ctx.db
      .query("tests")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter by search term (case-insensitive)
    let filteredTests = tests;
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredTests = filteredTests.filter((test) =>
        test.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (args.type) {
      filteredTests = filteredTests.filter((test) => test.type === args.type);
    }

    // Sort
    if (args.sortBy === "name") {
      filteredTests.sort((a, b) => a.name.localeCompare(b.name));
    } else if (args.sortBy === "recency") {
      filteredTests.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filteredTests;
  },
});

export const getTest = query({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      return null;
    }

    return test;
  },
});

export const createTest = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("survey"), v.literal("essay")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const testId = await ctx.db.insert("tests", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
      description: args.description,
      fields: [],
      createdAt: Date.now(),
    });

    return testId;
  },
});

export const updateTest = mutation({
  args: {
    testId: v.id("tests"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    fields: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.union(
            v.literal("shortInput"),
            v.literal("longInput"),
            v.literal("multipleChoice"),
            v.literal("checkboxes"),
            v.literal("dropdown"),
            v.literal("imageChoice"),
            v.literal("fileUpload"),
            v.literal("pageBreak"),
            v.literal("infoBlock")
          ),
          label: v.string(),
          required: v.optional(v.boolean()),
          options: v.optional(v.array(v.string())),
          order: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    const updates: {
      name?: string;
      description?: string;
      fields?: Array<{
        id: string;
        type: "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "fileUpload" | "pageBreak" | "infoBlock";
        label: string;
        required?: boolean;
        options?: string[];
        order: number;
      }>;
    } = {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.fields !== undefined) {
      updates.fields = args.fields;
    }

    await ctx.db.patch(args.testId, updates);

    return await ctx.db.get(args.testId);
  },
});

export const deleteTest = mutation({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    await ctx.db.delete(args.testId);
  },
});

