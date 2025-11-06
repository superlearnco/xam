# Xam - Complete Implementation TODO

A comprehensive task list for building the AI-powered test creation platform with Convex (database), Autumn (pricing), and Databuddy (analytics).

---

## 🏗️ Foundation & Setup

### Project Infrastructure ✅ COMPLETE
- [x] Initialize Convex backend in the project
  - [x] Run `npm install convex` and `npx convex dev`
  - [x] Create `convex/` directory with schema definitions
  - [x] Set up Convex development environment and project
  - [x] Configure environment variables for Convex deployment URL
  - [x] Add ConvexProvider to root layout with ConvexReactClient
  - [x] Create utility functions in `convex/lib/utils.ts`
  - [x] Create initial user operations in `convex/users.ts`

- [x] Set up WorkOS authentication
  - [x] Install WorkOS SDK: `npm install @workos-inc/node`
  - [ ] Create WorkOS account and application (requires manual setup)
  - [x] Configure WorkOS environment variables (API key, client ID)
  - [x] Set up WorkOS authentication utilities and client
  - [x] Configure OAuth callback URLs (in .env.example)
  - [x] Create authentication API routes (`/api/auth/login`, `/api/auth/callback`, `/api/auth/logout`, `/api/auth/me`)
  - [x] Create AuthProvider and useAuth hook for client-side auth state
  - [x] Add middleware for route protection
  - [x] Create login page with WorkOS integration

- [ ] Set up Polar billing integration (Merchant of Record)
  - [ ] Create Polar account at https://polar.sh
  - [ ] Create organization in Polar dashboard
  - [ ] Get access token from Settings > API tokens
  - [ ] Configure Polar environment variables
  - [ ] Set up webhook endpoint
  - **NOTE:** Using Polar as merchant of record (handles tax, compliance, invoicing)

- [x] Integrate Databuddy analytics
  - [x] Create analytics tracking utilities in `lib/analytics/track.ts`
  - [ ] Create Databuddy account and verify domain (requires manual setup)
  - [x] Add Databuddy initialization component (AnalyticsProvider)
  - [x] Configure Databuddy with site ID and tracking options
  - [x] Set up custom event tracking utilities for all major actions
  - [x] Integrate AnalyticsProvider in root layout

### Environment Configuration ✅ COMPLETE
- [x] Create `.env.example` file with all required keys:
  - [x] `CONVEX_DEPLOYMENT` - Convex deployment URL
  - [x] `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
  - [x] `WORKOS_API_KEY` - WorkOS backend key
  - [x] `WORKOS_CLIENT_ID` - WorkOS client ID
  - [x] `NEXT_PUBLIC_WORKOS_CLIENT_ID` - WorkOS frontend client ID
  - [x] `WORKOS_REDIRECT_URI` - OAuth callback URL
  - [x] `POLAR_ACCESS_TOKEN` - Polar server-side access token
  - [x] `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` - Polar organization ID
  - [x] `POLAR_WEBHOOK_SECRET` - Polar webhook secret
  - [x] `DATABUDDY_SITE_ID` - Databuddy tracking ID
  - [x] `GEMINI_API_KEY` - For AI question generation (Google AI Studio)

  - [x] `NEXT_PUBLIC_APP_URL` - Application base URL
  - [ ] **ACTION REQUIRED:** User needs to populate actual `.env.local` with real API keys

### Documentation Created ✅
- [x] `SETUP.md` - Comprehensive setup guide with prerequisites and instructions
- [x] `docs/FOUNDATION_SETUP_COMPLETE.md` - Completion summary and next steps
- [x] `.env.example` - Environment variables template with documentation

---

## 📊 Database Schema (Convex)

### User & Authentication Schema
- [ ] Create `convex/schema.ts` with Convex schema builder
- [ ] Define `users` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `email` - string, unique, indexed
  - [ ] `name` - string
  - [ ] `avatar` - optional string (URL)
  - [ ] `role` - enum: "teacher", "student", "admin"
  - [ ] `credits` - number (default 500)
  - [ ] `workosUserId` - string (WorkOS user ID)
  - [ ] `workosOrganizationId` - optional string (for SSO users)
  - [ ] `stripeCustomerId` - optional string
  - [ ] `autumnCustomerId` - optional string
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)
  - [ ] `lastLoginAt` - number (timestamp)
  - [ ] `preferences` - object with UI preferences
  - [ ] `emailVerified` - boolean

### Projects Schema
- [ ] Define `projects` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `userId` - reference to users table, indexed
  - [ ] `name` - string
  - [ ] `description` - optional string
  - [ ] `type` - enum: "test", "essay", "survey"
  - [ ] `status` - enum: "draft", "published", "archived"
  - [ ] `thumbnail` - optional string (URL)
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)
  - [ ] `publishedAt` - optional number (timestamp)
  - [ ] `archivedAt` - optional number (timestamp)
  - [ ] `settings` - object containing:
    - [ ] `duration` - optional number (minutes)
    - [ ] `maxAttempts` - number (default 1)
    - [ ] `passingGrade` - number (percentage, default 60)
    - [ ] `requireAuth` - boolean
    - [ ] `requireEmailVerification` - boolean
    - [ ] `passwordProtected` - boolean
    - [ ] `password` - optional string (hashed)
    - [ ] `disableCopyPaste` - boolean
    - [ ] `fullScreenRequired` - boolean
    - [ ] `blockTabSwitching` - boolean
    - [ ] `autoGrade` - boolean (default true)
    - [ ] `enableAIMarking` - boolean
    - [ ] `instantFeedback` - boolean
    - [ ] `showAnswerKey` - boolean
    - [ ] `showExplanations` - boolean
    - [ ] `notifyTeacherOnSubmission` - boolean
    - [ ] `notifyTeacherDailySummary` - boolean
    - [ ] `notifyTeacherWhenMarked` - boolean
    - [ ] `notifyStudentOnSubmission` - boolean
    - [ ] `notifyStudentOnGradeRelease` - boolean
    - [ ] `notifyStudentDeadlineReminders` - boolean
  - [ ] `totalMarks` - number
  - [ ] `submissionCount` - number (default 0)
  - [ ] `averageGrade` - optional number
  - [ ] `viewCount` - number (default 0)

### Questions Schema
- [ ] Define `questions` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `projectId` - reference to projects table, indexed
  - [ ] `order` - number (for sorting)
  - [ ] `type` - enum: "multiple-choice", "multiple-select", "short-text", "long-text", "rich-text", "dropdown", "image-choice", "file-upload", "image-upload", "rating-scale", "linear-scale", "matrix", "section-header", "page-break", "info-block"
  - [ ] `questionText` - string
  - [ ] `description` - optional string (additional instructions)
  - [ ] `imageUrl` - optional string
  - [ ] `videoUrl` - optional string
  - [ ] `points` - number
  - [ ] `required` - boolean (default true)
  - [ ] `options` - optional array of objects:
    - [ ] `text` - string
    - [ ] `imageUrl` - optional string
    - [ ] `isCorrect` - boolean (for graded questions)
  - [ ] `correctAnswers` - optional array (for multiple-select, checkboxes)
  - [ ] `correctAnswer` - optional string/number (for single answer)
  - [ ] `modelAnswer` - optional string (for AI grading reference)
  - [ ] `rubric` - optional array of objects (grading criteria):
    - [ ] `criterion` - string
    - [ ] `points` - number
    - [ ] `description` - string
  - [ ] `explanation` - optional string (shown after submission)
  - [ ] `randomizeOptions` - boolean
  - [ ] `allowOther` - boolean (for choice questions)
  - [ ] `minLength` - optional number (for text responses)
  - [ ] `maxLength` - optional number (for text responses)
  - [ ] `fileTypes` - optional array of strings (for file uploads)
  - [ ] `maxFileSize` - optional number (MB, for file uploads)
  - [ ] `scaleMin` - optional number (for rating/linear scale)
  - [ ] `scaleMax` - optional number (for rating/linear scale)
  - [ ] `scaleMinLabel` - optional string
  - [ ] `scaleMaxLabel` - optional string
  - [ ] `matrixRows` - optional array of strings
  - [ ] `matrixColumns` - optional array of strings
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)
  - [ ] `generatedByAI` - boolean (track AI-generated questions)

### Submissions Schema
- [ ] Define `submissions` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `projectId` - reference to projects table, indexed
  - [ ] `studentId` - optional reference to users table, indexed
  - [ ] `studentName` - string
  - [ ] `studentEmail` - string, indexed
  - [ ] `attemptNumber` - number
  - [ ] `status` - enum: "in-progress", "submitted", "marked", "returned"
  - [ ] `submittedAt` - optional number (timestamp)
  - [ ] `markedAt` - optional number (timestamp)
  - [ ] `returnedAt` - optional number (timestamp)
  - [ ] `startedAt` - number (timestamp)
  - [ ] `timeSpent` - number (seconds)
  - [ ] `ipAddress` - optional string (anonymized)
  - [ ] `userAgent` - optional string
  - [ ] `flagged` - boolean (for suspicious activity)
  - [ ] `flagReason` - optional string
  - [ ] `tabSwitches` - number (default 0)
  - [ ] `copyPasteAttempts` - number (default 0)
  - [ ] `totalMarks` - number
  - [ ] `awardedMarks` - number (default 0)
  - [ ] `percentage` - number (calculated)
  - [ ] `grade` - optional string (letter grade)
  - [ ] `feedback` - optional string (teacher's overall feedback)
  - [ ] `markedBy` - optional reference to users table
  - [ ] `autoGraded` - boolean
  - [ ] `aiGraded` - boolean
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)

### Answers Schema
- [ ] Define `answers` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `submissionId` - reference to submissions table, indexed
  - [ ] `questionId` - reference to questions table, indexed
  - [ ] `answerType` - enum matching question types
  - [ ] `textAnswer` - optional string
  - [ ] `selectedOption` - optional number/string (single choice)
  - [ ] `selectedOptions` - optional array (multiple choice)
  - [ ] `fileUrl` - optional string (for uploads)
  - [ ] `fileName` - optional string
  - [ ] `fileSize` - optional number
  - [ ] `scaleValue` - optional number
  - [ ] `matrixAnswers` - optional object (row -> column mapping)
  - [ ] `isCorrect` - optional boolean (auto-graded)
  - [ ] `pointsAwarded` - number (default 0)
  - [ ] `pointsPossible` - number
  - [ ] `feedback` - optional string (per-question feedback)
  - [ ] `aiEvaluation` - optional object:
    - [ ] `score` - number
    - [ ] `reasoning` - string
    - [ ] `suggestions` - array of strings
    - [ ] `confidence` - number (0-1)
  - [ ] `markedAt` - optional number (timestamp)
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)

### Organizations Schema (for multi-teacher accounts)
- [ ] Define `organizations` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `name` - string
  - [ ] `slug` - string, unique, indexed
  - [ ] `ownerId` - reference to users table
  - [ ] `plan` - enum: "free", "starter", "pro", "enterprise"
  - [ ] `autumnOrganizationId` - optional string
  - [ ] `credits` - number (shared pool)
  - [ ] `settings` - object
  - [ ] `createdAt` - number (timestamp)
  - [ ] `updatedAt` - number (timestamp)

- [ ] Define `organizationMembers` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `organizationId` - reference to organizations table, indexed
  - [ ] `userId` - reference to users table, indexed
  - [ ] `role` - enum: "owner", "admin", "member"
  - [ ] `invitedBy` - optional reference to users table
  - [ ] `invitedAt` - number (timestamp)
  - [ ] `joinedAt` - optional number (timestamp)
  - [ ] `status` - enum: "invited", "active", "inactive"

### AI Generation History Schema
- [ ] Define `aiGenerations` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `userId` - reference to users table, indexed
  - [ ] `projectId` - optional reference to projects table
  - [ ] `type` - enum: "questions", "distractors", "explanations", "grading"
  - [ ] `prompt` - string
  - [ ] `result` - string/object
  - [ ] `model` - string (e.g., "gpt-4", "gpt-3.5-turbo")
  - [ ] `tokensUsed` - number
  - [ ] `creditsDeducted` - number
  - [ ] `success` - boolean
  - [ ] `error` - optional string
  - [ ] `createdAt` - number (timestamp)

### Analytics Events Schema
- [ ] Define `analyticsEvents` table (for internal tracking):
  - [ ] `_id` - Convex auto ID
  - [ ] `eventType` - string
  - [ ] `userId` - optional reference to users table, indexed
  - [ ] `projectId` - optional reference to projects table, indexed
  - [ ] `metadata` - object (flexible data)
  - [ ] `timestamp` - number

### Notifications Schema
- [ ] Define `notifications` table:
  - [ ] `_id` - Convex auto ID
  - [ ] `userId` - reference to users table, indexed
  - [ ] `type` - enum: "submission", "marking_complete", "grade_released", "deadline_reminder", "credit_low", "plan_upgrade"
  - [ ] `title` - string
  - [ ] `message` - string
  - [ ] `link` - optional string
  - [ ] `read` - boolean (default false)
  - [ ] `readAt` - optional number (timestamp)
  - [ ] `createdAt` - number (timestamp)

---

## 🔐 Authentication & User Management

### WorkOS Authentication Integration
- [ ] Install WorkOS: `npm install @workos-inc/node`
- [ ] Set up WorkOS account and create an environment
- [ ] Add WorkOS environment variables (see Environment Configuration section)
- [ ] Create authentication pages:
  - [ ] `/auth/login` - Login page with WorkOS hosted UI or custom
  - [ ] `/auth/signup` - Sign up page
  - [ ] `/auth/callback` - OAuth callback handler
  - [ ] `/auth/logout` - Logout handler
- [ ] Implement WorkOS authentication flow:
  - [ ] Create authorization URL with WorkOS
  - [ ] Handle OAuth callback
  - [ ] Exchange code for user profile
  - [ ] Create session with secure cookies
  - [ ] Verify session on protected routes
- [ ] Set up protected routes middleware for `/app/*` pages
- [ ] Implement session management:
  - [ ] Store session in HTTP-only cookies
  - [ ] Session refresh logic
  - [ ] Session revocation on logout
- [ ] Optional: Enable SSO providers (Google, Microsoft, GitHub)
- [ ] Optional: Set up Directory Sync for organizations
- [ ] Optional: Implement Magic Link authentication

### Convex + WorkOS Integration
- [ ] Create `lib/workos.ts` helper with WorkOS client
- [ ] Create `convex/auth.config.ts` for WorkOS authentication
- [ ] Implement authentication in Convex:
  - [ ] Create HTTP action to verify WorkOS session
  - [ ] Store WorkOS user ID in Convex users table
  - [ ] Pass authentication context to Convex queries/mutations
- [ ] Create webhook endpoint to handle WorkOS events:
  - [ ] `user.created` → Create user in Convex
  - [ ] `user.updated` → Update user in Convex
  - [ ] `user.deleted` → Handle user deletion
  - [ ] `dsync.activated` → Handle directory sync (enterprise)
  - [ ] `dsync.deleted` → Handle user deprovisioning
- [ ] Create `convex/users.ts` with user CRUD operations:
  - [ ] `createUser` mutation
  - [ ] `updateUser` mutation
  - [ ] `getUser` query
  - [ ] `getCurrentUser` query (using WorkOS auth)
  - [ ] `getUserByEmail` query
  - [ ] `deleteUser` mutation
  - [ ] `syncWorkOSUser` mutation (from webhooks)

### User Profile Management
- [ ] Create user profile page at `/app/profile`
  - [ ] Display user information from WorkOS profile (name, email)
  - [ ] Edit name and avatar
  - [ ] Show account creation date
  - [ ] Display current plan and credits
  - [ ] Link to billing portal
  - [ ] Show SSO provider if applicable
- [ ] Create settings page at `/app/settings`
  - [ ] Email notification preferences
  - [ ] Default test settings
  - [ ] UI preferences (theme, language)
  - [ ] Account deletion option
- [ ] Implement credit balance display in navbar
  - [ ] Real-time updates from Convex
  - [ ] Warning when credits are low (< 50)
  - [ ] Link to purchase more credits

---

## 💳 Pricing & Billing (Polar)

### Polar Pricing Configuration
- [ ] Create Polar account at https://polar.sh
- [ ] Set up organization in Polar dashboard
- [ ] Define pricing plans (products) in Polar:
  - [ ] **Free Plan**:
    - [ ] 500 starting credits
    - [ ] Max 3 active projects
    - [ ] Max 50 submissions per project
    - [ ] Basic analytics
    - [ ] No AI features
  - [ ] **Starter Plan** ($19/month):
    - [ ] 2,000 credits/month
    - [ ] Unlimited projects
    - [ ] Unlimited submissions
    - [ ] AI question generation (5 credits per question)
    - [ ] AI distractor generation (3 credits per set)
    - [ ] Basic AI grading
    - [ ] Email support
  - [ ] **Pro Plan** ($49/month):
    - [ ] 5,000 credits/month
    - [ ] Everything in Starter
    - [ ] Advanced AI grading with explanations
    - [ ] Custom branding
    - [ ] Priority support
    - [ ] Analytics export
    - [ ] Team collaboration (up to 5 members)
  - [ ] **Enterprise Plan** (Custom pricing):
    - [ ] Custom credit allocation
    - [ ] Everything in Pro
    - [ ] Dedicated account manager
    - [ ] SLA guarantees
    - [ ] White-label option
    - [ ] SSO/SAML support via WorkOS
    - [ ] Directory Sync (SCIM) via WorkOS
    - [ ] Unlimited team members
    - [ ] Advanced audit logs

### Credit System Configuration
- [ ] Define credit add-on products in Polar:
  - [ ] 500 credits - $10
  - [ ] 1,000 credits - $18
  - [ ] 2,500 credits - $40
  - [ ] 5,000 credits - $75
- [ ] Configure credit usage rates:
  - [ ] AI question generation: 5 credits per question
  - [ ] AI distractor generation: 3 credits per option set
  - [ ] AI explanation generation: 2 credits per explanation
  - [ ] AI grading (short answer): 5 credits per answer
  - [ ] AI grading (long answer/essay): 10 credits per answer
  - [ ] AI grading with feedback: +2 credits

### Polar Benefits Configuration
- [ ] Set up product benefits in Polar dashboard:
  - [ ] `ai_generation` - AI question/distractor generation
  - [ ] `ai_grading` - AI-assisted grading
  - [ ] `advanced_analytics` - Detailed analytics and exports
  - [ ] `custom_branding` - Remove Xam branding, add own logo
  - [ ] `team_collaboration` - Multi-user organizations
  - [ ] `priority_support` - Priority email/chat support
  - [ ] `api_access` - API access for integrations

### Convex Functions for Polar Integration
- [ ] Create `convex/billing.ts` with Polar operations:
  - [ ] `createCustomer` mutation - Create Polar customer when user signs up
  - [ ] `getSubscription` query - Get customer's current subscription and benefits
  - [ ] `createCheckoutSession` action - Generate Polar checkout for plan upgrade
  - [ ] `handleSubscriptionChange` mutation - Update user when subscription changes
  - [ ] `deductCredits` mutation - Deduct credits when AI features are used
  - [ ] `addCredits` mutation - Add credits when purchased or granted
  - [ ] `checkFeatureAccess` query - Check if user has access to feature
  - [ ] `getBillingHistory` query - Get payment and credit history
  - [ ] `cancelSubscription` mutation - Cancel user subscription

### Polar Client Library Setup
- [ ] Install Polar SDK: `npm install @polar-sh/sdk`
- [ ] Create Polar client utility in `lib/polar/client.ts`:
  - [ ] Initialize Polar client with access token
  - [ ] Helper functions for checkout, subscriptions, webhooks
  - [ ] Type-safe wrappers for Polar API calls

### Billing Portal Pages
- [ ] Create billing page at `/app/billing`
  - [ ] Display current plan and renewal date
  - [ ] Show credit balance with usage history
  - [ ] Show active subscriptions from Polar
  - [ ] Upgrade/downgrade plan options with Polar checkout
  - [ ] Purchase additional credits
  - [ ] Link to Polar customer portal
- [ ] Create pricing page at `/pricing` (marketing site)
  - [ ] Display all plans in cards
  - [ ] Feature comparison table
  - [ ] FAQ section about billing
  - [ ] Call-to-action buttons linked to Polar checkout
- [ ] Create checkout success page at `/app/billing/success`
  - [ ] Thank you message
  - [ ] Display what was purchased
  - [ ] Confirmation number
  - [ ] Next steps
  - [ ] Link back to dashboard
- [ ] Create checkout cancel page at `/app/billing/cancel`
  - [ ] Explanation message
  - [ ] Option to try again
  - [ ] Support contact information

### Polar Webhook Handling
- [ ] Create webhook endpoint at `/api/webhooks/polar`
  - [ ] Verify Polar webhook signature using webhook secret
  - [ ] Handle `subscription.created` event - Grant access, add credits
  - [ ] Handle `subscription.updated` event - Update tier, adjust credits
  - [ ] Handle `subscription.canceled` event - Revoke access
  - [ ] Handle `order.created` event - Process credit purchases
  - [ ] Handle `checkout.created` event - Track checkout sessions
  - [ ] Handle `checkout.updated` event - Update checkout status
  - [ ] Handle `benefit.granted` event - Grant feature access
  - [ ] Handle `benefit.revoked` event - Revoke feature access
  - [ ] Log all webhook events to `billingTransactions` table
  - [ ] Handle `subscription.payment_succeeded` event
  - [ ] Handle `subscription.payment_failed` event
  - [ ] Handle `credits.added` event
  - [ ] Handle `credits.depleted` event
  - [ ] Update Convex database accordingly
  - [ ] Send notifications to users
  - [ ] Log all webhook events for debugging

---

## 📈 Analytics (Databuddy)

### Databuddy Setup
- [ ] Add Databuddy tracking script to root layout
- [ ] Create `lib/analytics.ts` helper file with tracking functions:
  - [ ] `trackPageView(path: string)` - Track page navigation
  - [ ] `trackEvent(eventName: string, properties?: object)` - Track custom events
  - [ ] `trackProjectCreated(projectType: string)` - Project creation
  - [ ] `trackProjectPublished(projectId: string, projectType: string)` - Publishing
  - [ ] `trackSubmissionReceived(projectId: string)` - New submission
  - [ ] `trackAIFeatureUsed(featureType: string, creditsUsed: number)` - AI usage
  - [ ] `trackUpgrade(planName: string, amount: number)` - Plan upgrades
  - [ ] `trackCreditPurchase(amount: number, credits: number)` - Credit purchases

### Event Tracking Implementation
- [ ] Track landing page events:
  - [ ] Page views
  - [ ] "Get Started" button clicks
  - [ ] "Watch Demo" button clicks
  - [ ] Feature card interactions
- [ ] Track authentication events:
  - [ ] Sign-up started
  - [ ] Sign-up completed
  - [ ] Sign-in completed
  - [ ] Sign-out
- [ ] Track project lifecycle events:
  - [ ] Project created (with type)
  - [ ] Project opened for editing
  - [ ] Question added (with type)
  - [ ] Question deleted
  - [ ] AI generation requested
  - [ ] AI generation completed
  - [ ] Project published
  - [ ] Project archived
  - [ ] Project deleted
  - [ ] Share link copied
  - [ ] QR code generated
- [ ] Track student test-taking events:
  - [ ] Test started
  - [ ] Question answered
  - [ ] Question flagged
  - [ ] Test submitted
  - [ ] Time spent per question
  - [ ] Navigation patterns
- [ ] Track marking events:
  - [ ] Marking page opened
  - [ ] Submission marked
  - [ ] AI grading used
  - [ ] Feedback sent
  - [ ] Grades exported
- [ ] Track billing events:
  - [ ] Pricing page viewed
  - [ ] Plan card clicked
  - [ ] Checkout initiated
  - [ ] Payment completed
  - [ ] Payment failed
  - [ ] Subscription cancelled
  - [ ] Credits purchased

### Custom Analytics Dashboard (Internal)
- [ ] Create admin analytics page at `/app/admin/analytics`
  - [ ] Total users, projects, submissions
  - [ ] Growth charts (daily/weekly/monthly)
  - [ ] Revenue metrics from Autumn
  - [ ] Credit usage patterns
  - [ ] Most popular features
  - [ ] Churn analysis
  - [ ] Error tracking and rates
- [ ] Pull data from both Databuddy API and Convex
- [ ] Create real-time dashboard widgets
- [ ] Export functionality for reports

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
  - [ ] Display user name and email from WorkOS profile
  - [ ] Link to profile page
  - [ ] Link to settings page
  - [ ] Link to billing page
  - [ ] Sign out button (redirects to `/auth/logout`)
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
- [ ] Choose email provider (Resend recommended, or use WorkOS Events)
- [ ] Install SDK: `npm install resend` (if using Resend)
- [ ] Configure API key in environment variables
- [ ] Create `lib/email.ts` helper with email sending functions
- [ ] Optional: Use WorkOS Events API for transactional emails

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
  - [ ] Verify user identity with WorkOS session
  - [ ] Check user ID matches resource owner
  - [ ] Implement role-based access (teacher/student/admin)
  - [ ] Validate WorkOS session tokens in Convex actions
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
- [ ] Test WorkOS authentication flow (login, logout, callback)
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
   
