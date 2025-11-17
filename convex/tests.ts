import { query } from "./_generated/server";
import { v } from "convex/values";

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

