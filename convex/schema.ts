import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    organizationId: v.optional(v.id("organizations")),
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

  projects: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"]),

  fields: defineTable({
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
    order: v.number(),
    question: v.string(),
    description: v.optional(v.string()),
    marks: v.optional(v.number()),
    required: v.boolean(),
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
    scaleMin: v.optional(v.number()),
    scaleMax: v.optional(v.number()),
    scaleStep: v.optional(v.number()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_order", ["projectId", "order"]),

  projectOptions: defineTable({
    projectId: v.id("projects"),
    headerTitle: v.optional(v.string()),
    headerColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    logo: v.optional(v.string()),
    requireLogin: v.boolean(),
    password: v.optional(v.string()),
    allowedDomain: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    showProgressBar: v.boolean(),
    shuffleQuestions: v.boolean(),
    shuffleOptions: v.boolean(),
    instantFeedback: v.boolean(),
    showCorrectAnswers: v.boolean(),
    showScore: v.boolean(),
    allowMultipleSubmissions: v.boolean(),
    showSubmissionConfirmation: v.boolean(),
    confirmationMessage: v.optional(v.string()),
    closeDate: v.optional(v.number()),
    maxSubmissions: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  submissions: defineTable({
    projectId: v.id("projects"),
    respondentName: v.optional(v.string()),
    respondentEmail: v.optional(v.string()),
    respondentUserId: v.optional(v.id("users")),
    status: v.union(
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("marked"),
      v.literal("returned")
    ),
    submittedAt: v.optional(v.number()),
    totalMarks: v.optional(v.number()),
    earnedMarks: v.optional(v.number()),
    percentage: v.optional(v.number()),
    grade: v.optional(v.string()),
    markedBy: v.optional(v.id("users")),
    markedAt: v.optional(v.number()),
    aiMarked: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_respondent", ["respondentUserId"])
    .index("by_project_status", ["projectId", "status"]),

  responses: defineTable({
    submissionId: v.id("submissions"),
    fieldId: v.id("fields"),
    projectId: v.id("projects"),
    value: v.optional(
      v.union(
        v.string(),
        v.array(v.string()),
        v.number(),
        v.boolean(),
        v.null()
      )
    ),
    fileUrl: v.optional(v.string()),
    isCorrect: v.optional(v.boolean()),
    marksAwarded: v.optional(v.number()),
    maxMarks: v.optional(v.number()),
    feedback: v.optional(v.string()),
    markedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_field", ["fieldId"])
    .index("by_project", ["projectId"]),

  aiUsage: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    feature: v.union(
      v.literal("generate_test"),
      v.literal("generate_options"),
      v.literal("grade_response"),
      v.literal("bulk_grade"),
      v.literal("suggest_feedback")
    ),
    model: v.string(),
    tokensInput: v.number(),
    tokensOutput: v.number(),
    cost: v.number(),
    projectId: v.optional(v.id("projects")),
    submissionId: v.optional(v.id("submissions")),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_feature", ["feature"]),

  aiCredits: defineTable({
    userId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    balance: v.number(),
    plan: v.union(
      v.literal("free"),
      v.literal("pay_as_you_go"),
      v.literal("subscription")
    ),
    billingPeriodStart: v.optional(v.number()),
    billingPeriodEnd: v.optional(v.number()),
    periodUsage: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"]),

  organizations: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    members: v.array(v.id("users")),
    sharedCredits: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_member", ["members"]),
});
