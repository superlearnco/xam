import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    credits: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]),
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
    isMetered: v.optional(v.boolean()),
    meterIds: v.optional(v.array(v.string())),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),
  creditTransactions: defineTable({
    userId: v.string(),
    amount: v.number(),
    type: v.union(v.literal("purchase"), v.literal("usage"), v.literal("refund")),
    description: v.optional(v.string()),
    polarOrderId: v.optional(v.string()),
    meterId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("polarOrderId", ["polarOrderId"]),
  meterUsage: defineTable({
    userId: v.string(),
    subscriptionId: v.string(),
    meterId: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("subscriptionId", ["subscriptionId"])
    .index("meterId", ["meterId"]),
  tests: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("survey"), v.literal("essay")),
    createdAt: v.number(),
  }).index("userId", ["userId"]),
});
