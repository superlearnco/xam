import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - Authentication & User Management
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(
      v.literal("teacher"),
      v.literal("student"),
      v.literal("admin"),
    ),
    credits: v.number(), // AI generation credits (token-based, $1 = 10 credits)

    // Clerk integration
    clerkUserId: v.string(),
    clerkOrganizationId: v.optional(v.string()),

    // Billing integration (Polar)
    polarCustomerId: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.number(),

    // Preferences
    preferences: v.object({
      emailNotifications: v.boolean(),
      theme: v.union(
        v.literal("light"),
        v.literal("dark"),
        v.literal("system"),
      ),
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
    }),

    emailVerified: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_clerkOrganizationId", ["clerkOrganizationId"])
    .index("by_polarCustomerId", ["polarCustomerId"])
    .index("by_role", ["role"]),

  // Projects table - Tests/Essays/Surveys
  projects: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),

    thumbnail: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),

    // Comprehensive settings
    settings: v.object({
      duration: v.optional(v.number()), // in minutes
      maxAttempts: v.number(), // default 1
      passingGrade: v.number(), // percentage, default 60

      // Access control
      requireAuth: v.boolean(),
      requireEmailVerification: v.boolean(),
      passwordProtected: v.boolean(),
      password: v.optional(v.string()),

      // Security features
      disableCopyPaste: v.boolean(),
      fullScreenRequired: v.boolean(),
      blockTabSwitching: v.boolean(),

      // Grading & feedback
      autoGrade: v.boolean(), // default true
      enableAIMarking: v.boolean(),
      instantFeedback: v.boolean(),
      showAnswerKey: v.boolean(),
      showExplanations: v.boolean(),

      // Notification settings
      notifyTeacherOnSubmission: v.boolean(),
      notifyTeacherDailySummary: v.boolean(),
      notifyTeacherWhenMarked: v.boolean(),
      notifyStudentOnSubmission: v.boolean(),
      notifyStudentOnGradeRelease: v.boolean(),
      notifyStudentDeadlineReminders: v.boolean(),

      // Additional settings
      shuffleQuestions: v.optional(v.boolean()),
      dueDate: v.optional(v.number()),
      allowLateSubmissions: v.optional(v.boolean()),
    }),

    // Statistics
    totalMarks: v.number(),
    submissionCount: v.number(), // default 0
    averageGrade: v.optional(v.number()),
    viewCount: v.number(), // default 0

    // Access
    accessCode: v.optional(v.string()),
    publicUrl: v.optional(v.string()),

    // Collaboration (Pro+)
    collaborators: v.optional(v.array(v.id("users"))),

    // Template
    templateId: v.optional(v.id("templates")),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_accessCode", ["accessCode"])
    .index("by_templateId", ["templateId"])
    .index("by_createdAt", ["createdAt"]),

  // Questions table - All question types
  questions: defineTable({
    projectId: v.id("projects"),
    order: v.number(), // for sorting

    type: v.union(
      v.literal("multiple-choice"),
      v.literal("multiple-select"),
      v.literal("short-text"),
      v.literal("long-text"),
      v.literal("rich-text"),
      v.literal("dropdown"),
      v.literal("image-choice"),
      v.literal("file-upload"),
      v.literal("image-upload"),
      v.literal("rating-scale"),
      v.literal("linear-scale"),
      v.literal("matrix"),
      v.literal("section-header"),
      v.literal("page-break"),
      v.literal("info-block"),
    ),

    questionText: v.string(),
    description: v.optional(v.string()), // additional instructions
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),

    points: v.number(),
    required: v.boolean(), // default true

    // Options for choice questions
    options: v.optional(
      v.array(
        v.object({
          text: v.string(),
          imageUrl: v.optional(v.string()),
          isCorrect: v.boolean(),
        }),
      ),
    ),

    // Correct answers
    correctAnswers: v.optional(v.array(v.string())), // for multiple-select
    correctAnswer: v.optional(v.string()), // for single answer
    modelAnswer: v.optional(v.string()), // for AI grading reference

    // Rubric for grading
    rubric: v.optional(
      v.array(
        v.object({
          criterion: v.string(),
          points: v.number(),
          description: v.string(),
        }),
      ),
    ),

    explanation: v.optional(v.string()), // shown after submission

    // Question settings
    randomizeOptions: v.boolean(),
    allowOther: v.boolean(), // for choice questions
    minLength: v.optional(v.number()), // for text responses
    maxLength: v.optional(v.number()), // for text responses

    // File upload settings
    fileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()), // in MB

    // Scale settings
    scaleMin: v.optional(v.number()),
    scaleMax: v.optional(v.number()),
    scaleMinLabel: v.optional(v.string()),
    scaleMaxLabel: v.optional(v.string()),

    // Matrix settings
    matrixRows: v.optional(v.array(v.string())),
    matrixColumns: v.optional(v.array(v.string())),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    // AI tracking
    generatedByAI: v.boolean(),
    aiGenerationId: v.optional(v.id("aiGenerations")),

    // Question bank
    fromQuestionBank: v.optional(v.id("questionBank")),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_order", ["projectId", "order"])
    .index("by_fromQuestionBank", ["fromQuestionBank"])
    .index("by_type", ["type"]),

  // Submissions table - Student responses
  submissions: defineTable({
    projectId: v.id("projects"),

    // Student info
    studentId: v.optional(v.id("users")),
    studentName: v.string(),
    studentEmail: v.string(),

    attemptNumber: v.number(),

    status: v.union(
      v.literal("in-progress"),
      v.literal("submitted"),
      v.literal("marked"),
      v.literal("returned"),
    ),

    // Timestamps
    submittedAt: v.optional(v.number()),
    markedAt: v.optional(v.number()),
    returnedAt: v.optional(v.number()),
    startedAt: v.number(),
    timeSpent: v.number(), // in seconds

    // Security tracking
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    flagged: v.boolean(),
    flagReason: v.optional(v.string()),
    tabSwitches: v.number(), // default 0
    copyPasteAttempts: v.number(), // default 0

    // Scoring
    totalMarks: v.number(),
    awardedMarks: v.number(), // default 0
    percentage: v.number(),
    grade: v.optional(v.string()), // letter grade

    // Feedback
    feedback: v.optional(v.string()), // teacher's overall feedback
    markedBy: v.optional(v.id("users")),

    // Grading flags
    autoGraded: v.boolean(),
    aiGraded: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_studentId", ["studentId"])
    .index("by_studentEmail", ["studentEmail"])
    .index("by_projectId_studentEmail", ["projectId", "studentEmail"])
    .index("by_status", ["status"])
    .index("by_markedBy", ["markedBy"])
    .index("by_createdAt", ["createdAt"]),

  // Answers table - Individual question responses
  answers: defineTable({
    submissionId: v.id("submissions"),
    questionId: v.id("questions"),

    answerType: v.union(
      v.literal("multiple-choice"),
      v.literal("multiple-select"),
      v.literal("short-text"),
      v.literal("long-text"),
      v.literal("rich-text"),
      v.literal("dropdown"),
      v.literal("image-choice"),
      v.literal("file-upload"),
      v.literal("image-upload"),
      v.literal("rating-scale"),
      v.literal("linear-scale"),
      v.literal("matrix"),
    ),

    // Answer content
    textAnswer: v.optional(v.string()),
    selectedOption: v.optional(v.string()), // single choice
    selectedOptions: v.optional(v.array(v.string())), // multiple choice
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    scaleValue: v.optional(v.number()),
    matrixAnswers: v.optional(v.any()), // object: row -> column mapping

    // Grading
    isCorrect: v.optional(v.boolean()),
    pointsAwarded: v.number(), // default 0
    pointsPossible: v.number(),
    feedback: v.optional(v.string()), // per-question feedback

    // AI evaluation
    aiEvaluation: v.optional(
      v.object({
        score: v.number(),
        reasoning: v.string(),
        suggestions: v.array(v.string()),
        confidence: v.number(), // 0-1
      }),
    ),

    markedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_questionId", ["questionId"])
    .index("by_submission_question", ["submissionId", "questionId"]),

  // Organizations table - Multi-teacher accounts
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.id("users"),

    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),

    polarOrganizationId: v.optional(v.string()),

    credits: v.number(), // shared pool

    settings: v.object({
      branding: v.optional(
        v.object({
          logo: v.optional(v.string()),
          primaryColor: v.optional(v.string()),
          customDomain: v.optional(v.string()),
        }),
      ),
      allowMemberCreation: v.boolean(),
      defaultCreditsPerMember: v.optional(v.number()),
    }),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_ownerId", ["ownerId"])
    .index("by_polarOrganizationId", ["polarOrganizationId"]),

  // Organization members
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),

    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),

    invitedBy: v.optional(v.id("users")),
    invitedAt: v.number(),
    joinedAt: v.optional(v.number()),

    status: v.union(
      v.literal("invited"),
      v.literal("active"),
      v.literal("inactive"),
    ),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"])
    .index("by_organizationId_userId", ["organizationId", "userId"])
    .index("by_status", ["status"]),

  // AI Generation History
  aiGenerations: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),

    type: v.union(
      v.literal("questions"),
      v.literal("distractors"),
      v.literal("explanations"),
      v.literal("grading"),
    ),

    prompt: v.string(),
    result: v.string(), // JSON stringified result
    model: v.string(), // e.g., "gemini-pro", "gpt-4"

    tokensUsed: v.number(),
    creditsDeducted: v.number(),

    success: v.boolean(),
    error: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  // Analytics Events
  analyticsEvents: defineTable({
    eventType: v.string(),
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),

    metadata: v.any(), // flexible data

    timestamp: v.number(),
  })
    .index("by_eventType", ["eventType"])
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"])
    .index("by_timestamp", ["timestamp"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),

    type: v.union(
      v.literal("submission"),
      v.literal("marking_complete"),
      v.literal("grade_released"),
      v.literal("deadline_reminder"),
      v.literal("credit_low"),
      v.literal("plan_upgrade"),
    ),

    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),

    read: v.boolean(), // default false
    readAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"])
    .index("by_createdAt", ["createdAt"]),

  // Question Bank - Reusable questions
  questionBank: defineTable({
    ownerId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    type: v.union(
      v.literal("multiple-choice"),
      v.literal("multiple-select"),
      v.literal("short-text"),
      v.literal("long-text"),
      v.literal("rich-text"),
      v.literal("dropdown"),
      v.literal("image-choice"),
      v.literal("file-upload"),
      v.literal("image-upload"),
      v.literal("rating-scale"),
      v.literal("linear-scale"),
      v.literal("matrix"),
    ),

    questionText: v.string(),
    questionHtml: v.optional(v.string()),

    options: v.optional(
      v.array(
        v.object({
          text: v.string(),
          imageUrl: v.optional(v.string()),
          isCorrect: v.boolean(),
        }),
      ),
    ),

    expectedAnswer: v.optional(v.string()),
    explanation: v.optional(v.string()),

    subject: v.optional(v.string()),
    topic: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),

    timesUsed: v.number(),

    isPublic: v.boolean(),
    isTemplate: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_type", ["type"])
    .index("by_subject", ["subject"])
    .index("by_isPublic", ["isPublic"]),

  // Templates - Entire test/project templates
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

    content: v.any(), // serialized project + questions

    timesUsed: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_isPublic", ["isPublic"])
    .index("by_isFeatured", ["isFeatured"])
    .index("by_type", ["type"]),

  // Billing Transactions
  billingTransactions: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),

    type: v.union(
      v.literal("subscription"),
      v.literal("credit_purchase"),
      v.literal("credit_usage"),
      v.literal("refund"),
    ),

    amount: v.number(), // in cents
    currency: v.string(),

    provider: v.string(), // "polar" or other
    providerTransactionId: v.optional(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded"),
    ),

    description: v.string(),
    creditsAdded: v.optional(v.number()),

    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_providerTransactionId", ["providerTransactionId"])
    .index("by_createdAt", ["createdAt"]),
});
