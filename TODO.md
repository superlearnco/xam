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

## PHASE 9: Options View

### 9.1 Route Setup

**File:** `app/routes/app.$projectId.options.tsx`

#### 9.1.1 Loader

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // Require auth
  // Load project
  // Load project_options
  // Verify ownership
  return json({ project, options });
}
```

#### 9.1.2 Layout

```typescript
export default function Options() {
  return (
    <div>
      <EditorNavigation currentTab="options" />
      <div className="max-w-4xl mx-auto p-8">
        <BrandingSection />
        <AccessControlSection />
        {project.type !== "survey" && <TestSettingsSection />}
        <FeedbackSettingsSection />
        <SubmissionSettingsSection />
      </div>
    </div>
  );
}
```

### 9.2 Branding Section

**File:** `app/components/options/branding-section.tsx`

#### 9.2.1 Fields

```typescript
// Test title (shown in header)
// Description (shown before test starts)
// Header color (color picker)
// Background color (color picker)
// Logo upload (file input)
```

#### 9.2.2 Implementation

```typescript
// Color pickers with presets
// File upload with preview
// Save on change
```

### 9.3 Access Control Section

**File:** `app/components/options/access-control-section.tsx`

#### 9.3.1 Fields

```typescript
// Require login toggle
// Password protection toggle
// Show password input when enabled
// Password visibility toggle
// Email domain restriction
// Input field (e.g., "school.edu")
```

#### 9.3.2 Implementation

```typescript
// Validate password strength
// Hash password before saving
// Test domain format
```

### 9.4 Test Settings Section

**File:** `app/components/options/test-settings-section.tsx`

#### 9.4.1 Fields (Test/Essay Only)

```typescript
// Time limit toggle
// Minutes input when enabled
// Show progress bar toggle
// Shuffle questions toggle
// Shuffle options toggle
// Prevent tab switching (optional)
// Full screen mode (optional)
```

#### 9.4.2 Implementation

```typescript
// Conditional rendering based on project type
// Validate time limit > 0
```

### 9.5 Feedback Settings Section

**File:** `app/components/options/feedback-settings-section.tsx`

#### 9.5.1 Fields

```typescript
// Instant feedback toggle
// Show correct answers toggle
// Show score toggle
// Release feedback date (optional)
// Date picker when not instant
```

#### 9.5.2 Implementation

```typescript
// Disable dependent options when instant feedback off
// Validate release date in future
```

### 9.6 Submission Settings Section

**File:** `app/components/options/submission-settings-section.tsx`

#### 9.6.1 Fields

```typescript
// Allow multiple submissions toggle
// Show confirmation message toggle
// Custom confirmation message (textarea)
// Close date (date picker)
// Max submissions (number input)
// Email notification on submission toggle
```

#### 9.6.2 Implementation

```typescript
// Character limit on confirmation message
// Validate close date in future
// Validate max submissions > 0
```

### 9.7 Publish Dialog

**File:** `app/components/options/publish-dialog.tsx`

#### 9.7.1 Trigger

```typescript
// "Publish" button in navigation
// Check if project has fields
// Warn if no fields added
```

#### 9.7.2 Dialog Content

```typescript
// Generate random URL ID (8-12 characters)
// Display full URL: xam.app/test/{randomId}
// Copy button
// QR code (use qrcode.react)
// Share buttons:
// Email (mailto link)
// Copy link
// Download QR code
// Unpublish button (if already published)
```

#### 9.7.3 Implementation

```typescript
// Call publish mutation
// Update project status
// Show success toast
// Copy to clipboard function
```

---

## PHASE 10: Test Taking View

### 10.1 Public Access Route

**File:** `app/routes/test.$testId.start.tsx`

#### 10.1.1 Loader

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // Get project by publishedUrl
  // Load project_options
  // Check if test is open (not past close date)
  // Check if max submissions reached
  // Return project, fields, options
}
```

#### 10.1.2 Start Screen (Test/Essay Only)

```typescript
export default function TestStart() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <SuperlearnLogo />
        <h1>{project.name}</h1>
        <p>{options.description}</p>

        <Form>
          <Input label="Full Name" required />
          <Input label="Email" type="email" required={options.requireLogin} />
          {options.password && (
            <Input label="Password" type="password" required />
          )}
          <Button type="submit">Start Test</Button>
        </Form>

        <TestInfo>
          {options.timeLimit && <p>Time Limit: {options.timeLimit} minutes</p>}
          <p>Questions: {fields.length}</p>
        </TestInfo>
      </Card>
    </div>
  );
}
```

#### 10.1.3 Survey Direct Start

```typescript
// Surveys don't show start screen
// Go directly to form
// Optional name/email at the end
```

### 10.2 Test Taking Route

**File:** `app/routes/test.$testId.tsx`

#### 10.2.1 Loader

```typescript
export async function loader({ params, request }: LoaderFunctionArgs) {
  // Get project by publishedUrl
  // Verify user entered name (from session/cookie)
  // Create or load submission
  // Load fields
  // Load options
  // Shuffle if enabled
  return json({ project, submission, fields, options });
}
```

#### 10.2.2 Layout

```typescript
export default function TestTaking() {
  return (
    <div className="min-h-screen flex flex-col">
      <TestHeader />
      {options.showProgressBar && <ProgressBar />}
      <div className="flex-1 container mx-auto py-8">
        <TestForm />
      </div>
      <TestFooter />
    </div>
  );
}
```

### 10.3 Test Header

**File:** `app/components/test/test-header.tsx`

#### 10.3.1 Design

```typescript
// Logo (custom or superlearn)
// Test name
// Timer (if time limit set)
// Save indicator (auto-saving)
```

#### 10.3.2 Timer Implementation

```typescript
// Countdown timer
// Warn at 5 minutes remaining
// Auto-submit at 0:00
// Persist time in localStorage
```

### 10.4 Progress Bar

**File:** `app/components/test/progress-bar.tsx`

#### 10.4.1 Implementation

```typescript
// Calculate percentage based on answered questions
// Smooth animation
// Show percentage text
// Color: primary blue
```

### 10.5 Test Form

**File:** `app/components/test/test-form.tsx`

#### 10.5.1 Structure

```typescript
// Render all fields in order
// Each field is a TestFieldRenderer
// Auto-save responses on change
// Required field validation
// Navigation: Previous/Next buttons
// Submit button at end
```

#### 10.5.2 Auto-Save

```typescript
// Debounce input changes
// Save to Convex after 1 second
// Store in responses table
// Show "Saving..." indicator
// Handle offline gracefully
```

### 10.6 Test Field Renderer

**File:** `app/components/test/test-field-renderer.tsx`

#### 10.6.1 Field Display

```typescript
// Question number
// Question text
// Description (if any)
// Marks display (if test/essay)
// Required indicator
// Render appropriate input based on field type
```

#### 10.6.2 Input Types

- Short text: `<Input />`
- Long text: `<Textarea />`
- Multiple choice: `<RadioGroup />`
- Checkbox: `<CheckboxGroup />`
- Dropdown: `<Select />`
- File upload: `<FileInput />`
- Rating: `<RatingInput />`
- Number: `<Input type="number" />`
- Date: `<DatePicker />`
- Scale: `<Slider />`

#### 10.6.3 Validation

```typescript
// Required field check
// Min/max length for text
// File type/size for uploads
// Min/max value for numbers
// Show error messages inline
```

### 10.7 Test Footer

**File:** `app/components/test/test-footer.tsx`

#### 10.7.1 Design

```typescript
// Previous button (disabled on first question)
// Next button (validate before proceeding)
// Submit button (only on last question)
// Question indicator: "Question X of Y"
```

#### 10.7.2 Submit Confirmation

```typescript
// Show dialog before submitting
// List unanswered required questions
// Confirm submission button
// Cancel button
```

### 10.8 Submission Success Route

**File:** `app/routes/test.$testId.submitted.tsx`

#### 10.8.1 Success Animation

```typescript
export default function TestSubmitted() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <SuccessAnimation />
        <h1>Test Submitted Successfully!</h1>

        {options.instantFeedback && (
          <div>
            <h2>Your Score</h2>
            <AnimatedNumber value={score} suffix="%" />
            <p>
              {earnedMarks} / {totalMarks} points
            </p>

            {options.showCorrectAnswers && (
              <Button>View Correct Answers</Button>
            )}
          </div>
        )}

        {options.confirmationMessage && <p>{options.confirmationMessage}</p>}

        <Button variant="outline">Close Window</Button>
      </div>
    </div>
  );
}
```

### 10.9 Success Animation Component

**File:** `app/components/test/success-animation.tsx`

#### 10.9.1 Animated Checkmark

```typescript
// SVG checkmark
// Draw path animation (0 to 1)
// Scale up animation
// Success color (#34c759)
// Use Framer Motion
// Duration: 1 second
```

---

## PHASE 11: Marking View

### 11.1 Marking Overview Route

**File:** `app/routes/app.$projectId.mark.tsx`

#### 11.1.1 Loader

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // Require auth
  // Load project
  // Verify ownership
  // Load submissions with stats
  // Calculate analytics
  return json({ project, submissions, stats });
}
```

#### 11.1.2 Layout

```typescript
export default function Marking() {
  return (
    <div>
      <EditorNavigation currentTab="marking" />
      <div className="p-8">
        <AnalyticsOverview />
        <AIMarkingActions />
        <SubmissionsTable />
      </div>
    </div>
  );
}
```

### 11.2 Analytics Overview

**File:** `app/components/marking/analytics-overview.tsx`

#### 11.2.1 Top Stats Row

```typescript
<div className="grid grid-cols-3 gap-6">
  <Card>
    <h3>Class Average</h3>
    <GradeDistributionChart />
    <AnimatedNumber value={average} suffix="%" />
  </Card>

  <Card>
    <h3>Unmarked Submissions</h3>
    <div className="text-4xl">
      <AnimatedNumber value={unmarkedCount} />
      <span className="text-muted">/ {totalCount}</span>
    </div>
  </Card>

  <Card>
    <h3>Grade Distribution</h3>
    <BarChart data={distribution} />
  </Card>
</div>
```

#### 11.2.2 Grade Distribution Chart

**File:** `app/components/marking/grade-distribution-chart.tsx`

```typescript
// Recharts PieChart
// Categories: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)
// Colors from design system
// Show percentage and count
```

### 11.3 AI Marking Actions

**File:** `app/components/marking/ai-marking-button.tsx`

#### 11.3.1 Bulk AI Marking

```typescript
<Card>
  <Button size="lg" onClick={handleAIMarkAll}>
    <Sparkles className="mr-2" />
    AI Auto-Mark All Text Responses
  </Button>
  <p className="text-sm text-muted">
    Uses AI to grade all text responses. Estimated cost: {estimatedCredits}{" "}
    credits
  </p>
</Card>
```

#### 11.3.2 AI Marking Dialog

```typescript
// Show progress dialog
// List submissions being marked
// Progress bar
// Cancel button
// Success summary
```

#### 11.3.3 Implementation

```typescript
// Get all unmarked text responses
// Batch process with AI
// Show real-time progress
// Update marks in database
// Show success notification
```

### 11.4 Submissions Table

**File:** `app/components/marking/submissions-table.tsx`

#### 11.4.1 Table Tabs

```typescript
<Tabs defaultValue="unmarked">
  <TabsList>
    <TabsTrigger value="unmarked">Unmarked ({unmarkedCount})</TabsTrigger>
    <TabsTrigger value="marked">Marked ({markedCount})</TabsTrigger>
  </TabsList>

  <TabsContent value="unmarked">
    <SubmissionsDataTable data={unmarked} />
  </TabsContent>

  <TabsContent value="marked">
    <SubmissionsDataTable data={marked} />
  </TabsContent>
</Tabs>
```

#### 11.4.2 Table Columns

```typescript
// Name
// Email
// Submitted date/time
// Score (--/total for unmarked, actual for marked)
// Status badge
// Actions (Mark/View button)
```

#### 11.4.3 Features

- Sortable columns
- Search by name/email
- Filter by date range
- Bulk selection
- Export to CSV
- Pagination

#### 11.4.4 Implementation

```typescript
// Use @tanstack/react-table
// Server-side sorting/filtering
// Responsive design
```

### 11.5 Individual Marking Route

**File:** `app/routes/app.$projectId.mark.$submissionId.tsx`

#### 11.5.1 Loader

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // Require auth
  // Load submission with all responses
  // Load fields
  // Verify ownership
  return json({ submission, responses, fields });
}
```

#### 11.5.2 Layout

```typescript
export default function SubmissionMarking() {
  return (
    <div className="flex h-screen">
      <QuestionNavigator />
      <div className="flex-1 flex flex-col">
        <MarkingHeader />
        <SubmissionView />
      </div>
    </div>
  );
}
```

### 11.6 Marking Header

**File:** `app/components/marking/marking-header.tsx`

#### 11.6.1 Design

```typescript
<div className="border-b p-4 flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={goBack}>
      <ArrowLeft />
      Exit Marking
    </Button>
    <div>
      <h2>{submission.respondentName}'s Submission</h2>
      <p className="text-sm text-muted">
        Submitted {formatDate(submission.submittedAt)}
      </p>
    </div>
  </div>

  <div className="text-right">
    <div className="text-2xl font-bold">
      <AnimatedNumber value={earnedMarks} /> / {totalMarks}
    </div>
    <div className="text-muted">
      <AnimatedNumber value={percentage} suffix="%" />
    </div>
  </div>
</div>
```

### 11.7 Question Navigator

**File:** `app/components/marking/question-navigator.tsx`

#### 11.7.1 Design (Left Sidebar)

```typescript
<div className="w-64 border-r overflow-y-auto">
  <div className="p-4">
    <h3>Questions</h3>
    <div className="space-y-2">
      {fields.map((field, index) => (
        <QuestionNavItem
          key={field._id}
          number={index + 1}
          title={field.question}
          status={getMarkingStatus(field._id)}
          marks={getMarks(field._id)}
          maxMarks={field.marks}
          onClick={() => scrollToQuestion(field._id)}
        />
      ))}
    </div>
  </div>

  <div className="p-4 border-t">
    <div className="text-center">
      <p className="text-sm text-muted">Total Score</p>
      <div className="text-3xl font-bold">
        <AnimatedNumber value={percentage} suffix="%" />
      </div>
    </div>
  </div>
</div>
```

#### 11.7.2 Question Nav Item

```typescript
// Show status indicator:
// ✓ Green checkmark - Marked
// ⚠ Yellow warning - Partially marked
// ○ Gray circle - Not marked
// Show marks: X/Y
// Highlight current question
// Click to scroll to question
```

### 11.8 Submission View

**File:** `app/components/marking/submission-view.tsx`

#### 11.8.1 Structure

```typescript
// Scrollable area
// Show each question with response
// Marking panel for each question
// Previous/Next navigation at bottom
```

#### 11.8.2 Question Display

```typescript
<div className="p-8">
  {fields.map((field, index) => (
    <div key={field._id} id={`question-${field._id}`} className="mb-8">
      <QuestionCard>
        <QuestionHeader>
          <span>Question {index + 1}</span>
          <span>{field.marks} marks</span>
        </QuestionHeader>

        <QuestionText>{field.question}</QuestionText>

        <StudentAnswer>{getResponse(field._id)}</StudentAnswer>

        <MarkingPanel
          response={getResponseObject(field._id)}
          field={field}
          onMark={handleMark}
        />
      </QuestionCard>
    </div>
  ))}
</div>
```

### 11.9 Marking Panel

**File:** `app/components/marking/marking-panel.tsx`

#### 11.9.1 Auto-Marked Fields (Multiple Choice, Checkbox)

```typescript
// Show automatic result
// Display: Correct ✓ or Incorrect ✗
// Show marks awarded
// Option to override with manual marks
// Feedback textarea (optional)
```

#### 11.9.2 Text Response Fields

```typescript
<Card className="mt-4">
  <CardHeader>
    <div className="flex items-center justify-between">
      <h4>Marking</h4>
      <Button variant="ghost" size="sm" onClick={handleAISuggest}>
        <Sparkles className="mr-2" />
        AI Suggest
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Marks</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            max={field.marks}
            min={0}
          />
          <span>/ {field.marks}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={() => setMarks(field.marks)}>
            Full Marks
          </Button>
          <Button size="sm" onClick={() => setMarks(field.marks / 2)}>
            Half Marks
          </Button>
          <Button size="sm" onClick={() => setMarks(0)}>
            Zero
          </Button>
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <ToggleGroup type="single" value={status} onValueChange={setStatus}>
          <ToggleGroupItem value="correct">Correct</ToggleGroupItem>
          <ToggleGroupItem value="partial">Partial</ToggleGroupItem>
          <ToggleGroupItem value="incorrect">Incorrect</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <Label>Feedback (optional)</Label>
        <Textarea
          placeholder="Add comments for the student..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <Button onClick={handleSave}>Save Mark</Button>
    </div>
  </CardContent>
</Card>
```

#### 11.9.3 AI Suggest Implementation

```typescript
// Show loading state
// Call AI grading function
// Display suggested marks and feedback in popover
// Allow teacher to accept or modify
// Track AI usage
```

#### 11.9.4 Navigation

```typescript
<div className="flex justify-between mt-8">
  <Button
    variant="outline"
    onClick={previousQuestion}
    disabled={isFirstQuestion}
  >
    <ChevronLeft /> Previous Question
  </Button>

  <Button onClick={nextQuestion} disabled={isLastQuestion}>
    Next Question <ChevronRight />
  </Button>
</div>
```

---

## PHASE 12: AI Integration

### 12.1 AI Configuration

**File:** `app/lib/ai/config.ts`

#### 12.1.1 Setup xAI Provider

```typescript
import { createOpenAI } from "@ai-sdk/openai";

export const xai = createOpenAI({
  name: "xai",
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export const MODELS = {
  FAST: "grok-4-fast-non-reasoning",
  REASONING: "grok-4-fast-reasoning",
} as const;
```

#### 12.1.2 Cost Calculation

```typescript
export const TOKEN_COSTS = {
  INPUT_PER_1K: 0.025, // $25/1M = 0.025 credits per 1K tokens
  OUTPUT_PER_1K: 0.05, // $50/1M = 0.05 credits per 1K tokens
};

export function calculateCost(inputTokens: number, outputTokens: number) {
  const inputCost = (inputTokens / 1000) * TOKEN_COSTS.INPUT_PER_1K;
  const outputCost = (outputTokens / 1000) * TOKEN_COSTS.OUTPUT_PER_1K;
  return inputCost + outputCost;
}
```

### 12.2 Generate Dummy Options

**File:** `app/lib/ai/generate-options.ts`

#### 12.2.1 Function Implementation

```typescript
import { generateText } from "ai";
import { xai, MODELS } from "./config";

export async function generateDummyOptions(
  question: string,
  correctAnswer: string
): Promise<string[]> {
  const prompt = `Given this multiple choice question and correct answer, generate 3 plausible but incorrect options.

Question: ${question}
Correct Answer: ${correctAnswer}

Requirements:
- Generate exactly 3 wrong answers
- Make them plausible and challenging
- They should test common misconceptions
- Keep similar length and style to the correct answer
- Return as JSON array of strings

Example output: ["Option 1", "Option 2", "Option 3"]`;

  const { text, usage } = await generateText({
    model: xai(MODELS.FAST),
    prompt,
  });

  // Parse response
  const options = JSON.parse(text);

  // Track usage
  // Return options
  return options;
}
```

#### 12.2.2 Convex Action

**File:** `convex/ai-actions.ts`

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateDummyOptions } from "../app/lib/ai/generate-options";

export const generateOptions = action({
  args: {
    fieldId: v.id("fields"),
    question: v.string(),
    correctAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    // Check user has credits
    // Generate options using AI
    // Track usage
    // Deduct credits
    // Update field with new options
    // Return options
  },
});
```

### 12.3 AI Test Creation

**File:** `app/lib/ai/create-test.ts`

#### 12.3.1 Function Implementation

```typescript
import { generateObject } from "ai";
import { xai, MODELS } from "./config";
import { z } from "zod";

const questionSchema = z.object({
  type: z.enum(["multiple-choice", "short-text", "long-text"]),
  question: z.string(),
  marks: z.number(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  rubric: z.string().optional(),
});

const testSchema = z.object({
  questions: z.array(questionSchema),
});

export async function createTest(
  subject: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number
): Promise<any> {
  const prompt = `Create a ${difficulty} test for ${subject} on the topic of "${topic}" with ${questionCount} questions.

Requirements:
- Mix of multiple choice and written questions
- Appropriate marks allocation
- Clear, well-structured questions
- For multiple choice: provide 4 options with correct answer
- For written questions: provide marking rubric

Generate a comprehensive test suitable for students.`;

  const { object, usage } = await generateObject({
    model: xai(MODELS.REASONING),
    schema: testSchema,
    prompt,
  });

  // Track usage
  // Return test structure
  return object;
}
```

#### 12.3.2 Convex Action

```typescript
export const createTestWithAI = action({
  args: {
    projectId: v.id("projects"),
    subject: v.string(),
    topic: v.string(),
    difficulty: v.string(),
    questionCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Check credits (high cost for reasoning model)
    // Generate test
    // Create fields in database
    // Track usage
    // Deduct credits
    // Return field IDs
  },
});
```

### 12.4 AI Grading

**File:** `app/lib/ai/grade-response.ts`

#### 12.4.1 Grade Single Response

```typescript
import { generateObject } from "ai";
import { xai, MODELS } from "./config";
import { z } from "zod";

const gradingSchema = z.object({
  marks: z.number(),
  maxMarks: z.number(),
  feedback: z.string(),
  reasoning: z.string(),
  isCorrect: z.boolean(),
});

export async function gradeResponse(
  question: string,
  studentResponse: string,
  maxMarks: number,
  rubric?: string
): Promise<z.infer<typeof gradingSchema>> {
  const prompt = `Grade this student response.

Question: ${question}
${rubric ? `Marking Rubric: ${rubric}` : ""}
Maximum Marks: ${maxMarks}

Student Response: ${studentResponse}

Provide:
1. Marks awarded (0 to ${maxMarks})
2. Constructive feedback
3. Reasoning for the marks
4. Whether answer is correct/acceptable

Be fair but thorough. Consider partial credit where appropriate.`;

  const { object, usage } = await generateObject({
    model: xai(MODELS.REASONING),
    schema: gradingSchema,
    prompt,
  });

  // Track usage
  return object;
}
```

#### 12.4.2 Bulk Grading Action

```typescript
export const bulkGradeResponses = action({
  args: {
    submissionIds: v.array(v.id("submissions")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    // Get all text responses from submissions
    // Check credits (estimate cost)
    // Process each response with AI
    // Update responses with marks
    // Update submission totals
    // Track usage
    // Deduct credits
    // Return summary
  },
});
```

#### 12.4.3 Single Response Suggestion

```typescript
export const suggestGrade = action({
  args: {
    responseId: v.id("responses"),
  },
  handler: async (ctx, args) => {
    // Get response, field, and submission
    // Verify ownership
    // Check credits
    // Call AI grading
    // Track usage
    // Deduct credits
    // Return suggestion (don't save yet)
  },
});
```

### 12.5 AI Credit Management

#### 12.5.1 Check Credits Before AI Call

```typescript
// Before any AI operation
export async function checkCredits(
  userId: string,
  estimatedCost: number
): Promise<boolean> {
  // Query user's credit balance
  // Return true if sufficient
  // Return false if insufficient
  // Show warning toast if low
}
```

#### 12.5.2 Track and Deduct

```typescript
export async function trackAIUsage(
  userId: string,
  feature: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  metadata?: any
) {
  // Calculate cost
  // Create ai_usage record
  // Deduct from credits
  // Update pay-as-you-go meter if applicable
  // Return new balance
}
```

### 12.6 AI Feature UI Integration

#### 12.6.1 Generate Options Button

```typescript
// In multiple-choice field editor
<Button
  onClick={handleGenerateOptions}
  disabled={!correctAnswer || loading}
>
  <Sparkles className="mr-2" />
  {loading ? "Generating..." : "Generate AI Options"}
</Button>

// Show credit cost
<p className="text-xs text-muted">~1 credit</p>
```

#### 12.6.2 AI Suggest Button (Marking)

```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={handleAISuggest}
  disabled={loading}
>
  <Sparkles className="mr-2" />
  AI Suggest
</Button>

// Show popover with suggestion
<Popover>
  <PopoverContent>
    <h4>AI Suggestion</h4>
    <p>Marks: {suggestion.marks}/{maxMarks}</p>
    <p>Feedback: {suggestion.feedback}</p>
    <div className="flex gap-2">
      <Button onClick={acceptSuggestion}>Accept</Button>
      <Button variant="outline">Modify</Button>
    </div>
  </PopoverContent>
</Popover>
```

#### 12.6.3 Bulk AI Marking

```typescript
<Button size="lg" onClick={handleBulkMark}>
  <Sparkles className="mr-2" />
  AI Auto-Mark All Text Responses
</Button>

// Show progress dialog
<Dialog open={marking}>
  <DialogContent>
    <h3>AI Marking in Progress</h3>
    <Progress value={progress} />
    <p>{markedCount} / {totalCount} responses marked</p>
    <Button onClick={cancel}>Cancel</Button>
  </DialogContent>
</Dialog>
```

---

## PHASE 13: Billing Integration

### 13.1 Polar Setup

#### 13.1.1 Create Products in Polar Dashboard

1. **AI Credits (One-time)**

   - Product name: "AI Credits"
   - Type: One-time payment
   - Variable pricing: Yes
   - Minimum: $5
   - Description: "Purchase AI credits for test generation and grading"

2. **Pay-As-You-Go (Subscription)**
   - Product name: "Pay-As-You-Go AI"
   - Type: Subscription
   - Billing: Monthly
   - Metered billing: Yes
   - Description: "Pay for AI usage at the end of each month"

#### 13.1.2 Polar Webhook Configuration

- Webhook URL: `https://yourdomain.com/api/polar/webhook`
- Events: `checkout.success`, `subscription.created`, `subscription.updated`, `subscription.canceled`

### 13.2 Convex Billing Functions

**File:** `convex/billing.ts`

#### 13.2.1 Create Checkout Session

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const createCheckout = action({
  args: {
    type: v.union(v.literal("credits"), v.literal("subscription")),
    amount: v.optional(v.number()), // For credits
  },
  handler: async (ctx, args) => {
    // Get user ID
    // Create Polar checkout session
    // Return checkout URL
  },
});
```

#### 13.2.2 Handle Payment Success

```typescript
export const handlePaymentSuccess = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert amount to credits ($1 = 10 credits)
    const credits = args.amount * 10;

    // Add credits to user balance
    // Create transaction record
    // Send confirmation email
  },
});
```

#### 13.2.3 Handle Subscription Created

```typescript
export const handleSubscriptionCreated = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    meterId: v.string(),
  },
  handler: async (ctx, args) => {
    // Update user's plan to pay-as-you-go
    // Store subscription and meter IDs
    // Set billing period start
  },
});
```

#### 13.2.4 Track Metered Usage

```typescript
export const trackMeteredUsage = mutation({
  args: {
    userId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  handler: async (ctx, args) => {
    // Calculate cost
    // Update Polar meter
    // Track in period usage
  },
});
```

### 13.3 Billing UI Components

#### 13.3.1 Purchase Credits Dialog

**File:** `app/components/dashboard/purchase-credits-dialog.tsx`

```typescript
export function PurchaseCreditsDialog() {
  const [amount, setAmount] = useState(5);
  const credits = amount * 10;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Purchase Credits</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase AI Credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              min={5}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-sm text-muted">
              You will receive {credits} credits
            </p>
          </div>

          <div className="bg-secondary p-4 rounded">
            <h4 className="font-medium">Pricing</h4>
            <p className="text-sm">$1 = 10 Credits</p>
            <p className="text-sm">Minimum: $5 (50 credits)</p>
          </div>

          <Button onClick={handleCheckout} className="w-full">
            Continue to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 13.3.2 Plan Selector

**File:** `app/components/dashboard/plan-selector.tsx`

```typescript
export function PlanSelector() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Pay-Per-Use</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Purchase credits as you need them</p>
          <ul className="mt-4 space-y-2">
            <li>✓ No monthly commitment</li>
            <li>✓ Credits never expire</li>
            <li>✓ $1 = 10 credits</li>
          </ul>
          <Button className="mt-4" onClick={openPurchaseDialog}>
            Purchase Credits
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pay-As-You-Go</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Billed monthly based on usage</p>
          <ul className="mt-4 space-y-2">
            <li>✓ No upfront cost</li>
            <li>✓ Only pay for what you use</li>
            <li>✓ $25/M input tokens</li>
            <li>✓ $50/M output tokens</li>
          </ul>
          <Button className="mt-4" onClick={subscribePayAsYouGo}>
            Subscribe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 13.3.3 Usage History

**File:** `app/components/dashboard/usage-history.tsx`

```typescript
export function UsageHistory() {
  return (
    <div>
      <h3>AI Usage History</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Feature</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usage.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{formatDate(item.timestamp)}</TableCell>
              <TableCell>{item.feature}</TableCell>
              <TableCell>{item.tokensInput + item.tokensOutput}</TableCell>
              <TableCell>{item.cost} credits</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 13.4 Webhook Handler

**File:** `convex/http.ts` (extend existing)

#### 13.4.1 Polar Webhook Endpoint

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/polar/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify webhook signature
    // Parse event
    // Handle different event types

    const event = await request.json();

    switch (event.type) {
      case "checkout.success":
        await ctx.runMutation(api.billing.handlePaymentSuccess, {
          userId: event.data.user_id,
          amount: event.data.amount,
          transactionId: event.data.id,
        });
        break;

      case "subscription.created":
        await ctx.runMutation(api.billing.handleSubscriptionCreated, {
          userId: event.data.user_id,
          subscriptionId: event.data.id,
          meterId: event.data.meter_id,
        });
        break;

      // Handle other events
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

---

## PHASE 14: Testing & QA

### 14.1 Unit Tests

#### 14.1.1 Test Utilities

**File:** `app/lib/utils.test.ts`

- Test helper functions
- Test validation functions
- Test formatting functions

#### 14.1.2 Test AI Functions

**File:** `app/lib/ai/*.test.ts`

- Mock AI responses
- Test cost calculations
- Test error handling

#### 14.1.3 Test Convex Functions

**File:** `convex/*.test.ts`

- Test queries and mutations
- Test authorization checks
- Test data validation

### 14.2 Integration Tests

#### 14.2.1 Test User Flows

- Create account → Dashboard → Create test → Edit fields → Publish
- Take test → Submit → View results
- Mark submissions → AI grading → Update scores

#### 14.2.2 Test AI Features

- Generate dummy options
- AI test creation
- AI grading accuracy
- Credit deduction

#### 14.2.3 Test Billing

- Purchase credits
- Deduct credits
- Subscription billing
- Meter tracking

### 14.3 E2E Tests (Playwright)

#### 14.3.1 Critical User Journeys

```typescript
test("teacher can create and publish test", async ({ page }) => {
  // Login
  // Navigate to dashboard
  // Create new test
  // Add fields
  // Configure options
  // Publish
  // Verify published URL
});

test("student can take test and submit", async ({ page }) => {
  // Navigate to test URL
  // Enter name
  // Answer questions
  // Submit
  // See confirmation
});

test("teacher can mark submission", async ({ page }) => {
  // Login
  // Navigate to marking
  // Open submission
  // Mark responses
  // Save marks
  // Verify total updated
});
```

### 14.4 Manual Testing Checklist

#### 14.4.1 UI/UX Testing

- [ ] Responsive design on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Error messages clear
- [ ] Loading states smooth
- [ ] Animations performant

#### 14.4.2 Feature Testing

- [ ] All field types work correctly
- [ ] Drag and drop functions
- [ ] Auto-save reliable
- [ ] Timer accurate
- [ ] Progress bar updates
- [ ] Charts display correctly

#### 14.4.3 Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### 14.5 Performance Testing

#### 14.5.1 Metrics to Monitor

- Page load time < 2s
- Time to interactive < 3s
- Lighthouse score > 90
- Bundle size < 500KB

#### 14.5.2 Optimization

- Code splitting
- Image optimization
- Lazy loading
- Caching strategy

### 14.6 Security Testing

#### 14.6.1 Authentication

- [ ] Protected routes require auth
- [ ] Ownership checks on all mutations
- [ ] API keys secured
- [ ] Webhook signatures verified

#### 14.6.2 Data Validation

- [ ] Input sanitization
- [ ] SQL injection prevention (N/A with Convex)
- [ ] XSS prevention
- [ ] CSRF protection

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
