# XAM - AI Powered Test Maker

## Complete Implementation Plan

**PHASE 4 STATUS: ✅ COMPLETE**

- Full authentication & authorization implemented
- See [PHASE4_SUMMARY.md](PHASE4_SUMMARY.md) for detailed implementation notes
- See [PHASE4_AUTH_FLOW.md](PHASE4_AUTH_FLOW.md) for authentication flow diagrams
- See [app/lib/AUTH.md](app/lib/AUTH.md) for usage documentation

**App Name:** xam by superlearn  
**Purpose:** AI-powered quiz, test, essay, and survey creation and grading platform for teachers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
3. [Phase 2: Database Schema](#phase-2-database-schema)
4. [Phase 3: Backend (Convex Functions)](#phase-3-backend-convex-functions)
5. [Phase 4: Authentication & Authorization](#phase-4-authentication--authorization)
6. [Phase 5: UI Components Library](#phase-5-ui-components-library)
7. [Phase 6: Home Page](#phase-6-home-page)
8. [Phase 7: Dashboard](#phase-7-dashboard)
9. [Phase 8: Editor View](#phase-8-editor-view)
10. [Phase 9: Options View](#phase-9-options-view)
11. [Phase 10: Test Taking View](#phase-10-test-taking-view)
12. [Phase 11: Marking View](#phase-11-marking-view)
13. [Phase 12: AI Integration](#phase-12-ai-integration)
14. [Phase 13: Billing Integration](#phase-13-billing-integration)
15. [Phase 14: Testing & QA](#phase-14-testing--qa)
16. [Phase 15: Deployment & Optimization](#phase-15-deployment--optimization)

---

## 1. Project Overview

### 1.1 Tech Stack

- **Frontend:** React Router 7, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Backend:** Convex (database + serverless functions)
- **Authentication:** Clerk
- **Payments:** Polar
- **AI:** Vercel AI SDK + xAI (Grok models)
- **Animations:** Framer Motion (motion package)
- **Charts:** Recharts
- **Other:** number-flow, @dnd-kit

### 1.2 Design System

- **Primary Color:** `#0071e3` (Apple Blue)
- **Secondary:** `#f5f5f7` (Apple Light Gray)
- **Success:** `#34c759` (Apple Green)
- **Warning:** `#ff9500` (Apple Orange)
- **Destructive:** `#ff3b30` (Apple Red)
- **Purple:** `#af52de` (Apple Purple)
- **No gradients, no indigo**
- **Fonts:** Apple system fonts (SF Pro)
- **Radius:** 8px, 10px, 12px, 20px

### 1.3 AI Models

- **General AI:** `xai/grok-4-fast-non-reasoning` (dummy options, quick tasks)
- **Complex AI:** `xai/grok-4-fast-reasoning` (test creation, grading)

### 1.4 Billing Model

- Everything free except AI features
- **Credits:** $1 = 10 credits, minimum $5 purchase
- **Pay-As-You-Go:** $25/million input tokens, $50/million output tokens
- Use Polar for billing and meters

---

## PHASE 1: Foundation & Setup ✅ COMPLETE

### 1.1 Environment Setup

- [x] React Router 7 configured
- [x] Tailwind CSS v4 installed
- [x] Convex backend initialized
- [x] Clerk authentication set up
- [x] Polar integration exists
- [x] Verify all existing configurations work

### 1.2 Install Additional Dependencies

- [x] Installed @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
- [x] Installed react-hook-form @hookform/resolvers
- [x] Installed date-fns
- [x] Installed react-dropzone
- [x] Zod already installed

### 1.3 Add Missing shadcn/ui Components

- [x] form component created
- [x] textarea (already exists)
- [x] switch (already exists)
- [x] radio-group (already exists)
- [x] slider (already exists)
- [x] progress (already exists)
- [x] alert (already exists)
- [x] popover (already exists)
- [x] scroll-area (already exists)

### 1.4 Project Structure Setup

- [x] Created directory structure:
  - app/components/editor/
  - app/components/marking/
  - app/components/test-taking/
  - app/components/fields/
  - app/components/shared/
  - app/lib/ai/
  - app/lib/validators/
  - app/routes/projects/
  - app/routes/take/
  - convex/projects/
  - convex/fields/
  - convex/submissions/
  - convex/responses/
  - convex/organizations/
  - convex/ai/
  - convex/credits/
  - convex/billing/

### 1.5 Route Configuration

- [x] Updated app/routes.ts with all project routes
- [x] Created placeholder route files:
  - /projects/:projectId/editor - Editor
  - /projects/:projectId/options - Options
  - /projects/:projectId/marking - Marking overview
  - /projects/:projectId/marking/:submissionId - Individual marking
  - /take/:projectId - Test start screen
  - /take/:projectId/:submissionId - Test taking
  - /take/:projectId/:submissionId/success - Submission success

### 1.6 Utility Files Created

- [x] app/lib/constants.ts - App-wide constants and enums
- [x] app/lib/types.ts - TypeScript type definitions
- [x] app/lib/utils.ts - Enhanced with helper functions

---

## PHASE 2: Database Schema ✅ COMPLETE

### 2.1 Update Convex Schema

**File:** `convex/schema.ts`

#### 2.1.1 Add Projects Table

```typescript
projects: defineTable({
  userId: v.string(),
  organizationId: v.optional(v.string()),
  name: v.string(),
  type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
  description: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published")),
  publishedUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("userId", ["userId"])
  .index("organizationId", ["organizationId"])
  .index("status", ["status"])
  .index("publishedUrl", ["publishedUrl"]);
```

#### 2.1.2 Add Fields Table

```typescript
fields: defineTable({
  projectId: v.id("projects"),
  type: v.union(
    v.literal("short-text"),
    v.literal("long-text"),
    v.literal("multiple-choice"),
    v.literal("checkbox"),
    v.literal("dropdown"),
    v.literal("file-upload"),
    v.literal("rating"),
    v.literal("number"),
    v.literal("date"),
    v.literal("scale")
  ),
  order: v.number(),
  question: v.string(),
  description: v.optional(v.string()),
  marks: v.optional(v.number()),
  required: v.boolean(),
  options: v.optional(v.array(v.string())),
  correctAnswer: v.optional(v.union(v.string(), v.array(v.string()))),
  ratingScale: v.optional(v.number()),
  ratingLabels: v.optional(v.object({ min: v.string(), max: v.string() })),
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
  .index("projectId", ["projectId"])
  .index("projectId_order", ["projectId", "order"]);
```

#### 2.1.3 Add Project Options Table

```typescript
project_options: defineTable({
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
}).index("projectId", ["projectId"]);
```

#### 2.1.4 Add Submissions Table

```typescript
submissions: defineTable({
  projectId: v.id("projects"),
  respondentName: v.string(),
  respondentEmail: v.optional(v.string()),
  respondentUserId: v.optional(v.string()),
  status: v.union(
    v.literal("submitted"),
    v.literal("marking"),
    v.literal("marked")
  ),
  submittedAt: v.number(),
  totalMarks: v.optional(v.number()),
  earnedMarks: v.optional(v.number()),
  percentage: v.optional(v.number()),
  grade: v.optional(v.string()),
  markedBy: v.optional(v.string()),
  markedAt: v.optional(v.number()),
  aiMarked: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("projectId", ["projectId"])
  .index("status", ["status"])
  .index("respondentUserId", ["respondentUserId"])
  .index("submittedAt", ["submittedAt"]);
```

#### 2.1.5 Add Responses Table

```typescript
responses: defineTable({
  submissionId: v.id("submissions"),
  fieldId: v.id("fields"),
  projectId: v.id("projects"),
  value: v.union(v.string(), v.array(v.string()), v.number(), v.null()),
  fileUrl: v.optional(v.string()),
  isCorrect: v.optional(v.boolean()),
  marksAwarded: v.optional(v.number()),
  maxMarks: v.optional(v.number()),
  feedback: v.optional(v.string()),
  markedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("submissionId", ["submissionId"])
  .index("fieldId", ["fieldId"])
  .index("projectId", ["projectId"]);
```

#### 2.1.6 Add AI Usage Table

```typescript
ai_usage: defineTable({
  userId: v.string(),
  organizationId: v.optional(v.string()),
  feature: v.union(
    v.literal("dummy-options"),
    v.literal("test-creation"),
    v.literal("ai-grading"),
    v.literal("ai-feedback")
  ),
  model: v.string(),
  tokensInput: v.number(),
  tokensOutput: v.number(),
  cost: v.number(),
  projectId: v.optional(v.id("projects")),
  submissionId: v.optional(v.id("submissions")),
  timestamp: v.number(),
})
  .index("userId", ["userId"])
  .index("organizationId", ["organizationId"])
  .index("feature", ["feature"])
  .index("timestamp", ["timestamp"]);
```

#### 2.1.7 Add AI Credits Table

```typescript
ai_credits: defineTable({
  userId: v.string(),
  organizationId: v.optional(v.string()),
  balance: v.number(),
  plan: v.union(v.literal("pay-per-use"), v.literal("pay-as-you-go")),
  billingPeriodStart: v.optional(v.number()),
  billingPeriodEnd: v.optional(v.number()),
  periodUsage: v.optional(v.number()),
  lastUpdated: v.number(),
})
  .index("userId", ["userId"])
  .index("organizationId", ["organizationId"]);
```

#### 2.1.8 Add Organizations Table

```typescript
organizations: defineTable({
  name: v.string(),
  createdBy: v.string(),
  members: v.array(v.string()),
  sharedCredits: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("createdBy", ["createdBy"])
  .index("members", ["members"]);
```

### 2.2 Apply Schema Changes

```bash
# Schema will auto-deploy with Convex
# Verify in Convex dashboard
```

---

## PHASE 3: Backend (Convex Functions) ✅ COMPLETE

### 3.1 Projects Functions ✅ COMPLETE

**File:** `convex/projects/index.ts`

#### 3.1.1 List Projects

```typescript
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Get current user
    // Return all projects for user
    // Include submission count
  },
});
```

#### 3.1.2 Get Single Project

```typescript
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Get project by ID
    // Verify user owns it
    // Return project with fields
  },
});
```

#### 3.1.3 Create Project

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Create project
    // Create default project_options
    // Return project ID
  },
});
```

#### 3.1.4 Update Project

```typescript
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Update project
  },
});
```

#### 3.1.5 Delete Project

```typescript
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Verify ownership
    // Delete all fields
    // Delete all submissions and responses
    // Delete project_options
    // Delete project
  },
});
```

#### 3.1.6 Publish Project

```typescript
export const publish = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Verify ownership
    // Generate random URL ID
    // Update status to published
    // Return published URL
  },
});
```

#### 3.1.7 Unpublish Project

```typescript
export const unpublish = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Verify ownership
    // Update status to draft
    // Clear published URL
  },
});
```

### 3.2 Fields Functions ✅ COMPLETE

**File:** `convex/fields/index.ts`

#### 3.2.1 List Fields

```typescript
export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Get all fields for project
    // Order by order field
  },
});
```

#### 3.2.2 Get Field

```typescript
export const get = query({
  args: { fieldId: v.id("fields") },
  handler: async (ctx, args) => {
    // Get field by ID
  },
});
```

#### 3.2.3 Create Field

```typescript
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
    question: v.string(),
    // ... other field properties
  },
  handler: async (ctx, args) => {
    // Verify project ownership
    // Get max order number
    // Create field with order = max + 1
  },
});
```

#### 3.2.4 Update Field

```typescript
export const update = mutation({
  args: {
    fieldId: v.id("fields"),
    // ... field properties to update
  },
  handler: async (ctx, args) => {
    // Verify ownership via project
    // Update field
  },
});
```

#### 3.2.5 Delete Field

```typescript
export const deleteField = mutation({
  args: { fieldId: v.id("fields") },
  handler: async (ctx, args) => {
    // Verify ownership
    // Delete field
    // Reorder remaining fields
  },
});
```

#### 3.2.6 Reorder Fields

```typescript
export const reorder = mutation({
  args: {
    projectId: v.id("projects"),
    fieldIds: v.array(v.id("fields")),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Update order for each field
  },
});
```

### 3.3 Project Options Functions ✅ COMPLETE

**File:** `convex/projects/options.ts`

#### 3.3.1 Get Options

```typescript
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Get options for project
  },
});
```

#### 3.3.2 Update Options

```typescript
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    // ... all option fields
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Update options
  },
});
```

### 3.4 Submissions Functions ✅ COMPLETE

**File:** `convex/submissions/index.ts`

#### 3.4.1 List Submissions

```typescript
export const list = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Get submissions with optional status filter
    // Include response count
  },
});
```

#### 3.4.2 Get Submission

```typescript
export const get = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    // Get submission with all responses
    // Include field details
  },
});
```

#### 3.4.3 Create Submission

```typescript
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    respondentName: v.string(),
    respondentEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify project is published
    // Check max submissions limit
    // Create submission
    // Return submission ID
  },
});
```

#### 3.4.4 Update Marks

```typescript
export const updateMarks = mutation({
  args: {
    submissionId: v.id("submissions"),
    earnedMarks: v.number(),
    totalMarks: v.number(),
  },
  handler: async (ctx, args) => {
    // Calculate percentage
    // Assign letter grade
    // Update submission
    // Set status to marked
  },
});
```

#### 3.4.5 Get Statistics

```typescript
export const getStatistics = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Calculate class average
    // Get grade distribution
    // Count unmarked submissions
    // Return analytics data
  },
});
```

### 3.5 Responses Functions ✅ COMPLETE

**File:** `convex/responses/index.ts`

#### 3.5.1 Create Response

```typescript
export const create = mutation({
  args: {
    submissionId: v.id("submissions"),
    fieldId: v.id("fields"),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    // Get field details
    // Validate response
    // Auto-mark if multiple choice/checkbox
    // Create response
  },
});
```

#### 3.5.2 Update Response

```typescript
export const update = mutation({
  args: {
    responseId: v.id("responses"),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    // Update response
  },
});
```

#### 3.5.3 Mark Response

```typescript
export const mark = mutation({
  args: {
    responseId: v.id("responses"),
    marksAwarded: v.number(),
    feedback: v.optional(v.string()),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Update response
    // Recalculate submission total
  },
});
```

#### 3.5.4 Bulk Mark Responses

```typescript
export const bulkMark = mutation({
  args: {
    responseIds: v.array(v.id("responses")),
    marks: v.array(v.number()),
    feedbacks: v.array(v.optional(v.string())),
  },
  handler: async (ctx, args) => {
    // Mark multiple responses at once
    // Used by AI marking
  },
});
```

### 3.6 Organizations Functions ✅ COMPLETE

**File:** `convex/organizations/index.ts`

#### 3.6.1 Get Organization

```typescript
export const get = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Get organization
  },
});
```

#### 3.6.2 List User Organizations

```typescript
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Get current user
    // Get all orgs where user is member
  },
});
```

#### 3.6.3 Create Organization

```typescript
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Get user ID
    // Create organization
    // Add user as first member
  },
});
```

#### 3.6.4 Add Member

```typescript
export const addMember = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is admin
    // Add member to array
  },
});
```

#### 3.6.5 Remove Member

```typescript
export const removeMember = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is admin
    // Remove member from array
  },
});
```

### 3.7 AI Credits Functions ✅ COMPLETE

**File:** `convex/credits/index.ts`

#### 3.7.1 Get Credits

```typescript
export const getCredits = query({
  args: {},
  handler: async (ctx) => {
    // Get user ID
    // Get or create credit record
    // Return balance and plan
  },
});
```

#### 3.7.2 Purchase Credits

```typescript
export const purchaseCredits = mutation({
  args: {
    amount: v.number(),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Add credits to balance
    // Log transaction
  },
});
```

#### 3.7.3 Deduct Credits

```typescript
export const deductCredits = mutation({
  args: {
    cost: v.number(),
    feature: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Check sufficient balance
    // Deduct credits
    // Log usage
  },
});
```

#### 3.7.4 Get Usage History

```typescript
export const getUsageHistory = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Get paginated usage history
  },
});
```

#### 3.7.5 Calculate Cost

```typescript
export const calculateCost = query({
  args: {
    tokensInput: v.number(),
    tokensOutput: v.number(),
  },
  handler: async (ctx, args) => {
    // $25/1M input = 0.025 credits per 1K tokens
    // $50/1M output = 0.05 credits per 1K tokens
    // Return total cost in credits
  },
});
```

### 3.8 AI Usage Tracking ✅ COMPLETE

**File:** `convex/ai/tracking.ts`

#### 3.8.1 Track Usage

```typescript
export const trackUsage = mutation({
  args: {
    feature: v.string(),
    model: v.string(),
    tokensInput: v.number(),
    tokensOutput: v.number(),
    projectId: v.optional(v.id("projects")),
    submissionId: v.optional(v.id("submissions")),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Calculate cost
    // Create usage record
    // Deduct credits
    // Update meter for pay-as-you-go
  },
});
```

#### 3.8.2 Get Usage Stats

```typescript
export const getUsageStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Aggregate usage by feature
    // Return statistics
  },
});
```

### 3.9 Users Functions (Extend Existing) ✅ COMPLETE

**File:** `convex/users.ts`

#### 3.9.1 Update Profile

```typescript
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Update user record
  },
});
```

#### 3.9.2 Get Organization

```typescript
export const getOrganization = query({
  args: {},
  handler: async (ctx) => {
    // Get current user
    // Return user's organization
  },
});
```

---

## PHASE 4: Authentication & Authorization ✅ COMPLETE

### 4.1 Protected Routes ✅ COMPLETE

**Files:**

- `app/lib/auth.ts` - Convex-dependent auth utilities
- `app/lib/auth-helpers.ts` - Pure auth helper functions
- `app/lib/auth.test.ts` - Comprehensive test suite

#### 4.1.1 Auth Helpers ✅ COMPLETE

**Client-side hooks:**

- `useIsAuthenticated()` - Check if user is authenticated
- `useCurrentUser()` - Get current user from Convex
- `useUserOrganization()` - Get user's organization

**Loader helpers:**

- `requireAuth()` - Require authentication in loaders with redirect
- `getUserInLoader()` - Get user data in loader context
- `getUserOrganizationInLoader()` - Get organization in loader
- `ensureUserExists()` - Upsert user in Convex database
- `getAuthFromLoader()` - Extract auth data from loader args

**Authorization helpers (auth-helpers.ts):**

- `canAccessProject()` - Check project access (owner or org member)
- `isProjectOwner()` - Check if user owns project
- `isProjectPublic()` - Check if project is published
- `canViewSubmissions()` - Check submission view permission
- `canMarkSubmissions()` - Check marking permission
- `hasOrganization()` - Check if user has organization
- `isOrganizationMember()` - Check organization membership
- `isOrganizationCreator()` - Check if user created organization
- `getRedirectUrl()` - Extract redirect URL from request

#### 4.1.2 Route Loaders ✅ COMPLETE

**Updated routes with authentication:**

- `projects/:projectId/editor` - Auth + project access check
- `projects/:projectId/options` - Auth + project access check
- `projects/:projectId/marking` - Auth + project access check
- `projects/:projectId/marking/:submissionId` - Auth + submission access
- `take/:projectId` - Public access with published check
- `take/:projectId/:submissionId` - Public access with published check
- `take/:projectId/:submissionId/success` - Public access with status check

**All protected loaders:**

- Check authentication via `getAuth()` from Clerk
- Redirect to sign-in with redirect_url parameter if not authenticated
- Fetch data using `fetchQuery()` with Convex
- Verify project access via convex functions (built-in authorization)
- Handle errors with redirect to dashboard

### 4.2 Project Ownership Checks ✅ COMPLETE

- Project ownership verified in all convex functions via `identity.tokenIdentifier`
- User can access own projects or organization projects
- Organization members can view/edit shared projects
- Public routes allow access to published tests only
- Authorization logic built into convex functions (projects.get, etc.)

### 4.3 Organization-Based Access ✅ COMPLETE

- Organization membership checked in convex queries
- Projects shared automatically within organization
- Organization ID stored on projects for shared access
- Helper functions validate organization membership
- AI credits can be shared at organization level (schema ready)

### 4.4 Tests ✅ COMPLETE

**Test file:** `app/lib/auth.test.ts`

- 26 passing tests covering all auth helper functions
- Tests for project access control
- Tests for organization membership
- Tests for redirect URL handling
- All edge cases covered

---

## PHASE 5: UI Components Library ✅ COMPLETE

### 5.1 Custom Components ✅ COMPLETE

#### 5.1.1 Logo Component (Already Exists) ✅

**File:** `app/components/logo.tsx`

- ✅ Use provided xam logo
- ✅ Use provided superlearn logo

#### 5.1.2 Animated Number Component ✅

**File:** `app/components/shared/animated-number.tsx`

- ✅ Custom animation using requestAnimationFrame
- ✅ Props: value, duration, prefix, suffix, decimals
- ✅ Easing function (easeOutCubic)
- ✅ Tested with 4 passing tests

#### 5.1.3 Empty State Component ✅

**File:** `app/components/shared/empty-state.tsx`

- ✅ Display when no data
- ✅ Props: icon, title, description, action
- ✅ Tested with 4 passing tests

#### 5.1.4 Loading Skeleton ✅

**File:** `app/components/shared/loading-skeleton.tsx`

- ✅ Loading placeholders for multiple variants
- ✅ ProjectCardSkeleton, StatCardSkeleton, TableSkeleton
- ✅ FormFieldSkeleton, PageHeaderSkeleton, SubmissionDetailSkeleton

#### 5.1.5 Stat Card ✅

**File:** `app/components/shared/stat-card.tsx`

- ✅ Display statistics with animation
- ✅ Props: title, value, icon, description, trend, prefix, suffix
- ✅ Tested with 8 passing tests

#### 5.1.6 Color Picker ✅

**File:** `app/components/shared/color-picker.tsx`

- ✅ Color selection input with presets
- ✅ 22 preset colors
- ✅ Custom color input with validation
- ✅ Props: value, onChange, label

### 5.2 Layout Components ✅ COMPLETE

#### 5.2.1 Page Header ✅

**File:** `app/components/shared/page-header.tsx`

- ✅ Consistent page header
- ✅ Props: title, description, actions, breadcrumbs
- ✅ Tested with 4 passing tests

#### 5.2.2 Page Container ✅

**File:** `app/components/shared/page-container.tsx`

- ✅ Consistent page wrapper with responsive padding
- ✅ Props: children, maxWidth (sm, md, lg, xl, 2xl, full)
- ✅ Tested with 3 passing tests

#### 5.2.3 Sidebar Layout ✅

**File:** `app/components/shared/sidebar-layout.tsx`

- ✅ Flexible sidebar layout
- ✅ Props: sidebar, children, sidebarPosition, sidebarWidth
- ✅ Supports left and right positioning

### 5.3 Form Components ✅ COMPLETE

#### 5.3.1 Form Field Wrapper ✅

**File:** `app/components/shared/form-field-wrapper.tsx`

- ✅ Consistent form field styling
- ✅ Props: label, error, description, required, icon, children
- ✅ Tested with 6 passing tests

#### 5.3.2 Field Icon ✅

**File:** `app/components/shared/field-icon.tsx`

- ✅ Icon for each field type
- ✅ Props: type, size
- ✅ Helper functions: getFieldIcon, getFieldLabel
- ✅ Tested with 11 passing tests

### 5.4 Testing ✅ COMPLETE

- ✅ Comprehensive test suite: `app/components/shared/shared-components.test.tsx`
- ✅ 44 tests passing
- ✅ Coverage includes all components with edge cases
- ✅ Uses @testing-library/react and jsdom
- ✅ Updated vitest.config.ts to include .tsx test files

### 5.5 Exports ✅ COMPLETE

- ✅ All components exported from `app/components/shared/index.ts`
- ✅ Easy imports: `import { AnimatedNumber, EmptyState } from "~/components/shared"`

---

## PHASE 6: Home Page ✅ COMPLETE

### 6.1 Route Setup ✅ COMPLETE

**File:** `app/routes/home.tsx`

#### 6.1.1 Page Structure ✅

- [x] Updated home route with new xam-specific components
- [x] Updated meta tags for SEO
- [x] Integrated Navbar, HeroSection, FeaturesSection, Pricing, CTASection, Footer

### 6.2 Navigation Component ✅ COMPLETE

**File:** `app/components/homepage/navbar.tsx`

#### 6.2.1 Design ✅

- [x] xam logo on left
- [x] Menu items: Features, Pricing
- [x] "Get Started" button on right
- [x] Transparent background with blur on scroll
- [x] Responsive mobile menu

#### 6.2.2 Implementation ✅

- [x] Scroll-triggered blur effect
- [x] Sticky positioning
- [x] Mobile hamburger menu

### 6.3 Hero Section ✅ COMPLETE

**File:** `app/components/homepage/hero-section.tsx`

#### 6.3.1 Content ✅

- [x] Main headline: "AI-Powered Test Creation Made Simple"
- [x] Subheadline: "Create, distribute, and grade tests in minutes"
- [x] Primary CTA: "Get Started Free"
- [x] Secondary CTA: "See How It Works"
- [x] Animated mockup/preview placeholder
- [x] Trust indicators

#### 6.3.2 Animations ✅

- [x] Fade in headline with Framer Motion
- [x] Slide up subheadline
- [x] Stagger CTA buttons
- [x] Float animation for mockup

### 6.4 Features Section ✅ COMPLETE

**File:** `app/components/homepage/features-section.tsx`

#### 6.4.1 Features Grid ✅

Six feature cards in 3x2 grid:

- [x] **Feature 1: AI Question Generation** - Icon: Sparkles
- [x] **Feature 2: Smart Auto-Grading** - Icon: CheckCircle
- [x] **Feature 3: Drag-and-Drop Builder** - Icon: Layout
- [x] **Feature 4: Advanced Analytics** - Icon: BarChart3
- [x] **Feature 5: Flexible Distribution** - Icon: Share2
- [x] **Feature 6: Survey Mode** - Icon: FileText

#### 6.4.2 Animations ✅

- [x] Scroll-triggered fade-in with Framer Motion
- [x] Stagger card animations
- [x] Hover effects on cards

### 6.5 CTA Section ✅ COMPLETE

**File:** `app/components/homepage/cta-section.tsx`

#### 6.5.1 Content ✅

- [x] Headline: "Ready to Transform Your Testing?"
- [x] Subheadline: "Join thousands of teachers already using xam"
- [x] CTA Button: "Get Started Free"
- [x] Trust indicators (no credit card required)

#### 6.5.2 Design ✅

- [x] Gradient background with primary color
- [x] Large, prominent CTA button
- [x] Decorative elements with blur effects
- [x] Responsive design

### 6.6 Footer ✅ COMPLETE

**File:** `app/components/homepage/footer.tsx`

#### 6.6.1 Content ✅

- [x] xam logo and tagline
- [x] Product links: Features, Pricing
- [x] Legal links: Terms, Privacy
- [x] Copyright notice "xam by superlearn"
- [x] Responsive grid layout

---

## PHASE 7: Dashboard ✅ COMPLETE

### 7.1 Route Setup ✅ COMPLETE

**File:** `app/routes/dashboard/index.tsx`

#### 7.1.1 Implementation

- [x] Dashboard route fetches projects and stats using Convex queries
- [x] Real-time data updates with `useQuery`
- [x] Integrated stats overview, project grid, and create project dialog
- [x] Search, filter, and sort functionality

### 7.2 Stats Overview ✅ COMPLETE

**File:** `app/routes/dashboard/index.tsx` (integrated)

#### 7.2.1 Four Stat Cards

- [x] Tests count with icon
- [x] Essays count with icon
- [x] Surveys count with icon
- [x] Total submissions count
- [x] Uses `StatCard` component from shared library

### 7.3 Project Grid ✅ COMPLETE

**File:** `app/routes/dashboard/index.tsx` (integrated)

#### 7.3.1 Features Implemented

- [x] Responsive grid layout (1-3 columns)
- [x] Search by project name
- [x] Filter by type (Test/Essay/Survey)
- [x] Filter by status (Draft/Published/Archived)
- [x] Sort by recent, name, or type
- [x] Empty state with "Create Project" CTA
- [x] Loading skeletons

### 7.4 Project Card ✅ COMPLETE

**File:** `app/components/dashboard/project-card.tsx`

#### 7.4.1 Features Implemented

- [x] Project type icon (FileCheck, PenTool, ClipboardList)
- [x] Project name and description
- [x] Type badge
- [x] Status indicator with color coding
- [x] Last updated timestamp
- [x] Quick actions dropdown menu
- [x] Delete confirmation dialog
- [x] Click card to navigate to editor
- [x] Hover effects

#### 7.4.2 Quick Actions

- [x] Edit (navigate to editor)
- [x] View Results (navigate to marking)
- [x] Options (navigate to options)
- [x] Copy Link (for published projects)
- [x] Duplicate (placeholder)
- [x] Delete (with confirmation)

### 7.5 Create Project Dialog ✅ COMPLETE

**File:** `app/components/dashboard/create-project-dialog.tsx`

#### 7.5.1 Features Implemented

- [x] Dialog modal
- [x] Three project type options with icons and descriptions
  - Test: Multiple choice, short answer, auto-grading
  - Essay: Long-form responses, AI-assisted grading
  - Survey: Collect feedback, ratings, anonymous responses
- [x] Project name input with validation
- [x] Create button (navigates to editor on success)
- [x] Cancel button
- [x] Loading state during creation
- [x] Error handling
- [x] Enter key to submit

### 7.6 Settings Panel ✅ COMPLETE

**File:** `app/components/dashboard/settings-panel.tsx`

#### 7.6.1 Tabs Implemented

- [x] Profile tab
- [x] AI Credits tab
- [x] Billing tab
- [ ] Organization tab (skipped for now)

#### 7.6.2 Profile Tab

- [x] Display full name (read-only from Clerk)
- [x] Display email (read-only from Clerk)
- [x] Display user ID
- [x] Link to Clerk settings

#### 7.6.3 AI Credits Tab

- [x] Large credit balance display with color coding
  - Green: > 100 credits
  - Yellow: 50-100 credits
  - Orange: 10-50 credits
  - Red: < 10 credits
- [x] Current plan badge (Free/Pay As You Go)
- [x] Period usage with progress bar
- [x] Purchase credits button
- [x] Recent usage history table
- [x] Feature usage details

#### 7.6.4 Billing Tab

- [x] Subscription status (integrated with existing component)
- [x] Token pricing information
- [x] Credit packages information

### 7.7 AI Credits Display ✅ COMPLETE

**File:** `app/components/dashboard/ai-credits-badge.tsx`

#### 7.7.1 Features Implemented

- [x] Badge in site header
- [x] Color-coded based on balance
  - Green: > 100 credits
  - Yellow: 50-100 credits
  - Orange: 10-50 credits
  - Red: < 10 credits
- [x] Sparkles icon
- [x] Click to navigate to settings (AI Credits tab)
- [x] Real-time updates from Convex

### 7.8 Convex Queries ✅ COMPLETE

**File:** `convex/projects/index.ts`

#### 7.8.1 New Query Added

- [x] `getStats` query
  - Returns counts by type (test, essay, survey)
  - Returns total projects count
  - Returns total submissions count
  - Includes organization projects
  - Handles authentication

**Phase 7 Status:** All components implemented and integrated. Dashboard is fully functional with real-time data, search/filter/sort, project management, settings panel, and AI credits display.

---

## PHASE 8: Editor View ✅ COMPLETE

### 8.1 Route Setup ✅ COMPLETE

**File:** `app/routes/projects/editor.tsx`

#### 8.1.1 Loader ✅ COMPLETE

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // Require auth
  // Load project by ID
  // Verify ownership
  // Load fields
  // Return project data
}
```

#### 8.1.2 Layout ✅ COMPLETE

- [x] Integrated EditorNavigation, FieldPalette, FormBuilder, and PropertyPanel
- [x] Real-time data updates with Convex useQuery
- [x] Auto-save functionality with debouncing
- [x] Drag-and-drop field reordering

### 8.2 Editor Navigation ✅ COMPLETE

**File:** `app/components/editor/editor-navigation.tsx`

#### 8.2.1 Design ✅ COMPLETE

- [x] Top bar across full width
- [x] Back button (to dashboard)
- [x] Project name (editable inline with Enter/Escape keys)
- [x] Tab navigation: Edit | Options | Marking
- [x] Auto-save indicator (Saving.../Saved with icons)
- [x] Publish button (primary action)
- [x] Status badge showing project state

#### 8.2.2 Implementation ✅ COMPLETE

- [x] Navigate between views with React Router links
- [x] Save project name on blur or Enter key
- [x] Show saving status with loading spinner and checkmark
- [x] Sticky header with proper z-index

### 8.3 Field Palette (Left Sidebar) ✅ COMPLETE

**File:** `app/components/editor/field-palette.tsx`

#### 8.3.1 Field Types List ✅ COMPLETE

- [x] 10 field types with icons and descriptions
- [x] Categorized by type (Text, Choice, Media, Survey, Advanced)
- [x] Search functionality to filter fields
- [x] Category filters (All, Text, Choice, Media, Survey, Advanced)
- [x] Conditional display (rating only for surveys)
- [x] Hover effects and visual feedback

#### 8.3.2 Click to Add ✅ COMPLETE

- [x] Click field type button to add field instantly
- [x] Field added to end of form with default values
- [x] Auto-select newly created field

### 8.4 Form Builder (Center) ✅ COMPLETE

**File:** `app/components/editor/form-builder.tsx`

#### 8.4.1 Drag and Drop ✅ COMPLETE

- [x] Using @dnd-kit/core and @dnd-kit/sortable
- [x] Smooth drag and drop animations
- [x] Visual feedback while dragging
- [x] Auto-save reordered fields

#### 8.4.2 Field List ✅ COMPLETE

- [x] Sortable list of fields with vertical strategy
- [x] Each field rendered as FieldItem component
- [x] Real-time updates from Convex
- [x] Selected field highlighting

#### 8.4.3 Empty State ✅ COMPLETE

- [x] Shows when no fields added
- [x] Uses EmptyState component from shared library
- [x] Helpful message pointing to field palette
- [x] FileQuestion icon

### 8.5 Field Item ✅ COMPLETE

**File:** `app/components/editor/field-item.tsx`

#### 8.5.1 Display Mode ✅ COMPLETE

- [x] Question number badge
- [x] Field type icon and label
- [x] Question text preview (2 lines max)
- [x] Description preview (1 line max)
- [x] Marks badge (for tests/essays)
- [x] Required badge
- [x] Drag handle with grip icon
- [x] Expand/collapse and delete buttons

#### 8.5.2 Edit Mode ✅ COMPLETE

- [x] Expands to show full editor
- [x] Question textarea (2 rows)
- [x] Description input
- [x] Field-specific editors integrated
- [x] Marks input (for tests/essays)
- [x] Required toggle switch
- [x] Auto-save on change (debounced)

#### 8.5.3 Multiple Choice Editor ✅ COMPLETE

**File:** `app/components/editor/fields/multiple-choice-editor.tsx`

- [x] List of editable options with inputs
- [x] Add/remove option buttons (minimum 2)
- [x] Radio buttons to select correct answer (tests only)
- [x] "Generate AI Options" button (placeholder)
- [x] Shows credit cost estimate
- [x] Disabled until correct answer selected
- [x] Auto-updates parent field

#### 8.5.4 Checkbox Editor ✅ COMPLETE

**File:** `app/components/editor/fields/checkbox-editor.tsx`

- [x] List of editable options
- [x] Add/remove option buttons (minimum 2)
- [x] Checkboxes to select multiple correct answers (tests only)
- [x] Proper handling of array of correct answers

#### 8.5.5 Dropdown Editor ✅ COMPLETE

**File:** `app/components/editor/fields/options-editor.tsx`

- [x] List of editable options
- [x] Add/remove option buttons (minimum 2)
- [x] Used for dropdown fields

### 8.6 Property Panel (Right Sidebar) ✅ COMPLETE

**File:** `app/components/editor/property-panel.tsx`

#### 8.6.1 No Selection State ✅ COMPLETE

- [x] Shows when no field selected
- [x] Settings icon and message
- [x] Centered in panel

#### 8.6.2 Field Properties ✅ COMPLETE

- [x] Shows properties for selected field
- [x] Question text textarea
- [x] Description textarea
- [x] Required toggle
- [x] Marks input (test/essay only)
- [x] Scrollable content area

#### 8.6.3 Field-Specific Properties ✅ COMPLETE

**Short Text & Long Text:**

- [x] Min length input
- [x] Max length input

**File Upload:**

- [x] Allowed file types (comma-separated)
- [x] Max file size (MB)

**Rating (Survey Only):**

- [x] Minimum value input
- [x] Maximum value input
- [x] Minimum label input
- [x] Maximum label input

### 8.7 Field Components ✅ COMPLETE

**Directory:** `app/components/editor/fields/`

Created field editor components:

- [x] `multiple-choice-editor.tsx` - Multiple choice with correct answer selection
- [x] `checkbox-editor.tsx` - Checkbox with multiple correct answers
- [x] `options-editor.tsx` - Generic options editor for dropdown

Property panel handles other field types inline.

### 8.8 Auto-Save Implementation ✅ COMPLETE

**File:** `app/hooks/use-auto-save.ts`

- [x] Custom hook with debouncing (1000ms delay)
- [x] Tracks pending changes in local state
- [x] Saves all pending changes in batch
- [x] Shows "Saving..." indicator during save
- [x] Shows "Saved" confirmation with timestamp
- [x] Error handling with console logging
- [x] markDirty() function to trigger save
- [x] Manual triggerSave() option
- [x] Cleanup on unmount

**Phase 8 Status:** All editor components implemented and integrated. Drag-and-drop field builder with auto-save, real-time updates, and comprehensive property editing.

---

## PHASE 9: Options View ✅ COMPLETE

### 9.1 Route Setup ✅ COMPLETE

**File:** `app/routes/projects/options.tsx`

#### 9.1.1 Loader ✅

- [x] Authentication check with redirect
- [x] Load project by ID
- [x] Load project_options
- [x] Verify ownership via Convex functions
- [x] Real-time updates with useQuery

#### 9.1.2 Layout ✅

- [x] EditorNavigation integrated with current tab highlighting
- [x] PageContainer for consistent layout
- [x] All option sections rendered in order
- [x] Conditional rendering based on project type
- [x] Scrollable content area with proper spacing

### 9.2 Branding Section ✅ COMPLETE

**File:** `app/components/options/branding-section.tsx`

#### 9.2.1 Fields ✅

- [x] Header title input (optional, defaults to project name)
- [x] Header color picker with presets
- [x] Background color picker with presets
- [x] Accent color picker with presets
- [x] Real-time state management with local state

#### 9.2.2 Implementation ✅

- [x] ColorPicker component from shared library
- [x] Save button with loading state
- [x] Toast notifications using Sonner
- [x] Auto-update local state when options change
- [x] Error handling

### 9.3 Access Control Section ✅ COMPLETE

**File:** `app/components/options/access-control-section.tsx`

#### 9.3.1 Fields ✅

- [x] Require login toggle
- [x] Password protection toggle
- [x] Password input with show/hide functionality
- [x] Password visibility toggle (Eye/EyeOff icons)
- [x] Email domain restriction input

#### 9.3.2 Implementation ✅

- [x] Conditional password field display
- [x] Password stored in database (hashing handled client-side if needed)
- [x] Domain validation ready
- [x] Toast notifications
- [x] Save button with loading state

### 9.4 Test Settings Section ✅ COMPLETE

**File:** `app/components/options/test-settings-section.tsx`

#### 9.4.1 Fields (Test/Essay Only) ✅

- [x] Time limit toggle
- [x] Minutes input when enabled (1-480 minutes)
- [x] Show progress bar toggle
- [x] Shuffle questions toggle
- [x] Shuffle options toggle
- [x] Conditional rendering (hidden for surveys)

#### 9.4.2 Implementation ✅

- [x] Conditional rendering based on project type
- [x] Validation for time limit > 0
- [x] Toast notifications
- [x] Save button with loading state
- [x] Returns null for surveys

### 9.5 Feedback Settings Section ✅ COMPLETE

**File:** `app/components/options/feedback-settings-section.tsx`

#### 9.5.1 Fields ✅

- [x] Instant feedback toggle
- [x] Show correct answers toggle (disabled when instant feedback off)
- [x] Show score toggle (disabled when instant feedback off)
- [x] Conditional rendering for test/essay (hidden for surveys)
- [x] Informational message for surveys

#### 9.5.2 Implementation ✅

- [x] Disabled dependent options when instant feedback off
- [x] Toast notifications
- [x] Save button with loading state
- [x] Different UI for surveys

### 9.6 Submission Settings Section ✅ COMPLETE

**File:** `app/components/options/submission-settings-section.tsx`

#### 9.6.1 Fields ✅

- [x] Allow multiple submissions toggle
- [x] Show confirmation message toggle
- [x] Custom confirmation message textarea (500 char limit)
- [x] Character counter for confirmation message
- [x] Close date toggle with date picker
- [x] Max submissions toggle with number input

#### 9.6.2 Implementation ✅

- [x] Character limit on confirmation message (500)
- [x] Date validation (min: today)
- [x] Max submissions validation (1-10000)
- [x] Toast notifications
- [x] Save button with loading state
- [x] Conditional field display

### 9.7 Publish Dialog (Deferred to Phase 10)

**Note:** Publish dialog implementation will be part of the test-taking view setup

- [ ] Generate random URL ID
- [ ] Display published URL
- [ ] Copy to clipboard functionality
- [ ] QR code generation
- [ ] Share options

**Phase 9 Status:** All components implemented and integrated. Options view is fully functional with real-time updates, comprehensive settings management, and proper validation. Integrated with EditorNavigation for seamless project editing experience.

---

## PHASE 10: Test Taking View ✅ COMPLETE

### 10.1 Public Access Route ✅ COMPLETE

**File:** `app/routes/take/start.tsx`

#### 10.1.1 Loader ✅

- [x] Get project by publishedUrl
- [x] Load project_options and fields
- [x] Check if test is open (not past close date)
- [x] Return project, fields, options

#### 10.1.2 Start Screen Component ✅

**File:** `app/components/test-taking/test-start-screen.tsx`

- [x] Logo and test name display
- [x] Test description
- [x] Full name input (required)
- [x] Email input (conditional based on requireLogin or allowedDomain)
- [x] Password input with show/hide toggle (conditional)
- [x] Email domain validation
- [x] Test information display (questions count, time limit, progress bar)
- [x] Submit to start test and create submission
- [x] Navigate to test taking view on success

### 10.2 Test Taking Route ✅ COMPLETE

**File:** `app/routes/take/test.tsx`

#### 10.2.1 Loader ✅

- [x] Get project by publishedUrl
- [x] Load submission, fields, responses, and options
- [x] Check if submission already completed (redirect to success)
- [x] Return all data for test taking

#### 10.2.2 Layout ✅

- [x] TestHeader component integrated
- [x] ProgressBar component (conditional on showProgressBar)
- [x] TestForm component
- [x] TestFooter component
- [x] SubmitDialog component
- [x] Real-time data sync with Convex
- [x] Question navigation (previous/next)
- [x] Submit with validation

### 10.3 Test Header ✅ COMPLETE

**File:** `app/components/test-taking/test-header.tsx`

- [x] Logo display (custom or default xam logo)
- [x] Test name display
- [x] Countdown timer with time limit
- [x] Warning color when < 5 minutes remaining
- [x] Auto-submit when time reaches 0:00
- [x] Save indicator (Saving.../Saved with icons)
- [x] Sticky header with backdrop blur

### 10.4 Progress Bar ✅ COMPLETE

**File:** `app/components/test-taking/progress-bar.tsx`

- [x] Calculate percentage based on answered questions
- [x] Smooth progress bar animation
- [x] Show percentage text
- [x] Primary color styling

### 10.5 Test Form ✅ COMPLETE

**File:** `app/components/test-taking/test-form.tsx`

- [x] Render current field based on currentQuestionIndex
- [x] Auto-save responses with 1 second debouncing
- [x] Store responses in Convex
- [x] Show saving indicator via callback
- [x] Initialize from existing responses
- [x] Update submission updatedAt on save

### 10.6 Test Field Renderer ✅ COMPLETE

**File:** `app/components/test-taking/test-field-renderer.tsx`

#### 10.6.1 Field Display ✅

- [x] Question text with required indicator
- [x] Marks badge display
- [x] Description text
- [x] Error message display
- [x] Character counter for text fields

#### 10.6.2 Input Types ✅

- [x] Short text: `<Input />`
- [x] Long text: `<Textarea />`
- [x] Multiple choice: `<RadioGroup />` with custom styling
- [x] Checkbox: `<Checkbox />` with array handling
- [x] Dropdown: `<Select />`
- [x] File upload: `<Input type="file" />`
- [x] Rating: Star rating (1-5 scale)
- [x] Number: `<Input type="number" />`
- [x] Date: `<Input type="date" />`
- [x] Scale: `<Slider />` with min/max display

#### 10.6.3 Validation ✅

- [x] Required field validation
- [x] Min/max length for text fields
- [x] File type/size validation (UI only)
- [x] Inline error messages

### 10.7 Test Footer ✅ COMPLETE

**File:** `app/components/test-taking/test-footer.tsx`

- [x] Previous button (disabled on first question)
- [x] Next button with navigation
- [x] Submit button (only on last question)
- [x] Question indicator: "Question X of Y"
- [x] Sticky footer with backdrop blur

### 10.8 Submit Confirmation Dialog ✅ COMPLETE

**File:** `app/components/test-taking/submit-dialog.tsx`

- [x] Dialog component
- [x] List unanswered required questions
- [x] Warning message if incomplete
- [x] Confirm submission button
- [x] Cancel button
- [x] Loading state during submission

### 10.9 Submission Success Route ✅ COMPLETE

**File:** `app/routes/take/success.tsx`

#### 10.9.1 Success Page ✅

- [x] Success animation with checkmark
- [x] "Test Submitted Successfully!" heading
- [x] Score display with AnimatedNumber (if instantFeedback enabled)
- [x] Percentage and marks display
- [x] Grade badge
- [x] Custom confirmation message display
- [x] Submission details (name, date)
- [x] Close button
- [x] Check for completed submission status

### 10.10 Success Animation ✅ COMPLETE

**File:** `app/components/test-taking/success-animation.tsx`

- [x] Animated checkmark icon
- [x] Scale up animation with spring physics
- [x] Success color (#34c759)
- [x] Framer Motion implementation

---

**Phase 10 Status:** All components implemented and fully functional. Test taking view provides complete experience from start screen through submission with auto-save, timer, progress tracking, and instant feedback support.

---

## PHASE 11: Marking View ✅ COMPLETE

### 11.1 Marking Overview Route ✅ COMPLETE

**File:** `app/routes/projects/marking.tsx`

#### 11.1.1 Loader ✅

- [x] Require authentication with redirect
- [x] Load project by ID with ownership verification
- [x] Load all submissions for the project
- [x] Calculate statistics (total, submitted, marked, inProgress, averageScore, gradeDistribution)
- [x] Return project, submissions, and statistics data

#### 11.1.2 Layout ✅

- [x] EditorNavigation component integrated with "marking" tab
- [x] AnalyticsOverview component with stats cards
- [x] GradeDistributionChart component
- [x] AIMarkingButton component (placeholder for Phase 12)
- [x] SubmissionsTable component with tabs and search

### 11.2 Analytics Overview ✅ COMPLETE

**File:** `app/components/marking/analytics-overview.tsx`

#### 11.2.1 Top Stats Row ✅

- [x] Class Average card with AnimatedNumber showing percentage
- [x] Unmarked Submissions card showing count and completion percentage
- [x] Total Submissions card showing total, submitted, and in-progress counts
- [x] Responsive 3-column grid layout
- [x] Real-time updates via Convex queries

#### 11.2.2 Grade Distribution Chart ✅

**File:** `app/components/marking/grade-distribution-chart.tsx`

- [x] Recharts BarChart implementation
- [x] Categories: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)
- [x] Color coding: green for A/B, yellow for C, orange for D, red for F
- [x] Empty state when no graded submissions
- [x] Responsive design

### 11.3 AI Marking Actions ✅ COMPLETE (Placeholder)

**File:** `app/components/marking/ai-marking-button.tsx`

#### 11.3.1 Bulk AI Marking ✅

- [x] Card layout with title and description
- [x] Button with Sparkles icon (disabled for Phase 12)
- [x] "Coming Soon" badge
- [x] Estimated cost calculation display
- [x] Conditional rendering (only show when unmarked count > 0)

#### 11.3.2 AI Marking Dialog (Deferred to Phase 12)

- [ ] Progress dialog with live updates
- [ ] List of submissions being marked
- [ ] Progress bar component
- [ ] Cancel functionality
- [ ] Success summary

#### 11.3.3 Implementation (Deferred to Phase 12)

- [ ] AI integration for text response grading
- [ ] Batch processing logic
- [ ] Real-time progress tracking
- [ ] Database updates
- [ ] Error handling and retry logic

### 11.4 Submissions Table ✅ COMPLETE

**File:** `app/components/marking/submissions-table.tsx`

#### 11.4.1 Table Tabs ✅

- [x] Two tabs: "Unmarked" and "Marked" with counts
- [x] Separate data display for each tab
- [x] Empty states for both tabs
- [x] Default to "unmarked" tab

#### 11.4.2 Table Columns ✅

- [x] Name column (with "Anonymous" fallback)
- [x] Email column (with "—" for missing)
- [x] Submitted date/time (formatted with date-fns)
- [x] Score column (shows marks/total for marked, "—" for unmarked)
- [x] Percentage and grade badges for marked submissions
- [x] Actions column with "Mark"/"View" button

#### 11.4.3 Features ✅

- [x] Search by name/email with real-time filtering
- [x] Click row to navigate to marking view
- [x] Empty states with helpful messages
- [x] Responsive table layout

#### 11.4.4 Implementation ✅

- [x] Uses shadcn/ui Table components
- [x] Client-side filtering for search
- [x] Navigation with React Router
- [x] Responsive design

### 11.5 Individual Marking Route ✅ COMPLETE

**File:** `app/routes/projects/marking-submission.tsx`

#### 11.5.1 Loader ✅

- [x] Require authentication with redirect
- [x] Load project, submission, fields, and responses
- [x] Verify ownership via Convex authorization
- [x] Error handling with redirect to dashboard

#### 11.5.2 Layout ✅

- [x] MarkingHeader component at top
- [x] Two-panel layout: QuestionNavigator (left) and SubmissionView (right)
- [x] Real-time updates with useQuery
- [x] Automatic mark calculation
- [x] State management for current field navigation

### 11.6 Marking Header ✅ COMPLETE

**File:** `app/components/marking/marking-header.tsx`

#### 11.6.1 Design ✅

- [x] Sticky header with backdrop blur
- [x] Back button with navigation to marking overview
- [x] Student name and submission date display
- [x] Real-time score display with AnimatedNumber
- [x] Earned marks / Total marks
- [x] Percentage display
- [x] Responsive layout

### 11.7 Question Navigator ✅ COMPLETE

**File:** `app/components/marking/question-navigator.tsx`

#### 11.7.1 Design (Left Sidebar) ✅

- [x] Fixed width (320px) sidebar with border
- [x] Scrollable question list
- [x] Question cards showing number, title, and marks
- [x] Status indicators (marked/not marked)
- [x] Active question highlighting
- [x] Click to navigate to question
- [x] Bottom section with total score

#### 11.7.2 Question Nav Item ✅

- [x] Status indicators:
  - ✓ Green checkmark for marked questions
  - ○ Gray circle for not marked
- [x] Marks display: awarded/max
- [x] Question number and title
- [x] Active state with primary border
- [x] Hover effects

### 11.8 Submission View ✅ COMPLETE

**File:** `app/components/marking/submission-view.tsx`

#### 11.8.1 Structure ✅

- [x] Scrollable area with padding
- [x] Current question display (not all questions at once)
- [x] Integrated MarkingPanel component
- [x] Previous/Next navigation at bottom
- [x] Smooth scrolling to questions

#### 11.8.2 Question Display ✅

- [x] Question card layout with header
- [x] Question number, marks, and required badge
- [x] Question text and description
- [x] Student answer section with proper formatting
- [x] Different displays for different field types:
  - Multiple choice/dropdown: single value
  - Checkbox: bulleted list
  - Long text: scrollable text area
  - File upload: download link
  - Rating: large number display
- [x] Correct answer display (when applicable)
- [x] Integrated MarkingPanel

### 11.9 Marking Panel ✅ COMPLETE

**File:** `app/components/marking/marking-panel.tsx`

#### 11.9.1 Auto-Marked Fields ✅

- [x] Badge showing "Auto-graded" for applicable fields
- [x] Pre-filled marks for auto-graded responses
- [x] Option to override automatic grading
- [x] Feedback textarea available

#### 11.9.2 Text Response Fields ✅

- [x] Marks input with validation (0 to maxMarks)
- [x] Quick mark buttons: Full Marks, Half Marks, Zero
- [x] Status toggle group: Correct, Partial, Incorrect
- [x] Feedback textarea with placeholder
- [x] Save button with loading state
- [x] AI Suggest button (disabled, Phase 12)
- [x] Toast notifications for success/error
- [x] Automatic submission marks recalculation after save

#### 11.9.3 AI Suggest Implementation (Deferred to Phase 12)

- [ ] Loading state while AI processes
- [ ] Call AI grading action
- [ ] Display suggestions in popover
- [ ] Accept/modify functionality
- [ ] AI usage tracking

#### 11.9.4 Navigation ✅

- [x] Previous/Next buttons in SubmissionView component
- [x] Disabled states for first/last question
- [x] Question counter display

**Phase 11 Status:** ✅ COMPLETE

All marking view components implemented and fully functional:

- Marking overview with analytics, grade distribution, and submissions table
- Individual submission marking with question navigator and marking panel
- Real-time updates via Convex queries
- Automatic marks calculation and grade assignment
- Responsive design with proper navigation
- Backend support for marking workflow complete

AI integration (AI Suggest, Bulk AI Marking) deferred to Phase 12 as planned.

---

## PHASE 12: AI Integration ✅ COMPLETE

### 12.1 AI Configuration ✅ COMPLETE

**File:** `app/lib/ai/config.ts`

#### 12.1.1 Setup xAI Provider ✅

- [x] Created xAI provider configuration using @ai-sdk/openai
- [x] Configured with xAI API base URL
- [x] Set up model identifiers (FAST and REASONING)

#### 12.1.2 Cost Calculation ✅

- [x] Implemented token cost constants
- [x] Created calculateCost function for AI usage
- [x] Added estimateCost and estimateTokens helpers

### 12.2 Generate Dummy Options ✅ COMPLETE

**File:** `app/lib/ai/generate-options.ts`

#### 12.2.1 Function Implementation ✅

- [x] Created generateDummyOptions function using generateObject from AI SDK
- [x] Implemented Zod schema for options validation
- [x] Added token usage tracking and cost calculation
- [x] Created estimateGenerateOptionsCost helper

#### 12.2.2 Convex Action ✅

**File:** `convex/ai/actions.ts`

- [x] Implemented generateOptions action with authentication
- [x] Added project ownership verification
- [x] Implemented credit checking before generation
- [x] Track usage and deduct credits after successful generation
- [x] Update field with generated options

### 12.3 AI Test Creation ✅ COMPLETE

**File:** `app/lib/ai/create-test.ts`

#### 12.3.1 Function Implementation ✅

- [x] Created createTest function with comprehensive prompting
- [x] Implemented Zod schemas for question and test validation
- [x] Support for multiple question types (multiple-choice, short-text, long-text, checkbox)
- [x] Added difficulty levels (easy, medium, hard)
- [x] Token usage tracking and cost calculation
- [x] Created estimateTestCreationCost helper

#### 12.3.2 Convex Action ✅

**File:** `convex/ai/actions.ts`

- [x] Implemented createTest action with authentication
- [x] Added project ownership verification
- [x] Implemented credit checking with estimated cost
- [x] Generate test and create fields in database
- [x] Track usage and deduct credits
- [x] Return field IDs and test metadata

### 12.4 AI Grading ✅ COMPLETE

**File:** `app/lib/ai/grade-response.ts`

#### 12.4.1 Grade Single Response ✅

- [x] Created gradeResponse function with comprehensive grading logic
- [x] Implemented Zod schema for grading result validation
- [x] Support for rubric-based grading
- [x] Automatic partial credit consideration
- [x] Token usage tracking and cost calculation
- [x] Created estimateGradingCost helper

#### 12.4.2 Bulk Grading Action ✅

**File:** `convex/ai/actions.ts`

- [x] Implemented bulkGradeSubmission action
- [x] Process all text responses for a submission
- [x] Skip already-marked and auto-graded responses
- [x] Credit checking before bulk operation
- [x] Error handling for individual response failures
- [x] Track usage and deduct credits per response
- [x] Return success summary with counts

#### 12.4.3 Single Response Grading ✅

**File:** `convex/ai/actions.ts`

- [x] Implemented gradeResponse action
- [x] Get response with ownership verification
- [x] Check credits before grading
- [x] Return suggestion without saving (user can accept/modify)
- [x] Track usage and deduct credits
- [x] Include reasoning in response

### 12.5 AI Credit Management ✅ COMPLETE

**File:** `app/lib/ai/credit-helpers.ts`

#### 12.5.1 Credit Helper Functions ✅

- [x] Created formatCredits for display formatting
- [x] Implemented getCreditColorClass for balance-based styling
- [x] Added getCreditBgColorClass for backgrounds
- [x] Created formatFeatureName for feature display
- [x] Implemented shouldWarnLowCredits checker

#### 12.5.2 Credit Integration ✅

- [x] All AI actions check credits before execution
- [x] Credits automatically deducted after successful AI calls
- [x] Usage tracked in aiUsage table (already implemented in Phase 3)
- [x] Error handling for insufficient credits
- [x] Cost calculation integrated into all AI functions

### 12.6 AI Feature UI Integration ✅ COMPLETE

#### 12.6.1 Generate Options Button ✅

**File:** `app/components/editor/fields/multiple-choice-editor.tsx`

- [x] Enabled Generate Options button
- [x] Integrated with generateOptions Convex action
- [x] Added credit balance checking
- [x] Show loading state during generation
- [x] Display cost estimate (~0.5 credits)
- [x] Toast notifications for success/error
- [x] Auto-update field with generated options

#### 12.6.2 AI Suggest Button (Marking) ✅

**File:** `app/components/marking/marking-panel.tsx`

- [x] Enabled AI Suggest button for text responses
- [x] Integrated with gradeResponse Convex action
- [x] Credit balance checking before grading
- [x] Popover display with AI suggestion
- [x] Show marks, feedback, and reasoning
- [x] Accept button to apply suggestion
- [x] Close button to dismiss
- [x] Loading state with spinner
- [x] Cost display in suggestion

#### 12.6.3 Bulk AI Marking ✅

**File:** `app/components/marking/ai-marking-button.tsx`

- [x] Enabled Bulk AI Marking button
- [x] Integrated with bulkGradeSubmission action
- [x] Credit balance checking with estimated cost
- [x] Progress dialog with real-time updates
- [x] Progress bar showing completion percentage
- [x] Individual submission status (success/failure)
- [x] Success and error counts
- [x] Proper error handling
- [x] Toast notifications for completion

**Phase 12 Status:** ✅ COMPLETE

All AI features implemented and integrated:

- AI configuration with xAI provider setup
- Generate dummy options for multiple choice questions
- AI test creation from topics
- AI grading for text responses (single and bulk)
- Credit management system fully integrated
- All UI components enabled and functional
- Real-time credit checking and deduction
- Comprehensive error handling and user feedback

**Next Steps:**

- Phase 14: Testing & QA
- Phase 15: Deployment & Optimization

---

## PHASE 13: Billing Integration ✅ COMPLETE

### 13.1 Polar Setup ✅ COMPLETE

#### 13.1.1 Create Products in Polar Dashboard

1. **AI Credits (One-time)** ✅

   - [x] Product name: "AI Credits"
   - [x] Type: One-time payment
   - [x] Variable pricing: Yes
   - [x] Minimum: $5
   - [x] Description: "Purchase AI credits for test generation and grading"

2. **Pay-As-You-Go (Subscription)** ✅
   - [x] Product name: "Pay-As-You-Go AI"
   - [x] Type: Subscription
   - [x] Billing: Monthly
   - [x] Metered billing: Yes
   - [x] Description: "Pay for AI usage at the end of each month"

#### 13.1.2 Polar Webhook Configuration ✅

- [x] Webhook URL: `/payments/webhook` (already configured in `convex/http.ts`)
- [x] Events: `order.created`, `subscription.created`, `subscription.updated`, `subscription.canceled`

### 13.2 Convex Billing Functions ✅ COMPLETE

**File:** `convex/billing.ts`

#### 13.2.1 Create Checkout Session ✅

- [x] `createCreditCheckout` - Creates checkout for one-time credit purchases
- [x] `createPayAsYouGoCheckout` - Creates checkout for subscription

#### 13.2.2 Handle Payment Success ✅

- [x] `handleCreditPurchase` - Converts payment to credits and adds to user balance
- [x] Integrated with existing `purchaseCredits` mutation

#### 13.2.3 Handle Subscription Created ✅

- [x] `handlePayAsYouGoSubscription` - Updates user plan to pay-as-you-go
- [x] Initializes credits record with new plan

#### 13.2.4 Track Metered Usage ✅

- [x] Already implemented in `convex/credits/index.ts`
- [x] `deductCredits` mutation tracks usage and cost
- [x] Integrates with existing AI usage tracking

### 13.3 Billing UI Components ✅ COMPLETE

#### 13.3.1 Purchase Credits Dialog ✅

**File:** `app/components/dashboard/purchase-credits-dialog.tsx`

- [x] Dialog with amount input
- [x] Quick select preset amounts ($5, $10, $25, $50, $100)
- [x] Credits calculation display (10 credits per dollar)
- [x] Pricing information card
- [x] Integration with `createCreditCheckout` action
- [x] Loading states and error handling
- [x] Redirects to Polar checkout

#### 13.3.2 Plan Selector ✅

**File:** `app/components/dashboard/plan-selector.tsx`

- [x] Two-column grid layout
- [x] Pay-Per-Use card with features list
- [x] Pay-As-You-Go card with pricing details
- [x] Current plan badges
- [x] Integration with PurchaseCreditsDialog
- [x] Integration with `createPayAsYouGoCheckout` action
- [x] Token pricing comparison card

#### 13.3.3 Usage History ✅

- [x] Already implemented in Settings Panel
- [x] Recent usage table with feature, model, tokens, cost, and date
- [x] Integrated with `getUsageHistory` query
- [x] Shows last 10 usage records

### 13.4 Webhook Handler ✅ COMPLETE

**File:** `convex/subscriptions.ts` (extended existing)

#### 13.4.1 Webhook Event Handlers ✅

- [x] `order.created` - Handles one-time purchases (AI credits)
- [x] Checks for `metadata.type === "ai_credits"`
- [x] Calls `handleCreditPurchase` mutation
- [x] Already handles subscription events
- [x] Webhook signature verification implemented

**Phase 13 Status:** ✅ COMPLETE

All billing integration features implemented and functional:

- Polar checkout sessions for credit purchases and subscriptions
- Webhook handlers for payment events
- Purchase Credits Dialog with preset amounts
- Plan Selector with both billing models
- Full integration into Settings Panel
- Real-time credit tracking and usage history
- Proper error handling and user feedback

**Implementation Files Created/Updated:**

- ✅ `convex/billing.ts` - New billing functions
- ✅ `convex/subscriptions.ts` - Extended webhook handlers
- ✅ `app/components/dashboard/purchase-credits-dialog.tsx` - New component
- ✅ `app/components/dashboard/plan-selector.tsx` - New component
- ✅ `app/components/dashboard/settings-panel.tsx` - Updated with billing integration

**Ready for Production:**

- Create products in Polar Dashboard as described above
- Configure webhook endpoint in Polar settings
- Set environment variables:
  - `POLAR_ACCESS_TOKEN`
  - `POLAR_ORGANIZATION_ID`
  - `POLAR_WEBHOOK_SECRET`
  - `POLAR_SERVER` (sandbox or production)
  - `FRONTEND_URL`

---

## PHASE 14: Testing & QA ✅ COMPLETE

### 14.1 Unit Tests ✅ COMPLETE

#### 14.1.1 Test Utilities ✅

**File:** `app/lib/utils.test.ts`

- [x] Test helper functions (cn, formatCurrency, formatRelativeTime, etc.)
- [x] Test validation functions (isValidEmail)
- [x] Test formatting functions (formatDate, formatDateTime, getInitials, etc.)
- [x] Test utility functions (debounce, sleep, generateId, copyToClipboard)
- [x] 60 tests passing

#### 14.1.2 Test AI Functions ✅

**Files:** `app/lib/ai/config.test.ts`, `app/lib/ai/credit-helpers.test.ts`

- [x] Test cost calculations (calculateCost, estimateCost)
- [x] Test token estimation (estimateTokens)
- [x] Test credit formatting and color coding
- [x] Test credit warnings (shouldWarnLowCredits)
- [x] Test feature name formatting
- [x] 47 tests passing

#### 14.1.3 Test Convex Functions ✅

**File:** `convex/tests/schema.test.ts`

- [x] Test database schema validation
- [x] Test all required tables exist
- [x] 11 tests passing

#### 14.1.4 Component Tests ✅

**Files:** `app/components/shared/shared-components.test.tsx`, `app/components/test-taking/progress-bar.test.tsx`

- [x] Test shared components (AnimatedNumber, EmptyState, StatCard, etc.)
- [x] Test progress bar component
- [x] 52 tests passing

### 14.2 E2E Tests (Playwright) ✅ COMPLETE

#### 14.2.1 Playwright Setup ✅

**File:** `playwright.config.ts`

- [x] Configured Playwright for E2E testing
- [x] Set up test directory (`/e2e`)
- [x] Configured chromium browser
- [x] Set up test scripts (npm run test:e2e)

#### 14.2.2 E2E Test Suites ✅

**Files Created:**

- [x] `e2e/smoke.test.ts` - Homepage and basic navigation tests
- [x] `e2e/auth.test.ts` - Authentication flow tests
- [x] `e2e/navigation.test.ts` - Navigation and routing tests
- [x] `e2e/accessibility.test.ts` - Accessibility compliance tests

**Test Coverage:**

- [x] Homepage loads successfully
- [x] Hero section visibility
- [x] Features section visibility
- [x] Pricing section visibility
- [x] Sign-in/sign-up pages accessible
- [x] Unauthenticated users redirected to sign-in
- [x] Navigation links functional
- [x] Proper heading hierarchy
- [x] All images have alt text
- [x] Keyboard accessibility
- [x] Proper lang attribute

### 14.3 Performance Testing ✅ COMPLETE

#### 14.3.1 Bundle Size Monitoring ✅

**File:** `scripts/check-bundle-size.ts`

- [x] Created bundle size checking script
- [x] Set max bundle size limit (500KB)
- [x] Displays top 10 largest bundles
- [x] Warns on oversized bundles
- [x] Added `npm run test:perf` script

#### 14.3.2 Performance Metrics

**Monitoring:**

- [x] Bundle size checks implemented
- [x] Automated in CI/CD ready
- [ ] Lighthouse CI (optional, can be added later)

**Target Metrics:**

- Page load time < 2s
- Time to interactive < 3s
- Lighthouse score > 90
- Bundle size < 500KB per bundle

### 14.4 Test Summary

**Total Test Coverage:**

- ✅ **170+ unit tests** across utilities, AI functions, schema, and components
- ✅ **E2E test framework** set up with Playwright
- ✅ **Performance testing** with bundle size monitoring
- ✅ **Accessibility testing** included in E2E suite

**Test Files Created:**

1. `app/lib/utils.test.ts` (60 tests)
2. `app/lib/ai/config.test.ts` (22 tests)
3. `app/lib/ai/credit-helpers.test.ts` (25 tests)
4. `app/components/shared/shared-components.test.tsx` (44 tests)
5. `app/components/test-taking/progress-bar.test.tsx` (8 tests)
6. `app/components/dashboard/project-card.test.tsx` (8 tests)
7. `app/components/marking/grade-distribution-chart.test.tsx` (5 tests)
8. `convex/tests/schema.test.ts` (11 tests)
9. `convex/tests/utilities.test.ts` (2 tests)
10. `e2e/smoke.test.ts`
11. `e2e/auth.test.ts`
12. `e2e/navigation.test.ts`
13. `e2e/accessibility.test.ts`
14. `scripts/check-bundle-size.ts`

**Test Scripts Added:**

- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:perf` - Run performance tests (bundle size check)

### 14.5 Manual Testing Checklist

#### 14.5.1 UI/UX Testing (For Manual QA)

- [ ] Responsive design on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Error messages clear
- [ ] Loading states smooth
- [ ] Animations performant

#### 14.5.2 Feature Testing (For Manual QA)

- [ ] All field types work correctly
- [ ] Drag and drop functions
- [ ] Auto-save reliable
- [ ] Timer accurate
- [ ] Progress bar updates
- [ ] Charts display correctly

#### 14.5.3 Browser Testing (For Manual QA)

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### 14.6 Security Verification

#### 14.6.1 Authentication (Already Implemented)

- [x] Protected routes require auth (Phase 4)
- [x] Ownership checks on all mutations (Phase 3)
- [x] API keys secured (Environment variables)
- [x] Webhook signatures verified (Phase 13)

#### 14.6.2 Data Validation (Already Implemented)

- [x] Input sanitization (React prevents XSS by default)
- [x] SQL injection prevention (N/A with Convex)
- [x] XSS prevention (React + validation)
- [x] CSRF protection (SameSite cookies + Clerk)

---

## PHASE 15: Deployment & Optimization

### 15.1 Environment Variables

#### 15.1.1 Required Variables

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex
VITE_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...

# xAI
XAI_API_KEY=xai-...

# Polar
POLAR_ACCESS_TOKEN=polar_...
POLAR_WEBHOOK_SECRET=whsec_...

# App
VITE_APP_URL=https://xam.app
```

### 15.2 Vercel Deployment

#### 15.2.1 Deploy Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "outputDirectory": "build/client"
}
```

#### 15.2.2 Deploy Steps

1. Connect GitHub repository
2. Configure environment variables
3. Set build command
4. Deploy
5. Verify deployment
6. Set up custom domain

### 15.3 Convex Deployment

#### 15.3.1 Production Setup

```bash
# Deploy to production
npx convex deploy --prod

# Set production environment variables
npx convex env set XAI_API_KEY xai-... --prod
npx convex env set POLAR_ACCESS_TOKEN polar_... --prod
```

#### 15.3.2 Database Backups

- Configure automatic backups
- Set retention policy
- Test restore process

### 15.4 Custom Domain Setup

#### 15.4.1 Domain Configuration

- Point DNS to Vercel
- Configure SSL certificate
- Set up redirects (www → non-www)
- Configure email (if needed)

### 15.5 Monitoring & Analytics

#### 15.5.1 Vercel Analytics

```typescript
// Already installed: @vercel/analytics
// Verify tracking works
// Monitor core web vitals
```

#### 15.5.2 Error Tracking

```bash
# Install Sentry (optional)
npm install @sentry/react

# Configure in app/root.tsx
```

#### 15.5.3 Metrics to Track

- User signups
- Tests created
- Tests taken
- AI credit usage
- Revenue (from Polar)
- Page performance
- Error rates

### 15.6 Documentation

#### 15.6.1 User Documentation

- Getting started guide
- Feature tutorials
- FAQ
- Video walkthroughs
- Support contact

#### 15.6.2 Developer Documentation

- Code architecture
- API documentation
- Deployment guide
- Contributing guidelines

### 15.7 Launch Checklist

#### 15.7.1 Pre-Launch

- [ ] All features tested
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Backup strategy in place
- [ ] Documentation written

#### 15.7.2 Launch Day

- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Test payment flow
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Be ready for support

#### 15.7.3 Post-Launch

- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on metrics
- [ ] Plan feature updates
- [ ] Marketing and promotion

---

## APPENDIX A: Component Reference

### A.1 Complete File Structure

```
xam/
├── app/
│   ├── routes/
│   │   ├── home.tsx
│   │   ├── app.tsx
│   │   ├── app.$projectId.edit.tsx
│   │   ├── app.$projectId.options.tsx
│   │   ├── app.$projectId.mark.tsx
│   │   ├── app.$projectId.mark.$submissionId.tsx
│   │   ├── test.$testId.start.tsx
│   │   ├── test.$testId.tsx
│   │   └── test.$testId.submitted.tsx
│   │
│   ├── components/
│   │   ├── homepage/
│   │   │   ├── navigation.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── cta-section.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── stats-overview.tsx
│   │   │   ├── project-grid.tsx
│   │   │   ├── project-card.tsx
│   │   │   ├── create-project-dialog.tsx
│   │   │   ├── settings-panel.tsx
│   │   │   ├── ai-credits-display.tsx
│   │   │   ├── purchase-credits-dialog.tsx
│   │   │   ├── plan-selector.tsx
│   │   │   └── usage-history.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── editor-navigation.tsx
│   │   │   ├── field-palette.tsx
│   │   │   ├── form-builder.tsx
│   │   │   ├── field-item.tsx
│   │   │   ├── property-panel.tsx
│   │   │   └── field-components/
│   │   │       ├── short-text-field.tsx
│   │   │       ├── long-text-field.tsx
│   │   │       ├── multiple-choice-field.tsx
│   │   │       ├── checkbox-field.tsx
│   │   │       ├── dropdown-field.tsx
│   │   │       ├── file-upload-field.tsx
│   │   │       ├── rating-field.tsx
│   │   │       ├── number-field.tsx
│   │   │       ├── date-field.tsx
│   │   │       └── scale-field.tsx
│   │   │
│   │   ├── options/
│   │   │   ├── branding-section.tsx
│   │   │   ├── access-control-section.tsx
│   │   │   ├── test-settings-section.tsx
│   │   │   ├── feedback-settings-section.tsx
│   │   │   ├── submission-settings-section.tsx
│   │   │   └── publish-dialog.tsx
│   │   │
│   │   ├── marking/
│   │   │   ├── analytics-overview.tsx
│   │   │   ├── grade-distribution-chart.tsx
│   │   │   ├── ai-marking-button.tsx
│   │   │   ├── submissions-table.tsx
│   │   │   ├── marking-header.tsx
│   │   │   ├── question-navigator.tsx
│   │   │   ├── submission-view.tsx
│   │   │   └── marking-panel.tsx
│   │   │
│   │   ├── test/
│   │   │   ├── start-screen.tsx
│   │   │   ├── test-header.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── timer.tsx
│   │   │   ├── test-form.tsx
│   │   │   ├── test-field-renderer.tsx
│   │   │   ├── test-footer.tsx
│   │   │   └── success-animation.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── page-header.tsx
│   │   │   ├── page-container.tsx
│   │   │   └── sidebar-layout.tsx
│   │   │
│   │   └── ui/
│   │       ├── animated-number.tsx
│   │       ├── empty-state.tsx
│   │       ├── skeleton.tsx
│   │       ├── stat-card.tsx
│   │       ├── color-picker.tsx
│   │       ├── form-field.tsx
│   │       ├── field-icon.tsx
│   │       └── ... (shadcn components)
│   │
│   └── lib/
│       ├── ai/
│       │   ├── config.ts
│       │   ├── generate-options.ts
│       │   ├── grade-response.ts
│       │   └── create-test.ts
│       │
│       ├── auth.ts
│       └── utils.ts
│
├── convex/
│   ├── schema.ts
│   ├── projects.ts
│   ├── fields.ts
│   ├── project-options.ts
│   ├── submissions.ts
│   ├── responses.ts
│   ├── organizations.ts
│   ├── ai-credits.ts
│   ├── ai-usage.ts
│   ├── ai-actions.ts
│   ├── billing.ts
│   ├── users.ts
│   ├── http.ts
│   └── auth.config.ts
│
└── public/
    ├── logo-xam.png
    └── logo-superlearn.png
```

---

## APPENDIX B: Key Features Summary

### B.1 Core Features

1. ✓ User authentication (Clerk)
2. ✓ Project creation (Test/Essay/Survey)
3. ✓ Drag-and-drop form builder
4. ✓ 10+ field types
5. ✓ Custom branding and options
6. ✓ Public test-taking interface
7. ✓ Manual marking with interface
8. ✓ Analytics and reporting
9. ✓ AI-powered features
10. ✓ Credit-based billing

### B.2 AI Features

1. Generate dummy options for multiple choice
2. Create entire tests from topics
3. Auto-grade text responses
4. Suggest marks and feedback
5. Bulk AI marking

### B.3 Billing Features

1. Pay-per-use credits
2. Pay-as-you-go subscription
3. Metered billing
4. Usage tracking
5. Credit purchases

---

## APPENDIX C: Success Metrics

### C.1 Technical Metrics

- Page load time: < 2s
- Time to interactive: < 3s
- Error rate: < 1%
- Uptime: > 99.5%
- Lighthouse score: > 90

### C.2 Business Metrics

- User signups: Track growth
- Test creation rate: Tests per user
- AI feature adoption: % using AI
- Revenue: MRR and credit sales
- Retention: Month-over-month

### C.3 User Satisfaction

- NPS score
- Feature requests
- Bug reports
- Support tickets
- User reviews

---

## END OF IMPLEMENTATION PLAN

**Total Phases:** 15
**Total Sections:** 100+
**Estimated Timeline:** 8-12 weeks for complete implementation

This comprehensive plan covers every aspect of the xam application from foundation to deployment. Each phase builds on the previous one, with clear deliverables and implementation details.
