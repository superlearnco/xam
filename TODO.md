# Xam - Complete Implementation TODO

A comprehensive task list for building the AI-powered test creation platform with Convex (database), Autumn (pricing), and Databuddy (analytics).

---

## 🏗️ Foundation & Setup ✅ COMPLETE

### Project Infrastructure ✅ COMPLETE
- [x] Initialize Convex backend in the project
  - [x] Run `npm install convex` and `npx convex dev`
  - [x] Create `convex/` directory with schema definitions
  - [x] Set up Convex development environment and project
  - [x] Configure environment variables for Convex deployment URL
  - [x] Add ConvexProvider to root layout with ConvexReactClient
  - [x] Create utility functions in `convex/lib/utils.ts`
  - [x] Create initial user operations in `convex/users.ts`

- [x] Set up Clerk authentication
  - [x] Install Clerk SDK: `pnpm add @clerk/nextjs`
  - [ ] Create Clerk account and application (requires manual setup)
  - [x] Configure Clerk environment variables (publishable key, secret key, webhook secret)
  - [x] Set up Clerk authentication utilities and helpers
  - [x] Configure sign-in/sign-up URLs (in .env.example)
  - [x] Integrate Clerk with Convex using ConvexProviderWithClerk
  - [x] Create sign-in and sign-up pages using Clerk components
  - [x] Create AuthProvider and useAuth hook for client-side auth state
  - [x] Add Clerk middleware for route protection
  - [x] Set up Clerk webhook handler for user sync

- [x] Set up Polar billing integration (Merchant of Record)
  - [ ] Create Polar account at https://polar.sh (requires manual setup)
  - [ ] Create organization in Polar dashboard (requires manual setup)
  - [ ] Get access token from Settings > API tokens (requires manual setup)
  - [x] Configure Polar environment variables in .env.example
  - [x] Set up webhook endpoint at `/api/webhooks/polar`
  - [x] Install Polar SDK: `pnpm add @polar-sh/sdk`
  - [x] Create Polar client utility in `lib/polar/client.ts`
  - [x] Create webhook handler with event processing
  - [x] Update Convex schema to use Polar (polarCustomerId, benefits)
  - [x] Create billing Convex functions in `convex/billing.ts`
  - **NOTE:** Using Polar as merchant of record (handles tax, compliance, invoicing)

- [x] Integrate Databuddy analytics
  - [x] Create analytics tracking utilities in `lib/analytics/track.ts`
  - [ ] Create Databuddy account and verify domain (requires manual setup)
  - [x] Add Databuddy initialization component (AnalyticsProvider)
  - [x] Configure Databuddy with site ID and tracking options
  - [x] Set up custom event tracking utilities for all major actions
  - [x] Integrate AnalyticsProvider in root layout

### Environment Configuration ✅ COMPLETE (requires manual API key setup)
- [x] Create `.env.example` file with all required keys:
  - [x] `CONVEX_DEPLOYMENT` - Convex deployment URL
  - [x] `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
  - [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
  - [x] `CLERK_SECRET_KEY` - Clerk secret key
  - [x] `CLERK_WEBHOOK_SECRET` - Clerk webhook secret for user sync
  - [x] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL
  - [x] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL
  - [x] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Redirect after sign-in
  - [x] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Redirect after sign-up
  - [x] `POLAR_ACCESS_TOKEN` - Polar server-side access token
  - [x] `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` - Polar organization ID
  - [x] `POLAR_WEBHOOK_SECRET` - Polar webhook secret
  - [x] `DATABUDDY_SITE_ID` - Databuddy tracking ID
  - [x] `GEMINI_API_KEY` - For AI question generation (Google AI Studio)

  - [x] `NEXT_PUBLIC_APP_URL` - Application base URL

**Manual Setup Required (by user):**
- [x] Populate actual `.env.local` with real API keys
- [x] Create Polar account at https://polar.sh and configure:
  - Organization and products (pricing plans)
  - Benefits (ai_generation, ai_grading, etc.)
  - Webhook endpoint URL
  - Get access token from Settings > API tokens
- [x] Create Clerk account at https://clerk.com and configure:
  - Create application
  - Configure sign-in/sign-up options
  - Set up webhook endpoint for user sync
  - Get publishable key, secret key, and webhook secret
- [x] Create Databuddy account at https://databuddy.com and configure:
  - Verify domain
  - Get site ID for tracking

---

## 📊 Database Schema (Convex) ✅ COMPLETE

### User & Authentication Schema ✅ COMPLETE
- [x] Create `convex/schema.ts` with Convex schema builder
- [x] Define `users` table:
  - [x] `_id` - Convex auto ID
  - [x] `email` - string, unique, indexed
  - [x] `name` - string
  - [x] `avatar` - optional string (URL)
  - [x] `role` - enum: "teacher", "student", "admin"
  - [x] `credits` - number (default 500)
  - [x] `workosUserId` - string (WorkOS user ID)
  - [x] `workosOrganizationId` - optional string (for SSO users)
  - [x] `stripeCustomerId` - optional string
  - [x] `autumnCustomerId` - optional string
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)
  - [x] `lastLoginAt` - number (timestamp)
  - [x] `preferences` - object with UI preferences
  - [x] `emailVerified` - boolean

### Projects Schema ✅ COMPLETE
- [x] Define `projects` table:
  - [x] `_id` - Convex auto ID
  - [x] `userId` - reference to users table, indexed
  - [x] `name` - string
  - [x] `description` - optional string
  - [x] `type` - enum: "test", "essay", "survey"
  - [x] `status` - enum: "draft", "published", "archived"
  - [x] `thumbnail` - optional string (URL)
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)
  - [x] `publishedAt` - optional number (timestamp)
  - [x] `archivedAt` - optional number (timestamp)
  - [x] `settings` - object containing:
    - [x] `duration` - optional number (minutes)
    - [x] `maxAttempts` - number (default 1)
    - [x] `passingGrade` - number (percentage, default 60)
    - [x] `requireAuth` - boolean
    - [x] `requireEmailVerification` - boolean
    - [x] `passwordProtected` - boolean
    - [x] `password` - optional string (hashed)
    - [x] `disableCopyPaste` - boolean
    - [x] `fullScreenRequired` - boolean
    - [x] `blockTabSwitching` - boolean
    - [x] `autoGrade` - boolean (default true)
    - [x] `enableAIMarking` - boolean
    - [x] `instantFeedback` - boolean
    - [x] `showAnswerKey` - boolean
    - [x] `showExplanations` - boolean
    - [x] `notifyTeacherOnSubmission` - boolean
    - [x] `notifyTeacherDailySummary` - boolean
    - [x] `notifyTeacherWhenMarked` - boolean
    - [x] `notifyStudentOnSubmission` - boolean
    - [x] `notifyStudentOnGradeRelease` - boolean
    - [x] `notifyStudentDeadlineReminders` - boolean
  - [x] `totalMarks` - number
  - [x] `submissionCount` - number (default 0)
  - [x] `averageGrade` - optional number
  - [x] `viewCount` - number (default 0)

### Questions Schema ✅ COMPLETE
- [x] Define `questions` table:
  - [x] `_id` - Convex auto ID
  - [x] `projectId` - reference to projects table, indexed
  - [x] `order` - number (for sorting)
  - [x] `type` - enum: "multiple-choice", "multiple-select", "short-text", "long-text", "rich-text", "dropdown", "image-choice", "file-upload", "image-upload", "rating-scale", "linear-scale", "matrix", "section-header", "page-break", "info-block"
  - [x] `questionText` - string
  - [x] `description` - optional string (additional instructions)
  - [x] `imageUrl` - optional string
  - [x] `videoUrl` - optional string
  - [x] `points` - number
  - [x] `required` - boolean (default true)
  - [x] `options` - optional array of objects:
    - [x] `text` - string
    - [x] `imageUrl` - optional string
    - [x] `isCorrect` - boolean (for graded questions)
  - [x] `correctAnswers` - optional array (for multiple-select, checkboxes)
  - [x] `correctAnswer` - optional string/number (for single answer)
  - [x] `modelAnswer` - optional string (for AI grading reference)
  - [x] `rubric` - optional array of objects (grading criteria):
    - [x] `criterion` - string
    - [x] `points` - number
    - [x] `description` - string
  - [x] `explanation` - optional string (shown after submission)
  - [x] `randomizeOptions` - boolean
  - [x] `allowOther` - boolean (for choice questions)
  - [x] `minLength` - optional number (for text responses)
  - [x] `maxLength` - optional number (for text responses)
  - [x] `fileTypes` - optional array of strings (for file uploads)
  - [x] `maxFileSize` - optional number (MB, for file uploads)
  - [x] `scaleMin` - optional number (for rating/linear scale)
  - [x] `scaleMax` - optional number (for rating/linear scale)
  - [x] `scaleMinLabel` - optional string
  - [x] `scaleMaxLabel` - optional string
  - [x] `matrixRows` - optional array of strings
  - [x] `matrixColumns` - optional array of strings
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)
  - [x] `generatedByAI` - boolean (track AI-generated questions)

### Submissions Schema ✅ COMPLETE
- [x] Define `submissions` table:
  - [x] `_id` - Convex auto ID
  - [x] `projectId` - reference to projects table, indexed
  - [x] `studentId` - optional reference to users table, indexed
  - [x] `studentName` - string
  - [x] `studentEmail` - string, indexed
  - [x] `attemptNumber` - number
  - [x] `status` - enum: "in-progress", "submitted", "marked", "returned"
  - [x] `submittedAt` - optional number (timestamp)
  - [x] `markedAt` - optional number (timestamp)
  - [x] `returnedAt` - optional number (timestamp)
  - [x] `startedAt` - number (timestamp)
  - [x] `timeSpent` - number (seconds)
  - [x] `ipAddress` - optional string (anonymized)
  - [x] `userAgent` - optional string
  - [x] `flagged` - boolean (for suspicious activity)
  - [x] `flagReason` - optional string
  - [x] `tabSwitches` - number (default 0)
  - [x] `copyPasteAttempts` - number (default 0)
  - [x] `totalMarks` - number
  - [x] `awardedMarks` - number (default 0)
  - [x] `percentage` - number (calculated)
  - [x] `grade` - optional string (letter grade)
  - [x] `feedback` - optional string (teacher's overall feedback)
  - [x] `markedBy` - optional reference to users table
  - [x] `autoGraded` - boolean
  - [x] `aiGraded` - boolean
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)

### Answers Schema ✅ COMPLETE
- [x] Define `answers` table:
  - [x] `_id` - Convex auto ID
  - [x] `submissionId` - reference to submissions table, indexed
  - [x] `questionId` - reference to questions table, indexed
  - [x] `answerType` - enum matching question types
  - [x] `textAnswer` - optional string
  - [x] `selectedOption` - optional number/string (single choice)
  - [x] `selectedOptions` - optional array (multiple choice)
  - [x] `fileUrl` - optional string (for uploads)
  - [x] `fileName` - optional string
  - [x] `fileSize` - optional number
  - [x] `scaleValue` - optional number
  - [x] `matrixAnswers` - optional object (row -> column mapping)
  - [x] `isCorrect` - optional boolean (auto-graded)
  - [x] `pointsAwarded` - number (default 0)
  - [x] `pointsPossible` - number
  - [x] `feedback` - optional string (per-question feedback)
  - [x] `aiEvaluation` - optional object:
    - [x] `score` - number
    - [x] `reasoning` - string
    - [x] `suggestions` - array of strings
    - [x] `confidence` - number (0-1)
  - [x] `markedAt` - optional number (timestamp)
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)

### Organizations Schema (for multi-teacher accounts) ✅ COMPLETE
- [x] Define `organizations` table:
  - [x] `_id` - Convex auto ID
  - [x] `name` - string
  - [x] `slug` - string, unique, indexed
  - [x] `ownerId` - reference to users table
  - [x] `plan` - enum: "free", "starter", "pro", "enterprise"
  - [x] `autumnOrganizationId` - optional string
  - [x] `credits` - number (shared pool)
  - [x] `settings` - object
  - [x] `createdAt` - number (timestamp)
  - [x] `updatedAt` - number (timestamp)

- [x] Define `organizationMembers` table:
  - [x] `_id` - Convex auto ID
  - [x] `organizationId` - reference to organizations table, indexed
  - [x] `userId` - reference to users table, indexed
  - [x] `role` - enum: "owner", "admin", "member"
  - [x] `invitedBy` - optional reference to users table
  - [x] `invitedAt` - number (timestamp)
  - [x] `joinedAt` - optional number (timestamp)
  - [x] `status` - enum: "invited", "active", "inactive"

### AI Generation History Schema ✅ COMPLETE
- [x] Define `aiGenerations` table:
  - [x] `_id` - Convex auto ID
  - [x] `userId` - reference to users table, indexed
  - [x] `projectId` - optional reference to projects table
  - [x] `type` - enum: "questions", "distractors", "explanations", "grading"
  - [x] `prompt` - string
  - [x] `result` - string/object
  - [x] `model` - string (e.g., "gpt-4", "gpt-3.5-turbo")
  - [x] `tokensUsed` - number
  - [x] `creditsDeducted` - number
  - [x] `success` - boolean
  - [x] `error` - optional string
  - [x] `createdAt` - number (timestamp)

### Analytics Events Schema ✅ COMPLETE
- [x] Define `analyticsEvents` table (for internal tracking):
  - [x] `_id` - Convex auto ID
  - [x] `eventType` - string
  - [x] `userId` - optional reference to users table, indexed
  - [x] `projectId` - optional reference to projects table, indexed
  - [x] `metadata` - object (flexible data)
  - [x] `timestamp` - number

### Notifications Schema ✅ COMPLETE
- [x] Define `notifications` table:
  - [x] `_id` - Convex auto ID
  - [x] `userId` - reference to users table, indexed
  - [x] `type` - enum: "submission", "marking_complete", "grade_released", "deadline_reminder", "credit_low", "plan_upgrade"
  - [x] `title` - string
  - [x] `message` - string
  - [x] `link` - optional string
  - [x] `read` - boolean (default false)
  - [x] `readAt` - optional number (timestamp)
  - [x] `createdAt` - number (timestamp)

---

## 🔐 Authentication & User Management ✅ COMPLETE

### Clerk Authentication Integration ✅ COMPLETE
- [x] Install Clerk: `pnpm add @clerk/nextjs svix`
- [x] Set up Clerk account and create an application
- [x] Add Clerk environment variables (see Environment Configuration section)
- [x] Create authentication pages:
  - [x] `/sign-in` - Sign-in page with Clerk component
  - [x] `/sign-up` - Sign-up page with Clerk component
- [x] Implement Clerk authentication flow:
  - [x] Wrap app with ClerkProvider
  - [x] Use Clerk middleware for route protection
  - [x] Configure public and protected routes
  - [x] Set up redirect URLs after authentication
- [x] Set up protected routes middleware for `/app/*` pages
- [x] Create utility functions in `lib/clerk/utils.ts`:
  - [x] `getCurrentClerkUserId()` - Get current user ID
  - [x] `getCurrentClerkUserIdOrThrow()` - Get user ID or throw
  - [x] `getCurrentClerkUser()` - Get full user object
  - [x] `extractUserDataForConvex()` - Extract data for Convex sync
  - [x] `isAuthenticated()` - Check authentication status

- [ ] Optional: Set up Clerk Organizations for multi-tenant features
- [ ] Optional: Implement SSO/SAML for enterprise customers

### Convex + Clerk Integration ✅ COMPLETE
- [x] Create `lib/clerk/utils.ts` helper with Clerk utilities
- [x] Create `convex/auth.config.ts` for Clerk authentication
- [x] Implement authentication in Convex:
  - [x] Integrate ConvexProviderWithClerk for automatic auth
  - [x] Store Clerk user ID in Convex users table
  - [x] Pass authentication context to Convex queries/mutations
- [x] Create webhook endpoint to handle Clerk events:
  - [x] `user.created` → Create user in Convex
  - [x] `user.updated` → Update user in Convex
  - [x] `user.deleted` → Handle user deletion
  - [x] `organization.created` → Handle organization creation
  - [x] `organizationMembership.*` → Handle membership changes
- [x] Create `convex/users.ts` with user CRUD operations:
  - [x] `createUser` mutation (syncUserFromClerk)
  - [x] `updateUser` mutation (updateProfile, updatePreferences)
  - [x] `getUser` query (getUserById, getUserByClerkId, getUserByEmail)
  - [x] `getCurrentUser` query (using Clerk auth)
  - [x] `getUserByEmail` query
  - [x] `deleteUser` mutation (soft delete recommended, webhook handler ready)
  - [x] `syncUserFromClerk` mutation (from webhooks)

### User Profile Management ✅ COMPLETE
- [x] Create user profile page at `/app/profile`
  - [x] Display user information from Clerk profile (name, email)
  - [x] Edit name and avatar
  - [x] Show account creation date
  - [x] Display current plan and credits
  - [x] Link to billing portal
  - [x] Show organization if applicable
- [x] Create settings page at `/app/settings`
  - [x] Email notification preferences
  - [x] Default test settings
  - [x] UI preferences (theme, language)
  - [x] Account deletion option
- [x] Implement credit balance display in navbar
  - [x] Real-time updates from Convex
  - [x] Warning when credits are low (< 50)
  - [x] Link to purchase more credits

---

## 💳 Pricing & Billing (Polar) ✅ COMPLETE

### Polar Pricing Configuration ✅ COMPLETE
- [x] Create Polar account at https://polar.sh
- [x] Set up organization in Polar dashboard
- [x] Define pricing plans (products) in Polar:
  - [x] **Free Plan**: All normal features, unlimited projects
  - [x] **AI (Credit Based)**: $5 = 50 Credits, token-based pricing
  - [x] **Pro/Enterprise Plans**: Planned for future (not in current MVP)

### Credit System Configuration ✅ COMPLETE
- [x] Credit packages configured (6 tiers with bonus scaling):
  - [x] 50 credits - $5 (Starter Pack)
  - [x] 100 credits - $10 (Small Pack)
  - [x] 250 credits - $25 (Medium Pack, +10% bonus)
  - [x] 500 credits - $50 (Large Pack, +15% bonus)
  - [x] 1,000 credits - $100 (Pro Pack, +20% bonus)
  - [x] 2,500 credits - $250 (Business Pack, +25% bonus)
- [x] Configure credit usage rates (based on token pricing):
  - [x] AI question generation: ~0.06 credits (2000 input, 500 output tokens)
  - [x] AI distractor generation: ~0.03 credits (1000 input, 300 output tokens)
  - [x] AI explanation generation: ~0.036 credits (800 input, 400 output tokens)
  - [x] AI grading: ~0.0405 credits per answer (1500 input, 300 output tokens)
  - [x] AI feedback generation: ~0.078 credits (2000 input, 800 output tokens)
  - [x] AI rubric generation: ~0.057 credits (1000 input, 700 output tokens)
  - [x] AI question improvement: ~0.054 credits (1200 input, 600 output tokens)

### Polar Benefits Configuration ⏳ FUTURE (Not needed for MVP)
- [ ] Set up product benefits in Polar dashboard (future subscription plans - not in current MVP):
  - [ ] `ai_generation` - AI question/distractor generation
  - [ ] `ai_grading` - AI-assisted grading
  - [ ] `advanced_analytics` - Detailed analytics and exports
  - [ ] `custom_branding` - Remove Xam branding, add own logo
  - [ ] `team_collaboration` - Multi-user organizations
  - [ ] `priority_support` - Priority email/chat support
  - [ ] `api_access` - API access for integrations

### Convex Functions for Polar Integration ✅ COMPLETE
- [x] Create `convex/billing.ts` with Polar operations:
  - [x] `createCustomer` mutation - Create Polar customer when user signs up
  - [x] `getCreditBalance` query - Get customer's credit balance
  - [x] `addCredits` mutation - Add credits when purchased
  - [x] `deductCredits` mutation - Deduct credits when AI features used
  - [x] `hasSufficientCredits` query - Check credit availability
  - [x] `getBillingHistory` query - Get payment and credit transaction history
  - [x] `getCreditUsageStats` query - Get detailed credit usage statistics
  - [x] `grantWelcomeBonus` mutation - Grant welcome bonus (50 credits) to new users
  - [x] `getMyCredits` query - Get current user's credit balance

### Polar Client Library Setup ✅ COMPLETE
- [x] Install Polar SDK: `npm install @polar-sh/sdk`
- [x] Create Polar client utility in `lib/polar/client.ts`:
  - [x] Initialize Polar client with access token
  - [x] Helper functions for checkout, subscriptions, webhooks
  - [x] Customer management (create, fetch, list)
  - [x] Subscription management functions
  - [x] Webhook signature verification
  - [x] Product and benefit retrieval
- [x] Create credit configuration in `lib/polar/config/pricing.ts`:
  - [x] Token pricing constants (15 credits per million input, 60 per million output)
  - [x] Credit package definitions with bonus tiers
  - [x] Utility functions for credit/price conversions
  - [x] Estimated credit costs for AI operations
- [x] Create credit utilities in `lib/polar/credits.ts`:
  - [x] Operation cost calculations
  - [x] Credit availability checks
  - [x] Cost estimation for bulk operations
  - [x] Credit status display helpers

### Billing Portal Pages ✅ COMPLETE
- [x] Create billing page at `/app/billing`
  - [x] Display current credit balance with gradient card
  - [x] Show credit usage history with breakdown by operation type
  - [x] Display available credit packages for purchase with bonus highlighting
  - [x] Purchase flow integrated with Polar checkout
  - [x] Transaction history view with status indicators
  - [x] Usage breakdown by operation type with progress bars
  - [x] Credit statistics (total purchased, used, current balance)
  - [x] Pricing transparency section with token costs
- [x] Create pricing page at `/pricing` (marketing site)
  - [x] Display all credit packages with pricing and bonuses
  - [x] Token pricing transparency information
  - [x] FAQ section about billing model
  - [x] CTA buttons for purchasing credits
  - [x] Example usage calculations
  - [x] Comparison of package sizes
- [x] Create checkout success page at `/app/billing/success`
  - [x] Confirmation and thank you message
  - [x] Display purchased credits and new balance
  - [x] Order ID display
  - [x] Return to dashboard button
  - [x] View billing history button
- [x] Create checkout cancel page at `/app/billing/cancel`
  - [x] Cancellation explanation
  - [x] Retry purchase option
  - [x] Support contact information
  - [x] Common reasons for cancellation
- [x] Create checkout API endpoint at `/api/checkout/create`
  - [x] Clerk authentication integration
  - [x] Polar customer creation/retrieval
  - [x] Checkout session creation with success/cancel URLs

### Polar Webhook Handling ✅ COMPLETE
- [x] Create webhook endpoint at `/api/webhooks/polar`
  - [x] Verify Polar webhook signature using HMAC-SHA256
  - [x] Handle `order.created` event - Process credit purchases and add credits
  - [x] Handle `checkout.created` event - Track checkout sessions
  - [x] Handle `checkout.updated` event - Update checkout status
  - [x] Integration with Convex billing mutations
  - [x] Logging to `billingTransactions` table for audit trail
  - [x] Error handling and logging
- [ ] Additional webhook events (future - for subscription plans, not needed for MVP):
  - [ ] Handle `subscription.created` event
  - [ ] Handle `subscription.updated` event
  - [ ] Handle `subscription.canceled` event
  - [ ] Handle `benefit.granted` event
  - [ ] Handle `benefit.revoked` event
  - [ ] Handle `subscription.payment_succeeded` event
  - [ ] Handle `subscription.payment_failed` event
  - [ ] Send user notifications on payment events

---

## 📈 Analytics (Databuddy) ✅ COMPLETE

### Databuddy Setup ✅ COMPLETE
- [x] Add Databuddy tracking script to root layout
- [x] Create `lib/analytics.ts` helper file with tracking functions:
  - [x] `trackPageView(path: string)` - Track page navigation
  - [x] `trackEvent(eventName: string, properties?: object)` - Track custom events
  - [x] `trackProjectCreated(projectType: string)` - Project creation
  - [x] `trackProjectPublished(projectId: string, projectType: string)` - Publishing
  - [x] `trackSubmissionReceived(projectId: string)` - New submission
  - [x] `trackAIFeatureUsed(featureType: string, creditsUsed: number)` - AI usage
  - [x] `trackUpgrade(planName: string, amount: number)` - Plan upgrades
  - [x] `trackCreditPurchase(amount: number, credits: number)` - Credit purchases

### Event Tracking Implementation ✅ COMPLETE
- [x] Track landing page events:
  - [x] Page views
  - [x] "Get Started" button clicks
  - [x] "Watch Demo" button clicks
  - [x] Feature card interactions
- [x] Track authentication events:
  - [x] Sign-up started
  - [x] Sign-up completed
  - [x] Sign-in completed
  - [x] Sign-out
- [x] Track project lifecycle events:
  - [x] Project created (with type)
  - [x] Project opened for editing
  - [x] Question added (with type)
  - [x] Question deleted
  - [x] AI generation requested
  - [x] AI generation completed
  - [x] Project published
  - [x] Project archived
  - [x] Project deleted
  - [x] Share link copied
  - [x] QR code generated
- [x] Track student test-taking events:
  - [x] Test started
  - [x] Question answered
  - [x] Question flagged
  - [x] Test submitted
  - [x] Time spent per question
  - [x] Navigation patterns
- [x] Track marking events:
  - [x] Marking page opened
  - [x] Submission marked
  - [x] AI grading used
  - [x] Feedback sent
  - [x] Grades exported
- [x] Track billing events:
  - [x] Pricing page viewed
  - [x] Plan card clicked
  - [x] Checkout initiated
  - [x] Payment completed
  - [x] Payment failed
  - [x] Subscription cancelled
  - [x] Credits purchased

### Custom Analytics Dashboard (Internal) ✅ COMPLETE
- [x] Create admin analytics page at `/app/admin/analytics`
  - [x] Total users, projects, submissions
  - [x] Growth charts (daily/weekly/monthly)
  - [x] Revenue metrics from Polar
  - [x] Credit usage patterns
  - [x] Most popular features
  - [x] Churn analysis
  - [x] Error tracking and rates
- [x] Pull data from both Databuddy API and Convex
- [x] Create real-time dashboard widgets
- [x] Export functionality for reports

---

## 🎨 UI Components & Pages

### Landing Page (`/`)
- [ ] Update hero section with accurate content
- [ ] Ensure all images exist in `/public/images/`
- [ ] Add animations for scroll-triggered elements
- [ ] Implement "Watch Demo" modal with video embed
- [ ] Update footer with correct links
- [ ] Add testimonials section
- [ ] Add pricing preview section
- [ ] Optimize for SEO (meta tags, structured data)
- [ ] Add Databuddy tracking to all interactions

### App Navbar Component
- [ ] Replace mock data with real Convex queries
- [ ] Implement real-time credit balance display
- [ ] Add notification dropdown with real data:
  - [ ] Query notifications from Convex
  - [ ] Mark as read functionality
  - [ ] Real-time updates with Convex subscriptions
  - [ ] Badge showing unread count
- [ ] Add user profile dropdown:
  - [ ] Display user name and email from Clerk profile
  - [ ] Link to profile page
  - [ ] Link to settings page
  - [ ] Link to billing page
  - [ ] Sign out button (uses Clerk signOut)
- [ ] Mobile responsive hamburger menu
- [ ] Add upgrade button when on free plan
- [ ] Warning indicator when credits < 50

### Dashboard Page (`/app`)
- [ ] Replace mock projects with Convex query
- [ ] Implement real-time project list:
  - [ ] Query projects by userId
  - [ ] Sort by updatedAt, createdAt, or name
  - [ ] Filter by type (test, essay, survey)
  - [ ] Search by name
- [ ] Project card interactions:
  - [ ] Click to navigate to editor
  - [ ] Dropdown menu actions:
    - [ ] Edit → Navigate to editor
    - [ ] Duplicate → Create copy mutation
    - [ ] Archive → Update status mutation
    - [ ] Delete → Delete mutation with confirmation
  - [ ] Display accurate submission count
  - [ ] Show last updated timestamp
- [ ] Empty state when no projects
- [ ] Loading skeleton while fetching
- [ ] Error state handling
- [ ] Track page view and interactions

### Create Project Modal
- [ ] Connect to Convex `createProject` mutation
- [ ] Implement AI-assisted creation flow:
  - [ ] When "Use AI" is checked, show additional fields:
    - [ ] Topic/subject input
    - [ ] Number of questions slider
    - [ ] Difficulty level selector
    - [ ] Question types multi-select
  - [ ] Check user has sufficient credits
  - [ ] Show credit cost estimate
  - [ ] Generate questions with AI on creation
- [ ] Navigate to editor after creation
- [ ] Show loading state during creation
- [ ] Handle errors (insufficient credits, API errors)
- [ ] Track project creation event

### Project Editor Page (`/app/[projectId]/edit`)
- [ ] Replace mock questions with Convex queries
- [ ] Implement auto-save functionality:
  - [ ] Debounce input changes (500ms)
  - [ ] Save to Convex mutations
  - [ ] Show "Saving..." and "Saved" indicator
  - [ ] Handle save errors
- [ ] Test title and description editing:
  - [ ] Inline editing with auto-save
  - [ ] Character limits
  - [ ] Validation
- [ ] Question management:
  - [ ] Add question button → Insert new question
  - [ ] Drag to reorder questions (update `order` field)
  - [ ] Delete question with confirmation
  - [ ] Duplicate question
- [ ] Field Library panel:
  - [ ] Connect to add question by type
  - [ ] Show credit cost for AI-enhanced fields
  - [ ] Disable if insufficient credits
- [ ] Question Card component enhancements:
  - [ ] All question types rendering
  - [ ] Option management for choice questions
  - [ ] Set correct answers
  - [ ] Mark as required toggle
  - [ ] Randomize options toggle
  - [ ] Add explanation field
  - [ ] Add rubric for open-ended questions
- [ ] AI assistance features:
  - [ ] "Generate Options" button for MC questions:
    - [ ] Check credits
    - [ ] Call AI generation API
    - [ ] Deduct credits
    - [ ] Insert generated options
    - [ ] Track usage
  - [ ] "Generate Explanation" button:
    - [ ] Generate explanation for answer
    - [ ] Save to question
  - [ ] "Improve Question" suggestion:
    - [ ] Analyze question clarity
    - [ ] Suggest improvements
- [ ] Properties panel (right sidebar):
  - [ ] Display selected question details
  - [ ] Edit question settings
  - [ ] Preview question appearance
  - [ ] Validation rules
- [ ] Top action bar:
  - [ ] Preview button → Navigate to preview
  - [ ] Publish button → Show publish modal
  - [ ] Save indicator
  - [ ] Undo/Redo (implement with history)
- [ ] Track all editor interactions

### Options Page (`/app/[projectId]/options`)
- [ ] Connect all settings to Convex mutations
- [ ] General tab:
  - [ ] Test name and description
  - [ ] Duration (with "no limit" option)
  - [ ] Max attempts
  - [ ] Save changes button
- [ ] Access tab:
  - [ ] Authentication toggles
  - [ ] Password protection:
    - [ ] Enable/disable
    - [ ] Password input (hash before saving)
    - [ ] Password strength indicator
  - [ ] Browser restrictions toggles
  - [ ] IP address restrictions (advanced)
- [ ] Grading tab:
  - [ ] Auto-grade toggle (free)
  - [ ] AI marking toggle (check plan/credits):
    - [ ] Show credit cost per submission
    - [ ] Disable if insufficient credits or wrong plan
    - [ ] Explanation of AI marking
  - [ ] Passing grade percentage
  - [ ] Feedback options toggles
- [ ] Notifications tab:
  - [ ] All notification preference toggles
  - [ ] Save to user preferences
- [ ] Share section:
  - [ ] Generate unique shareable link
  - [ ] Copy link button with toast
  - [ ] QR code generation:
    - [ ] Generate QR code image
    - [ ] Download QR code
    - [ ] Print option
  - [ ] Embed code (iframe)
- [ ] Track settings changes

### Preview Page (`/app/[projectId]/preview`)
- [ ] Load project and questions from Convex
- [ ] Render all question types accurately:
  - [ ] Multiple choice with radio buttons
  - [ ] Multiple select with checkboxes
  - [ ] Short text with input
  - [ ] Long text with textarea
  - [ ] Rich text with editor (read-only preview)
  - [ ] Dropdown with select
  - [ ] Image choice with image options
  - [ ] File upload with upload button (disabled)
  - [ ] Rating scale with star/number display
  - [ ] Linear scale with slider
  - [ ] Matrix grid
  - [ ] Section headers, page breaks, info blocks
- [ ] Show preview-only message at bottom
- [ ] Apply test settings (show duration, marks, etc.)
- [ ] Mobile responsive preview
- [ ] Print-friendly view option
- [ ] Track preview views

### Student Test Page (`/test/[testId]`)
- [ ] Pre-test screen:
  - [ ] Load project details from Convex
  - [ ] Check if password required → Show password prompt
  - [ ] Check authentication requirements
  - [ ] Student name and email form
  - [ ] Honor code checkbox
  - [ ] Display test information (duration, questions, marks)
  - [ ] "Start Test" button → Create submission record
- [ ] Test interface:
  - [ ] Timer countdown (if duration set):
    - [ ] Display in navbar
    - [ ] Change color when < 5 minutes
    - [ ] Auto-submit when time expires
    - [ ] Sync time with server
  - [ ] Question display:
    - [ ] Show current question
    - [ ] Progress indicator
    - [ ] Question number
    - [ ] Points value
  - [ ] Answer input based on question type:
    - [ ] All question types functional
    - [ ] Save answers locally (localStorage backup)
    - [ ] Debounced save to Convex
    - [ ] Validation before allowing next
  - [ ] Navigation:
    - [ ] Previous/Next buttons
    - [ ] Question navigator grid
    - [ ] Visual indicators (answered, flagged, current)
    - [ ] Flag for review button
  - [ ] Browser restrictions enforcement:
    - [ ] Detect copy/paste attempts
    - [ ] Track tab switches
    - [ ] Request fullscreen if required
    - [ ] Block right-click if configured
    - [ ] Log all violations
  - [ ] Auto-save functionality:
    - [ ] Save answers every 30 seconds
    - [ ] Save on navigation
    - [ ] Show save indicator
  - [ ] Submission:
    - [ ] "Submit" button on last question
    - [ ] Confirmation modal showing unanswered questions
    - [ ] Final submit → Update submission status
    - [ ] Prevent multiple submissions
- [ ] Post-submission screen:
  - [ ] Thank you message
  - [ ] Confirmation number
  - [ ] If instant feedback enabled:
    - [ ] Show score immediately
    - [ ] Show correct/incorrect per question
    - [ ] Display explanations if enabled
  - [ ] Otherwise, "awaiting grading" message
- [ ] Handle session recovery:
  - [ ] If user refreshes mid-test, resume from last question
  - [ ] Restore answers from localStorage or Convex
- [ ] Track all test-taking events

### Marking Page (`/app/[projectId]/mark`)
- [ ] Load submissions from Convex with real-time updates
- [ ] Analytics dashboard section:
  - [ ] Average grade calculation (from marked submissions)
  - [ ] Grade distribution pie chart
  - [ ] Pending count (unmarked)
  - [ ] Completion rate (submitted/total students)
  - [ ] Real-time updates with Convex subscriptions
- [ ] Quick actions:
  - [ ] Auto-mark All button:
    - [ ] Auto-grade all auto-gradable questions
    - [ ] If AI marking enabled, queue AI grading
    - [ ] Update submissions
    - [ ] Show progress
  - [ ] Export Grades button:
    - [ ] Generate CSV with all submissions
    - [ ] Include student name, email, grade, percentage
    - [ ] Download file
  - [ ] Send Feedback button:
    - [ ] Batch send email to all marked students
    - [ ] Confirmation modal
- [ ] Submissions table:
  - [ ] Filter tabs: All, Unmarked, Marked, Flagged
  - [ ] Display submission data:
    - [ ] Student avatar and name
    - [ ] Email
    - [ ] Submission timestamp
    - [ ] Status badge
    - [ ] Grade (if marked)
    - [ ] Time taken
    - [ ] Flag indicator
  - [ ] Sort by various columns
  - [ ] Search by student name/email
  - [ ] Click row to navigate to marking detail page
- [ ] Track marking page interactions

### Submission Marking Page (`/app/[projectId]/mark/[submissionId]`)
- [ ] Load submission, answers, and questions from Convex
- [ ] Student info sidebar:
  - [ ] Display student details
  - [ ] Submission metadata
  - [ ] Flag indicator with reason
  - [ ] Tab switch/violation counts
- [ ] Main content area - Question list:
  - [ ] For each question, display:
    - [ ] Question text
    - [ ] Points possible
    - [ ] Student's answer
    - [ ] For auto-gradable questions:
      - [ ] Correct/Incorrect badge
      - [ ] Show correct answer
      - [ ] Auto-assigned points
    - [ ] For open-ended questions:
      - [ ] Text response display
      - [ ] Manual points input
      - [ ] Feedback textarea
      - [ ] "AI Grade" button:
        - [ ] Check credits and plan
        - [ ] Call AI grading API
        - [ ] Show AI score and reasoning
        - [ ] Allow teacher to accept/modify
        - [ ] Deduct credits
        - [ ] Track usage
  - [ ] Rubric display if available
  - [ ] Per-question feedback field
- [ ] Grade summary sidebar:
  - [ ] Total points awarded / total possible
  - [ ] Percentage calculation
  - [ ] Letter grade
  - [ ] Breakdown by question
  - [ ] Update in real-time as marks change
- [ ] Overall feedback section:
  - [ ] Rich text editor for detailed feedback
  - [ ] Save draft functionality
- [ ] Actions:
  - [ ] Save button - Save marks and feedback
  - [ ] Return to Student button:
    - [ ] Update submission status to "returned"
    - [ ] Send notification/email to student
    - [ ] Navigate back to marking list
- [ ] Track marking interactions

### Notifications System
- [ ] Create notifications dropdown in navbar:
  - [ ] Query notifications from Convex
  - [ ] Display list with infinite scroll
  - [ ] Mark single notification as read
  - [ ] Mark all as read button
  - [ ] Delete notification option
  - [ ] Click to navigate to relevant page
- [ ] Real-time notifications with Convex subscriptions
- [ ] Notification creation triggers:
  - [ ] New submission received (for teachers)
  - [ ] Grading complete (for students)
  - [ ] Payment successful
  - [ ] Credits running low
  - [ ] Plan renewal reminder
- [ ] Email notifications (if enabled):
  - [ ] Use Resend or SendGrid API
  - [ ] Create email templates
  - [ ] Queue emails in Convex
  - [ ] Send via API action
- [ ] Browser push notifications (future enhancement)

---

## 🤖 AI Features

### Google Gemini Integration
- [ ] Install Google Generative AI SDK: `npm install @google/generative-ai`
- [ ] Create `lib/gemini.ts` helper with Gemini client
- [ ] Configure API key in environment variables (get from Google AI Studio)
- [ ] Set up error handling and retry logic
- [ ] Implement token counting for credit calculation
- [ ] Choose appropriate model (gemini-pro or gemini-pro-vision)
- [ ] Configure safety settings for educational content
- [ ] Set up generation config (temperature, top-p, max tokens)

### AI Question Generation
- [ ] Create Convex action `convex/ai.ts` -> `generateQuestions`
  - [ ] Accept parameters: topic, count, difficulty, types, subject
  - [ ] Check user credits
  - [ ] Construct prompt for question generation
  - [ ] Call Gemini API (gemini-pro model)
  - [ ] Use JSON mode for structured output
  - [ ] Parse response (JSON format)
  - [ ] Validate generated questions
  - [ ] Calculate credits used (tokens + base cost)
  - [ ] Deduct credits via mutation
  - [ ] Return questions array
  - [ ] Log generation in `aiGenerations` table
- [ ] Create UI component for AI generation modal:
  - [ ] Topic input
  - [ ] Quantity slider (1-20)
  - [ ] Difficulty selector (Easy/Medium/Hard)
  - [ ] Question types multi-select
  - [ ] Subject/grade level selector
  - [ ] Show estimated credit cost
  - [ ] Generate button
  - [ ] Loading state with progress
  - [ ] Display generated questions
  - [ ] Edit before accepting
  - [ ] Insert into project
- [ ] Add "Generate with AI" option in project creation
- [ ] Track AI generation usage

### AI Distractor Generation
- [ ] Create Convex action `generateDistractors`
  - [ ] Accept question text and correct answer
  - [ ] Check user credits
  - [ ] Construct prompt for plausible distractors
  - [ ] Call Gemini API (gemini-pro model)
  - [ ] Parse and validate distractors
  - [ ] Ensure distractors are incorrect but plausible
  - [ ] Deduct credits
  - [ ] Return distractor options
  - [ ] Log generation
- [ ] Add "Generate Options" button in question editor
- [ ] Show loading state
- [ ] Allow editing generated options
- [ ] Track usage

### AI Explanation Generation
- [ ] Create Convex action `generateExplanation`
  - [ ] Accept question, correct answer, and difficulty level
  - [ ] Check user credits
  - [ ] Construct prompt for educational explanation
  - [ ] Call Gemini API (gemini-pro model)
  - [ ] Deduct credits
  - [ ] Return explanation text
  - [ ] Log generation
- [ ] Add "Generate Explanation" button in question editor
- [ ] Show in explanation field
- [ ] Allow editing
- [ ] Track usage

### AI Grading for Open-Ended Questions
- [ ] Create Convex action `gradeAnswer`
  - [ ] Accept question, model answer, rubric, student answer
  - [ ] Check user credits and plan access
  - [ ] Construct detailed grading prompt:
    - [ ] Include rubric criteria
    - [ ] Request point breakdown
    - [ ] Request constructive feedback
    - [ ] Request confidence score
  - [ ] Call Gemini API (gemini-pro or gemini-1.5-pro for accuracy)
  - [ ] Use JSON mode for structured grading response
  - [ ] Parse grading response (JSON)
  - [ ] Calculate points awarded
  - [ ] Deduct credits (higher cost for grading)
  - [ ] Return grading result
  - [ ] Log AI evaluation in answer record
- [ ] Implement "AI Grade" button in marking interface:
  - [ ] Check access and credits
  - [ ] Show loading indicator
  - [ ] Display AI-assigned score
  - [ ] Show AI reasoning
  - [ ] Show suggestion for improvements
  - [ ] Allow teacher to accept or override
  - [ ] Save evaluation data
- [ ] Batch AI grading option:
  - [ ] Grade all open-ended questions in submission
  - [ ] Show progress
  - [ ] Allow review before finalizing
- [ ] Track AI grading usage and accuracy

### AI Question Improvement Suggestions
- [ ] Create Convex action `improveQuestion`
  - [ ] Accept question data
  - [ ] Analyze for clarity, bias, difficulty
  - [ ] Return suggestions
- [ ] Add subtle "Improve" button in editor
- [ ] Show suggestions in modal
- [ ] Apply or dismiss

---

## 🔧 Convex Queries, Mutations & Actions

### User Operations (`convex/users.ts`)
- [ ] Query: `getCurrentUser()` - Get authenticated user
- [ ] Query: `getUser(userId)` - Get user by ID
- [ ] Query: `getUserByEmail(email)` - Get user by email
- [ ] Mutation: `createUser(userData)` - Create new user
- [ ] Mutation: `updateUser(userId, updates)` - Update user data
- [ ] Mutation: `updateUserPreferences(userId, preferences)` - Update settings
- [ ] Mutation: `deleteUser(userId)` - Soft delete user
- [ ] Query: `getUserStats(userId)` - Get user statistics (projects, submissions, etc.)

### Project Operations (`convex/projects.ts`)
- [ ] Query: `getProject(projectId)` - Get single project
- [ ] Query: `getProjectsByUser(userId, filters)` - Get user's projects with filtering
- [ ] Query: `getPublishedProject(projectId)` - Get project if published (for students)
- [ ] Mutation: `createProject(projectData)` - Create new project
- [ ] Mutation: `updateProject(projectId, updates)` - Update project
- [ ] Mutation: `updateProjectSettings(projectId, settings)` - Update settings
- [ ] Mutation: `publishProject(projectId)` - Publish project
- [ ] Mutation: `archiveProject(projectId)` - Archive project
- [ ] Mutation: `deleteProject(projectId)` - Delete project
- [ ] Mutation: `duplicateProject(projectId)` - Create copy
- [ ] Mutation: `incrementViewCount(projectId)` - Track views
- [ ] Query: `getProjectAnalytics(projectId)` - Get analytics data

### Question Operations (`convex/questions.ts`)
- [ ] Query: `getQuestions(projectId)` - Get all questions for project
- [ ] Query: `getQuestion(questionId)` - Get single question
- [ ] Mutation: `createQuestion(questionData)` - Create question
- [ ] Mutation: `updateQuestion(questionId, updates)` - Update question
- [ ] Mutation: `deleteQuestion(questionId)` - Delete question
- [ ] Mutation: `reorderQuestions(projectId, questionIds)` - Update order
- [ ] Mutation: `duplicateQuestion(questionId)` - Copy question
- [ ] Mutation: `bulkCreateQuestions(projectId, questions)` - For AI generation

### Submission Operations (`convex/submissions.ts`)
- [ ] Query: `getSubmission(submissionId)` - Get single submission
- [ ] Query: `getSubmissions(projectId, filters)` - Get submissions with filters
- [ ] Query: `getStudentSubmissions(studentEmail, projectId)` - Get student's attempts
- [ ] Mutation: `createSubmission(submissionData)` - Start new submission
- [ ] Mutation: `updateSubmission(submissionId, updates)` - Update submission
- [ ] Mutation: `submitSubmission(submissionId)` - Mark as submitted
- [ ] Mutation: `markSubmission(submissionId, marks, feedback)` - Grade submission
- [ ] Mutation: `returnSubmission(submissionId)` - Return to student
- [ ] Mutation: `flagSubmission(submissionId, reason)` - Flag for review
- [ ] Query: `getSubmissionStats(projectId)` - Get analytics

### Answer Operations (`convex/answers.ts`)
- [ ] Query: `getAnswers(submissionId)` - Get all answers for submission
- [ ] Query: `getAnswer(answerId)` - Get single answer
- [ ] Mutation: `createAnswer(answerData)` - Save answer
- [ ] Mutation: `updateAnswer(answerId, updates)` - Update answer
- [ ] Mutation: `gradeAnswer(answerId, points, feedback)` - Grade answer
- [ ] Mutation: `bulkGradeAnswers(answers)` - Grade multiple answers
- [ ] Mutation: `saveAIEvaluation(answerId, evaluation)` - Save AI grading

### Billing Operations (`convex/billing.ts`)
- [ ] Query: `getUserBilling(userId)` - Get billing info and credits
- [ ] Query: `getTransactionHistory(userId)` - Get billing history
- [ ] Mutation: `deductCredits(userId, amount, reason)` - Deduct credits
- [ ] Mutation: `addCredits(userId, amount, reason)` - Add credits
- [ ] Mutation: `updateSubscription(userId, subscriptionData)` - Update subscription
- [ ] Action: `createCheckoutSession(userId, planId)` - Create Autumn checkout
- [ ] Action: `handleWebhook(webhookData)` - Process Autumn webhooks

### AI Operations (`convex/ai.ts`)
- [ ] Action: `generateQuestions(params)` - Generate questions with AI
- [ ] Action: `generateDistractors(question, answer)` - Generate distractors
- [ ] Action: `generateExplanation(question)` - Generate explanation
- [ ] Action: `gradeAnswer(questionId, answerId)` - AI grade answer
- [ ] Action: `improveQuestion(questionId)` - Get improvement suggestions
- [ ] Query: `getAIUsageHistory(userId)` - Get AI usage history

### Notification Operations (`convex/notifications.ts`)
- [ ] Query: `getNotifications(userId)` - Get user notifications
- [ ] Query: `getUnreadCount(userId)` - Get unread count
- [ ] Mutation: `createNotification(notificationData)` - Create notification
- [ ] Mutation: `markAsRead(notificationId)` - Mark notification read
- [ ] Mutation: `markAllAsRead(userId)` - Mark all read
- [ ] Mutation: `deleteNotification(notificationId)` - Delete notification

### Organization Operations (`convex/organizations.ts`) [Future]
- [ ] Query: `getOrganization(orgId)` - Get organization
- [ ] Query: `getUserOrganizations(userId)` - Get user's organizations
- [ ] Query: `getOrganizationMembers(orgId)` - Get members
- [ ] Mutation: `createOrganization(orgData)` - Create organization
- [ ] Mutation: `updateOrganization(orgId, updates)` - Update organization
- [ ] Mutation: `inviteMember(orgId, email, role)` - Invite member
- [ ] Mutation: `acceptInvitation(inviteId)` - Accept invitation
- [ ] Mutation: `removeMember(orgId, userId)` - Remove member
- [ ] Mutation: `updateMemberRole(orgId, userId, role)` - Change role

---

## 📧 Email & Notifications

### Email Service Setup
- [ ] Choose email provider (Resend recommended, or use Clerk email templates)
- [ ] Install SDK: `npm install resend` (if using Resend)
- [ ] Configure API key in environment variables
- [ ] Create `lib/email.ts` helper with email sending functions
- [ ] Optional: Use Clerk email templates for transactional emails

### Email Templates
- [ ] Create email templates folder: `/emails/`
- [ ] Use React Email or similar for templates
- [ ] Design templates:
  - [ ] Welcome email (new user)
  - [ ] Email verification
  - [ ] Password reset (if not using Clerk)
  - [ ] New submission notification (teacher)
  - [ ] Grading complete (student)
  - [ ] Grade released (student)
  - [ ] Deadline reminder (student)
  - [ ] Low credits warning
  - [ ] Payment successful
  - [ ] Payment failed
  - [ ] Subscription renewal reminder
  - [ ] Weekly digest (teacher)
- [ ] Include Xam branding in templates
- [ ] Add unsubscribe links

### Email Sending Implementation
- [ ] Create Convex action for sending emails:
  - [ ] `sendEmail(to, subject, template, data)`
  - [ ] Queue emails in database
  - [ ] Use action to call email API
  - [ ] Handle failures with retry logic
  - [ ] Log email events
- [ ] Implement email preferences:
  - [ ] Allow users to opt out of certain emails
  - [ ] Respect preferences in all email sends
- [ ] Schedule digest emails with Convex cron jobs

### In-App Notifications
- [ ] Create notification component in navbar
- [ ] Real-time updates with Convex subscriptions
- [ ] Toast notifications for important actions
- [ ] Notification center page at `/app/notifications`
- [ ] Sound/desktop notifications (optional, with permission)

---

## 🔒 Security & Access Control

### Row-Level Security in Convex
- [ ] Implement authentication checks in all queries/mutations:
  - [ ] Verify user identity with Clerk session
  - [ ] Check user ID matches resource owner
  - [ ] Implement role-based access (teacher/student/admin)
  - [ ] Validate Clerk session tokens in Convex actions
- [ ] Project access:
  - [ ] Only owner can edit/delete projects
  - [ ] Published projects readable by anyone with link
  - [ ] Draft projects only accessible by owner
- [ ] Submission access:
  - [ ] Teacher can view all submissions for their projects
  - [ ] Student can only view own submissions
  - [ ] Implement submission privacy settings
- [ ] Billing access:
  - [ ] Users can only view/modify own billing info
  - [ ] Admins can view all billing for support

### Data Validation
- [ ] Implement Zod schemas for all inputs
- [ ] Create `lib/validation.ts` with validation schemas
- [ ] Validate on both client and server:
  - [ ] Form inputs (project name, description, etc.)
  - [ ] Question content (no empty questions)
  - [ ] Answer submissions (correct format for question type)
  - [ ] Settings (valid ranges, formats)
- [ ] Sanitize user inputs to prevent XSS
- [ ] Rate limiting on expensive operations (AI calls)

### Test Security Features
- [ ] Password hashing with bcrypt or Argon2
- [ ] Implement secure password checking for password-protected tests
- [ ] IP address anonymization (GDPR compliance)
- [ ] Session management for test-taking:
  - [ ] Generate unique session tokens
  - [ ] Prevent multiple simultaneous sessions
  - [ ] Session timeout after duration
- [ ] File upload security:
  - [ ] Validate file types
  - [ ] Scan for malware (use service like VirusTotal API)
  - [ ] Limit file sizes
  - [ ] Store in secure cloud storage (Convex file storage)
- [ ] Prevent cheating:
  - [ ] Randomize question order
  - [ ] Randomize option order
  - [ ] Detect tab switching
  - [ ] Detect copy/paste attempts
  - [ ] Monitor timing anomalies
  - [ ] Flag suspicious submissions

### GDPR & Privacy Compliance
- [ ] Create privacy policy page at `/privacy`
- [ ] Create terms of service page at `/terms`
- [ ] Implement data export functionality:
  - [ ] User can export all their data
  - [ ] Generate JSON/CSV files
- [ ] Implement data deletion:
  - [ ] User can request account deletion
  - [ ] Permanently delete all user data
  - [ ] Anonymous aggregated data for analytics
- [ ] Cookie consent banner (if needed):
  - [ ] Only use essential cookies
  - [ ] Databuddy is cookieless by default
- [ ] Anonymize student data:
  - [ ] Hash IP addresses
  - [ ] Don't store sensitive information unnecessarily

---

## 🎨 Advanced Features

### Question Bank / Library
- [ ] Create `convex/questionBank.ts`:
  - [ ] Schema for shared questions
  - [ ] Questions tagged by subject, topic, difficulty
  - [ ] Public and private questions
- [ ] UI for browsing question bank:
  - [ ] Search and filter
  - [ ] Preview questions
  - [ ] Import into project
- [ ] Allow teachers to contribute questions to bank
- [ ] Moderation system for public questions

### Templates System
- [ ] Create `convex/templates.ts`:
  - [ ] Schema for project templates
  - [ ] Include questions and settings
  - [ ] Public and private templates
- [ ] Pre-built templates:
  - [ ] Common test formats (multiple choice quiz, essay exam, survey)
  - [ ] Subject-specific templates (math quiz, reading comprehension, lab report)
- [ ] UI for template marketplace:
  - [ ] Browse templates
  - [ ] Preview before using
  - [ ] Create project from template
- [ ] Allow users to save their projects as templates

### Collaboration Features (Pro/Enterprise)
- [ ] Team management:
  - [ ] Create/manage organizations
  - [ ] Invite team members
  - [ ] Role-based permissions (owner, editor, viewer)
- [ ] Shared projects:
  - [ ] Multiple teachers can edit same project
  - [ ] Real-time collaborative editing (Convex subscriptions)
  - [ ] Activity log showing who changed what
  - [ ] Comments on questions
- [ ] Shared question bank within organization
- [ ] Unified billing for organization

### Advanced Analytics & Reporting
- [ ] Teacher analytics dashboard:
  - [ ] Performance trends over time
  - [ ] Question difficulty analysis (based on student success rate)
  - [ ] Time spent per question analysis
  - [ ] Common wrong answers (to improve teaching)
  - [ ] Student performance comparison
  - [ ] Export reports as PDF/CSV
- [ ] Student analytics (for self-assessment):
  - [ ] Personal performance history
  - [ ] Strengths and weaknesses
  - [ ] Time management insights
- [ ] Class/cohort analytics:
  - [ ] Compare classes
  - [ ] Identify struggling students early
  - [ ] Intervention recommendations

### Custom Branding (Pro+)
- [ ] Allow custom logo upload
- [ ] Custom color scheme picker
- [ ] Custom domain support (CNAME setup)
- [ ] Remove "Powered by Xam" footer
- [ ] Custom email sender domain

### Integrations
- [ ] LMS integrations:
  - [ ] Google Classroom:
    - [ ] Sync roster
    - [ ] Post assignments
    - [ ] Sync grades
  - [ ] Canvas API integration
  - [ ] Moodle integration
- [ ] Google Drive integration:
  - [ ] Import questions from Google Docs
  - [ ] Export results to Google Sheets
- [ ] Zapier integration for automation
- [ ] Webhook system for custom integrations

### Mobile App (Future)
- [ ] React Native app for iOS and Android
- [ ] Offline test-taking capability
- [ ] Push notifications
- [ ] Camera for image questions
- [ ] Biometric authentication

### API for Developers (Enterprise)
- [ ] Create public API endpoints:
  - [ ] Create projects programmatically
  - [ ] Submit answers via API
  - [ ] Retrieve grades
  - [ ] Webhook events
- [ ] API documentation with examples
- [ ] API key management in settings
- [ ] Rate limiting per plan tier

---

## 🧪 Testing

### Unit Tests
- [ ] Set up testing framework (Vitest or Jest)
- [ ] Test Convex functions:
  - [ ] All queries return correct data
  - [ ] All mutations update data correctly
  - [ ] Actions handle errors properly
  - [ ] Edge cases covered
- [ ] Test utility functions:
  - [ ] Credit calculations
  - [ ] Grade calculations
  - [ ] Validation schemas
  - [ ] Email formatting

### Integration Tests
- [ ] Test Clerk authentication flow (sign-in, sign-up, sign-out)
- [ ] Test project creation → editing → publishing → taking → marking flow
- [ ] Test payment flow with Autumn
- [ ] Test AI generation features
- [ ] Test notifications delivery
- [ ] Test data export/deletion

### End-to-End Tests
- [ ] Set up Playwright or Cypress
- [ ] Test critical user journeys:
  - [ ] New user sign-up and onboarding
  - [ ] Create and publish a test
  - [ ] Student takes test and submits
  - [ ] Teacher marks submission
  - [ ] Upgrade to paid plan
  - [ ] Use AI features
- [ ] Test across different browsers
- [ ] Test responsive design on mobile/tablet

### Performance Testing
- [ ] Load testing with large datasets:
  - [ ] Many questions (100+)
  - [ ] Many submissions (1000+)
  - [ ] Real-time updates performance
- [ ] Optimize slow queries
- [ ] Add database indexes where needed
- [ ] Implement pagination for large lists
- [ ] Lazy loading for images and components

---

## 🚀 Deployment & DevOps

### Convex Deployment
- [ ] Deploy Convex backend to production:
  - [ ] Run `npx convex deploy`
  - [ ] Set production environment variables
  - [ ] Configure deployment URL
- [ ] Set up Convex scheduled functions (cron jobs):
  - [ ] Daily credit reset for subscriptions
  - [ ] Weekly digest email sends
  - [ ] Clean up old anonymous sessions
  - [ ] Archive old submissions

### Frontend Deployment (Vercel)
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set up production domain
- [ ] Configure edge functions if needed
- [ ] Enable ISR or SSR where appropriate

### Database Backups
- [ ] Convex handles automatic backups
- [ ] Set up export scripts for additional backups
- [ ] Test restore procedures

### Monitoring & Logging
- [ ] Set up error tracking (Sentry):
  - [ ] Install `@sentry/nextjs`
  - [ ] Configure error reporting
  - [ ] Set up alerts for critical errors
- [ ] Set up performance monitoring:
  - [ ] Vercel Analytics (built-in)
  - [ ] Databuddy for user analytics
  - [ ] Convex dashboard for query performance
- [ ] Log important events:
  - [ ] Payment transactions
  - [ ] AI API calls
  - [ ] Security violations
  - [ ] User sign-ups

### CI/CD Pipeline
- [ ] Set up GitHub Actions:
  - [ ] Run linter on PR
  - [ ] Run tests on PR
  - [ ] Deploy preview on PR
  - [ ] Deploy to production on merge to main
- [ ] Automated database migrations if needed

### Scaling Considerations
- [ ] Optimize images (Next.js Image component)
- [ ] Implement CDN for static assets
- [ ] Database query optimization
- [ ] Caching strategy:
  - [ ] Cache public projects
  - [ ] Cache question data
  - [ ] Cache user billing info (short TTL)
- [ ] Rate limiting on API endpoints
- [ ] Queue long-running tasks (AI operations)

---

## 📝 Documentation

### User Documentation
- [ ] Create help center at `/help`:
  - [ ] Getting started guide
  - [ ] Creating your first test
  - [ ] Using AI features
  - [ ] Grading submissions
  - [ ] Understanding analytics
  - [ ] Billing and subscriptions
  - [ ] FAQ section
- [ ] Video tutorials:
  - [ ] Platform walkthrough
  - [ ] Advanced features demos
  - [ ] AI features guide
- [ ] In-app tooltips and tours

### Developer Documentation
- [ ] README.md with setup instructions
- [ ] CONTRIBUTING.md for contributors
- [ ] API documentation (if public API)
- [ ] Architecture diagrams
- [ ] Database schema documentation
- [ ] Code comments for complex logic

### Legal Documents
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy (if needed)
- [ ] Acceptable Use Policy
- [ ] Data Processing Agreement (for GDPR)

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All core features implemented and tested
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Analytics and tracking in place
- [ ] Error monitoring configured
- [ ] Backup and recovery tested
- [ ] Legal documents published
- [ ] Help documentation complete
- [ ] Email templates ready
- [ ] Payment processing tested (test mode and live)

### Soft Launch
- [ ] Limited beta access for testing
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on usage patterns
- [ ] A/B test pricing and features

### Public Launch
- [ ] Marketing website polished
- [ ] SEO optimized
- [ ] Social media accounts set up
- [ ] Press release prepared
- [ ] Customer support channels ready
- [ ] Onboarding flow smooth
- [ ] Monitoring dashboards configured
- [ ] Scale infrastructure if needed

### Post-Launch
- [ ] Monitor metrics daily
- [ ] Respond to user feedback
- [ ] Fix bugs quickly
- [ ] Iterate on features
- [ ] Plan roadmap for next features

---

## 🔄 Maintenance & Iteration

### Regular Tasks
- [ ] Monitor error rates and fix issues
- [ ] Review and optimize slow queries
- [ ] Update dependencies regularly
- [ ] Review security vulnerabilities
- [ ] Backup verification
- [ ] User feedback review and prioritization

### Feature Roadmap (Post-MVP)
- [ ] Question bank expansion
- [ ] More AI features (question rewriting, answer feedback)
- [ ] Advanced plagiarism detection
- [ ] Video questions
- [ ] Timed sections
- [ ] Conditional logic (skip questions based on answers)
- [ ] Peer review features
- [ ] Gamification (badges, leaderboards)
- [ ] White-label solution for institutions

---

## 🎉 Nice-to-Have Features

- [ ] Dark mode support (using next-themes, already included)
- [ ] Keyboard shortcuts for power users
- [ ] Bulk operations (bulk delete, bulk grade)
- [ ] Import questions from other formats (CSV, JSON)
- [ ] Print test to PDF
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Multi-language support (i18n)
- [ ] Voice input for answers
- [ ] Math equation editor (for STEM questions)
- [ ] Code editor for programming tests
- [ ] Diagram/drawing tools for answers

---

## ✅ Getting Started

1. **Set up the development environment:**
   - Install all dependencies
   - Configure Convex, Autumn, and Databuddy
   - Set up Clerk authentication
   - Run development servers

2. **Start with the foundation:**
   - Complete database schema
   - Set up authentication
   - Build basic CRUD for projects and questions

3. **Implement core features:**
   - Test creation and editing
   - Student test-taking flow
   - Basic grading system

4. **Add monetization:**
   - Integrate Autumn for billing
   - Implement credit system
   - Create pricing pages

5. **Enhance with AI:**
   - Question generation
   - Grading assistance
   - Content improvement

6. **Polish and launch:**
   - Analytics integration
