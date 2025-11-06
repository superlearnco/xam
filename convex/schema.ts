import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    workosId: v.string(), // WorkOS user ID
    organizationId: v.optional(v.id("organizations")),
    role: v.union(v.literal("teacher"), v.literal("admin"), v.literal("student")),
    credits: v.number(), // Available AI generation credits
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    subscriptionStatus: v.optional(v.string()), // active, canceled, past_due, etc.
    stripeCustomerId: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    preferences: v.optional(v.object({
      emailNotifications: v.boolean(),
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_workosId", ["workosId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  // Organizations table (for multi-teacher accounts)
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.id("users"),
    plan: v.union(v.literal("pro"), v.literal("enterprise")),
    credits: v.number(), // Shared credits pool
    settings: v.optional(v.object({
      branding: v.optional(v.object({
        logo: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        customDomain: v.optional(v.string()),
      })),
      allowMemberCreation: v.boolean(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_ownerId", ["ownerId"]),

  // Projects table (tests/essays/surveys)
  projects: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    ownerId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    settings: v.object({
      timeLimit: v.optional(v.number()), // in minutes
      allowLateSubmissions: v.boolean(),
      dueDate: v.optional(v.number()),
      shuffleQuestions: v.boolean(),
      showCorrectAnswers: v.boolean(),
      showScoreImmediately: v.boolean(),
      requireAuthentication: v.boolean(),
      allowMultipleAttempts: v.boolean(),
      maxAttempts: v.optional(v.number()),
      passingScore: v.optional(v.number()), // percentage
    }),
    accessCode: v.optional(v.string()), // For student access
    publicUrl: v.optional(v.string()), // /test/[testId]
    totalQuestions: v.number(),
    totalPoints: v.number(),
    collaborators: v.optional(v.array(v.id("users"))), // For Pro+ plans
    templateId: v.optional(v.id("templates")),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_accessCode", ["accessCode"])
    .index("by_templateId", ["templateId"]),

  // Questions table
  questions: defineTable({
    projectId: v.id("projects"),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("true_false"),
      v.literal("short_answer"),
      v.literal("essay"),
      v.literal("fill_blank")
    ),
    questionText: v.string(),
    questionHtml: v.optional(v.string()), // Rich text content
    order: v.number(), // Position in the project
    points: v.number(),
    required: v.boolean(),

    // For multiple choice / true-false
    options: v.optional(v.array(v.object({
      id: v.string(),
      text: v.string(),
      isCorrect: v.boolean(),
    }))),

    // For short answer / essay
    expectedAnswer: v.optional(v.string()),
    answerKeywords: v.optional(v.array(v.string())), // For AI grading
    maxLength: v.optional(v.number()), // Character limit

    // AI-generated content
    explanation: v.optional(v.string()), // Why correct answer is correct
    aiGenerated: v.boolean(),
    aiGenerationId: v.optional(v.id("aiGenerationHistory")),

    // Question bank / reusability
    fromQuestionBank: v.optional(v.id("questionBank")),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_order", ["projectId", "order"])
    .index("by_fromQuestionBank", ["fromQuestionBank"]),

  // Submissions table (student responses)
  submissions: defineTable({
    projectId: v.id("projects"),
    studentEmail: v.string(), // Can be anonymous or authenticated
    studentName: v.optional(v.string()),
    userId: v.optional(v.id("users")), // If authenticated

    status: v.union(
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("graded")
    ),

    attemptNumber: v.number(), // For multiple attempts

    startedAt: v.number(),
    submittedAt: v.optional(v.number()),
    gradedAt: v.optional(v.number()),

    timeSpent: v.optional(v.number()), // in seconds

    score: v.optional(v.number()), // Total points earned
    maxScore: v.number(), // Total possible points
    percentage: v.optional(v.number()),
    passed: v.optional(v.boolean()),

    // Grading
    gradedBy: v.optional(v.id("users")), // Teacher who graded
    autoGraded: v.boolean(), // Whether AI auto-graded
    gradingNotes: v.optional(v.string()),

    // Metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_studentEmail", ["studentEmail"])
    .index("by_userId", ["userId"])
    .index("by_projectId_studentEmail", ["projectId", "studentEmail"])
    .index("by_status", ["status"]),

  // Answers table (individual question responses)
  answers: defineTable({
    submissionId: v.id("submissions"),
    questionId: v.id("questions"),
    projectId: v.id("projects"), // Denormalized for easier querying

    // Response content
    answerText: v.optional(v.string()), // For short answer/essay
    selectedOptionIds: v.optional(v.array(v.string())), // For multiple choice

    // Grading
    isCorrect: v.optional(v.boolean()), // For auto-gradable questions
    pointsEarned: v.optional(v.number()),
    maxPoints: v.number(),

    // Manual grading
    manuallyGraded: v.boolean(),
    gradingFeedback: v.optional(v.string()),

    // AI grading (for open-ended)
    aiGraded: v.boolean(),
    aiGradingScore: v.optional(v.number()),
    aiGradingFeedback: v.optional(v.string()),
    aiGradingId: v.optional(v.id("aiGenerationHistory")),

    timeSpent: v.optional(v.number()), // Time on this question

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_questionId", ["questionId"])
    .index("by_projectId", ["projectId"])
    .index("by_submission_question", ["submissionId", "questionId"]),

  // AI Generation History
  aiGenerationHistory: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("question_generation"),
      v.literal("distractor_generation"),
      v.literal("explanation_generation"),
      v.literal("grading"),
      v.literal("improvement_suggestion")
    ),
    projectId: v.optional(v.id("projects")),
    questionId: v.optional(v.id("questions")),

    prompt: v.string(),
    response: v.string(),
    model: v.string(), // e.g., "gemini-pro"

    creditsUsed: v.number(),
    tokensUsed: v.optional(v.number()),

    metadata: v.optional(v.any()), // Additional context

    success: v.boolean(),
    errorMessage: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_projectId", ["projectId"])
    .index("by_questionId", ["questionId"])
    .index("by_createdAt", ["createdAt"]),

  // Question Bank (reusable questions)
  questionBank: defineTable({
    ownerId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    type: v.union(
      v.literal("multiple_choice"),
      v.literal("true_false"),
      v.literal("short_answer"),
      v.literal("essay"),
      v.literal("fill_blank")
    ),

    questionText: v.string(),
    questionHtml: v.optional(v.string()),

    options: v.optional(v.array(v.object({
      id: v.string(),
      text: v.string(),
      isCorrect: v.boolean(),
    }))),

    expectedAnswer: v.optional(v.string()),
    explanation: v.optional(v.string()),

    subject: v.optional(v.string()),
    topic: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),

    timesUsed: v.number(),

    isPublic: v.boolean(), // Shared with community
    isTemplate: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_type", ["type"])
    .index("by_subject", ["subject"])
    .index("by_isPublic", ["isPublic"]),

  // Templates (for entire tests/projects)
  templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),

    ownerId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    isPublic: v.boolean(),
    isFeatured: v.boolean(),

    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    thumbnail: v.optional(v.string()),

    // Template content (serialized project + questions)
    content: v.any(),

    timesUsed: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_isPublic", ["isPublic"])
    .index("by_isFeatured", ["isFeatured"])
    .index("by_type", ["type"]),

  // Analytics Events
  analyticsEvents: defineTable({
    userId: v.optional(v.id("users")),
    eventType: v.string(), // e.g., "project_created", "test_submitted", etc.
    eventData: v.any(),

    projectId: v.optional(v.id("projects")),
    submissionId: v.optional(v.id("submissions")),

    sessionId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_eventType", ["eventType"])
    .index("by_projectId", ["projectId"])
    .index("by_createdAt", ["createdAt"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("submission_received"),
      v.literal("grading_complete"),
      v.literal("credit_low"),
      v.literal("subscription_expiring"),
      v.literal("collaboration_invite"),
      v.literal("system")
    ),

    title: v.string(),
    message: v.string(),

    actionUrl: v.optional(v.string()),

    read: v.boolean(),
    readAt: v.optional(v.number()),

    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"])
    .index("by_createdAt", ["createdAt"]),

  // Billing transactions
  billingTransactions: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    type: v.union(
      v.literal("subscription"),
      v.literal("credit_purchase"),
      v.literal("refund")
    ),

    amount: v.number(), // in cents
    currency: v.string(),

    stripePaymentIntentId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),

    description: v.string(),

    creditsAdded: v.optional(v.number()),

    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_stripePaymentIntentId", ["stripePaymentIntentId"]),
});
