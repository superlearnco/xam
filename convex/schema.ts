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
    aiModel: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("by_user_date", ["userId", "createdAt"])
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
    description: v.optional(v.string()),
    type: v.union(v.literal("test"), v.literal("survey"), v.literal("essay")),
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
            v.literal("pageBreak"),
            v.literal("infoBlock")
          ),
          label: v.string(),
          required: v.optional(v.boolean()),
          options: v.optional(v.array(v.string())),
          order: v.number(),
          correctAnswers: v.optional(v.array(v.number())),
          marks: v.optional(v.number()),
          placeholder: v.optional(v.string()),
          helpText: v.optional(v.string()),
          minLength: v.optional(v.number()),
          maxLength: v.optional(v.number()),
          pattern: v.optional(v.string()),
          width: v.optional(v.string()),
          fileUrl: v.optional(v.string()),
          latexContent: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
    lastEdited: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    requireAuth: v.optional(v.boolean()),
    password: v.optional(v.string()),
    disableCopyPaste: v.optional(v.boolean()),
    requireFullScreen: v.optional(v.boolean()),
    blockTabSwitching: v.optional(v.boolean()),
    allowBackNavigation: v.optional(v.boolean()),
    passingGrade: v.optional(v.number()),
    instantFeedback: v.optional(v.boolean()),
    showAnswerKey: v.optional(v.boolean()),
    timeLimitMinutes: v.optional(v.number()),
    randomizeQuestions: v.optional(v.boolean()),
    shuffleOptions: v.optional(v.boolean()),
    viewType: v.optional(v.union(v.literal("singlePage"), v.literal("oneQuestionPerPage"))),
  }).index("userId", ["userId"]),
  testSubmissions: defineTable({
    testId: v.id("tests"),
    respondentName: v.optional(v.string()),
    respondentEmail: v.optional(v.string()),
    responses: v.any(),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    percentage: v.optional(v.number()),
    submittedAt: v.number(),
    startedAt: v.number(),
    isMarked: v.optional(v.boolean()),
    fieldMarks: v.optional(v.any()),
  })
    .index("testId", ["testId"])
    .index("respondentEmail", ["respondentEmail"]),
});
