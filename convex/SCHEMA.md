# Convex Database Schema Documentation

This document provides an overview of the complete database schema for the Xam application.

## Core Tables

### users
User accounts with authentication and subscription management.

**Key Fields:**
- `email` (string, indexed) - User email address
- `name` (string) - User's full name
- `avatar` (optional string) - Profile picture URL
- `role` (enum: "teacher" | "student" | "admin") - User role
- `credits` (number) - Available AI generation credits (default: 500)
- `workosUserId` (string, indexed) - WorkOS authentication ID
- `workosOrganizationId` (optional string, indexed) - WorkOS organization for SSO
- `stripeCustomerId` (optional string) - Stripe customer ID (if used)
- `polarCustomerId` (optional string, indexed) - Polar customer ID
- `polarSubscriptionId` (optional string) - Active Polar subscription ID
- `subscriptionTier` (enum: "free" | "starter" | "pro" | "enterprise")
- `subscriptionStatus` (optional string) - Subscription status
- `benefits` (optional array) - Granted benefit IDs
- `emailVerified` (boolean) - Email verification status
- `preferences` (object) - User preferences (emailNotifications, theme, language, timezone)
- `createdAt`, `updatedAt`, `lastLoginAt` (timestamps)

**Indexes:** by_email, by_workosUserId, by_workosOrganizationId, by_polarCustomerId, by_role

---

### projects
Tests, essays, and surveys created by teachers.

**Key Fields:**
- `userId` (ref users, indexed) - Project owner
- `organizationId` (optional ref organizations) - Organization if shared
- `name` (string) - Project title
- `description` (optional string) - Project description
- `type` (enum: "test" | "essay" | "survey")
- `status` (enum: "draft" | "published" | "archived")
- `thumbnail` (optional string) - Cover image URL
- `settings` (object) - Comprehensive project settings:
  - `duration` (optional number) - Time limit in minutes
  - `maxAttempts` (number) - Maximum submission attempts
  - `passingGrade` (number) - Passing percentage (default: 60)
  - `requireAuth`, `requireEmailVerification` (booleans)
  - `passwordProtected` (boolean)
  - `password` (optional string, hashed)
  - `disableCopyPaste`, `fullScreenRequired`, `blockTabSwitching` (booleans)
  - `autoGrade`, `enableAIMarking`, `instantFeedback` (booleans)
  - `showAnswerKey`, `showExplanations` (booleans)
  - Notification preferences for teachers and students
- `totalMarks` (number) - Total points possible
- `submissionCount`, `averageGrade`, `viewCount` (statistics)
- `accessCode`, `publicUrl` (optional strings) - Access control
- `collaborators` (optional array) - Shared access (Pro+)
- `templateId` (optional ref templates)
- `tags` (optional array)

**Indexes:** by_userId, by_organizationId, by_status, by_accessCode, by_templateId, by_createdAt

---

### questions
Individual questions within projects supporting 15+ question types.

**Key Fields:**
- `projectId` (ref projects, indexed) - Parent project
- `order` (number) - Sort order
- `type` (enum) - Question type: "multiple-choice", "multiple-select", "short-text", "long-text", "rich-text", "dropdown", "image-choice", "file-upload", "image-upload", "rating-scale", "linear-scale", "matrix", "section-header", "page-break", "info-block"
- `questionText` (string) - Question prompt
- `description` (optional string) - Additional instructions
- `imageUrl`, `videoUrl` (optional strings) - Media attachments
- `points` (number) - Points value
- `required` (boolean) - Is answer required
- `options` (optional array) - Choice options with text, imageUrl, isCorrect
- `correctAnswers` (optional array) - For multiple-select
- `correctAnswer` (optional string) - For single answer
- `modelAnswer` (optional string) - Reference answer for AI grading
- `rubric` (optional array) - Grading criteria objects
- `explanation` (optional string) - Shown after submission
- Question-specific settings: randomizeOptions, allowOther, minLength, maxLength
- File upload settings: fileTypes, maxFileSize
- Scale settings: scaleMin, scaleMax, scaleMinLabel, scaleMaxLabel
- Matrix settings: matrixRows, matrixColumns
- `generatedByAI` (boolean) - AI generation flag
- `aiGenerationId` (optional ref aiGenerations)
- `fromQuestionBank` (optional ref questionBank)
- `tags`, `difficulty` (optional)

**Indexes:** by_projectId, by_projectId_order, by_fromQuestionBank, by_type

---

### submissions
Student test submissions with comprehensive tracking.

**Key Fields:**
- `projectId` (ref projects, indexed)
- `studentId` (optional ref users, indexed) - If authenticated
- `studentName`, `studentEmail` (strings, email indexed)
- `attemptNumber` (number)
- `status` (enum: "in-progress" | "submitted" | "marked" | "returned")
- Timestamps: `startedAt`, `submittedAt`, `markedAt`, `returnedAt`
- `timeSpent` (number) - Duration in seconds
- Security tracking: `ipAddress`, `userAgent`, `flagged`, `flagReason`, `tabSwitches`, `copyPasteAttempts`
- Scoring: `totalMarks`, `awardedMarks`, `percentage`, `grade` (letter)
- `feedback` (optional string) - Teacher's overall feedback
- `markedBy` (optional ref users)
- `autoGraded`, `aiGraded` (booleans)

**Indexes:** by_projectId, by_studentId, by_studentEmail, by_projectId_studentEmail, by_status, by_markedBy, by_createdAt

---

### answers
Individual question responses within submissions.

**Key Fields:**
- `submissionId` (ref submissions, indexed)
- `questionId` (ref questions, indexed)
- `answerType` (enum) - Matches question types
- Answer content fields:
  - `textAnswer` (optional string)
  - `selectedOption` (optional string) - Single choice
  - `selectedOptions` (optional array) - Multiple choice
  - `fileUrl`, `fileName`, `fileSize` - File uploads
  - `scaleValue` (optional number)
  - `matrixAnswers` (optional object) - Row-column mapping
- Grading:
  - `isCorrect` (optional boolean)
  - `pointsAwarded`, `pointsPossible` (numbers)
  - `feedback` (optional string) - Per-question feedback
- `aiEvaluation` (optional object):
  - `score`, `reasoning`, `suggestions`, `confidence`
- `markedAt` (timestamp)

**Indexes:** by_submissionId, by_questionId, by_submission_question

---

### organizations
Multi-teacher accounts for schools/teams.

**Key Fields:**
- `name`, `slug` (strings, slug indexed)
- `ownerId` (ref users, indexed)
- `plan` (enum: "free" | "starter" | "pro" | "enterprise")
- `polarOrganizationId` (optional string, indexed)
- `credits` (number) - Shared credit pool
- `settings` (object):
  - `branding` (logo, primaryColor, customDomain)
  - `allowMemberCreation` (boolean)
  - `defaultCreditsPerMember` (optional number)

**Indexes:** by_slug, by_ownerId, by_polarOrganizationId

---

### organizationMembers
Organization membership management.

**Key Fields:**
- `organizationId` (ref organizations, indexed)
- `userId` (ref users, indexed)
- `role` (enum: "owner" | "admin" | "member")
- `invitedBy` (optional ref users)
- `invitedAt`, `joinedAt` (timestamps)
- `status` (enum: "invited" | "active" | "inactive")

**Indexes:** by_organizationId, by_userId, by_organizationId_userId, by_status

---

### aiGenerations
AI feature usage history for credits and analytics.

**Key Fields:**
- `userId` (ref users, indexed)
- `projectId` (optional ref projects, indexed)
- `type` (enum: "questions" | "distractors" | "explanations" | "grading")
- `prompt` (string) - Input prompt
- `result` (string) - JSON stringified result
- `model` (string) - AI model used (e.g., "gemini-pro", "gpt-4")
- `tokensUsed` (number)
- `creditsDeducted` (number)
- `success` (boolean)
- `error` (optional string)
- `createdAt` (timestamp)

**Indexes:** by_userId, by_projectId, by_type, by_createdAt

---

### analyticsEvents
Internal event tracking for usage analytics.

**Key Fields:**
- `eventType` (string, indexed) - Event identifier
- `userId` (optional ref users, indexed)
- `projectId` (optional ref projects, indexed)
- `metadata` (any) - Flexible event data
- `timestamp` (number, indexed)

**Indexes:** by_eventType, by_userId, by_projectId, by_timestamp

---

### notifications
In-app notification system.

**Key Fields:**
- `userId` (ref users, indexed)
- `type` (enum: "submission" | "marking_complete" | "grade_released" | "deadline_reminder" | "credit_low" | "plan_upgrade")
- `title`, `message` (strings)
- `link` (optional string) - Action URL
- `read` (boolean) - Read status
- `readAt` (optional timestamp)
- `createdAt` (timestamp)

**Indexes:** by_userId, by_userId_read, by_createdAt

---

## Supporting Tables

### questionBank
Reusable question library.

**Key Fields:**
- Similar structure to `questions` table
- `ownerId`, `organizationId` (refs)
- `subject`, `topic`, `tags`
- `timesUsed` (number)
- `isPublic`, `isTemplate` (booleans)

**Indexes:** by_ownerId, by_organizationId, by_type, by_subject, by_isPublic

---

### templates
Full project templates.

**Key Fields:**
- `name`, `description`, `type`
- `ownerId`, `organizationId` (refs)
- `isPublic`, `isFeatured` (booleans)
- `category`, `tags`, `thumbnail`
- `content` (any) - Serialized project + questions
- `timesUsed` (number)

**Indexes:** by_ownerId, by_organizationId, by_isPublic, by_isFeatured, by_type

---

### billingTransactions
Payment and credit transaction history.

**Key Fields:**
- `userId`, `organizationId` (refs)
- `type` (enum: "subscription" | "credit_purchase" | "refund")
- `amount` (number, cents), `currency` (string)
- `provider` (string) - Payment provider
- `providerTransactionId` (optional string)
- `status` (enum: "pending" | "succeeded" | "failed" | "refunded")
- `description` (string)
- `creditsAdded` (optional number)
- `metadata` (any)
- `createdAt` (timestamp)

**Indexes:** by_userId, by_organizationId, by_status, by_providerTransactionId, by_createdAt

---

## Schema Features

- **Type Safety**: Full TypeScript type generation via Convex
- **Indexes**: Strategic indexes for query performance
- **References**: Proper foreign key relationships with ID types
- **Flexibility**: JSON fields for extensible metadata
- **Security**: Row-level security enforced in Convex functions
- **Timestamps**: Comprehensive audit trail with created/updated times
- **Enums**: Type-safe enum fields for controlled vocabularies

## Migration Strategy

The schema uses Convex's automatic migration system:
1. Schema changes are detected on deployment
2. Indexes are automatically created/updated
3. No manual migrations required
4. Zero-downtime deployments

## Data Retention

- Active records: Indefinite retention
- Deleted projects: Soft delete with archived status
- Analytics events: 90-day rolling window (configurable)
- AI generation history: Full retention for billing compliance