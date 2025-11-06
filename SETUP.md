# Xam Setup Guide

This guide covers the initial setup and configuration of the Xam application.

## Prerequisites

- Node.js 18+ and pnpm installed
- Accounts created for:
  - Convex (https://www.convex.dev)
  - WorkOS (https://workos.com)
  - Google AI Studio (https://makersuite.google.com/app/apikey)
  - Polar (https://polar.sh) - for billing and subscriptions
  - Databuddy (https://databuddy.com) - optional

## Foundation & Setup Completed

### 1. Convex Backend

**Status:** ✅ Complete

The Convex backend has been initialized with:
- Full database schema defined in `convex/schema.ts`
- Tables for users, projects, questions, submissions, answers, organizations, AI history, analytics, notifications, and billing
- Utility functions in `convex/lib/utils.ts` for common operations
- ConvexProvider integrated in root layout

**Next Steps:**
1. Run `npx convex dev` to start the development server
2. The Convex dashboard will provide your deployment URL
3. Add `NEXT_PUBLIC_CONVEX_URL` to your `.env.local` file

### 2. Environment Variables

**Status:** ✅ Template created

A `.env.example` file has been created with all required environment variables.

**Action Required:** Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Then populate the following keys:

#### Convex Configuration
- `NEXT_PUBLIC_CONVEX_URL` - Get from Convex dashboard after running `npx convex dev`
- `CONVEX_DEPLOYMENT` - Optional, for production deployments

#### WorkOS Authentication
1. Create a WorkOS account at https://workos.com
2. Create a new application in the WorkOS dashboard
3. Configure redirect URI: `http://localhost:3000/api/auth/callback` (for development)
4. Get your API key and Client ID from the WorkOS dashboard
5. Add to `.env.local`:
   - `WORKOS_API_KEY`
   - `WORKOS_CLIENT_ID`
   - `NEXT_PUBLIC_WORKOS_CLIENT_ID`
   - `WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback`

#### Google Gemini AI
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env.local`:
   - `GEMINI_API_KEY`

#### Polar Billing (Merchant of Record)
1. Create a Polar account at https://polar.sh
2. Create an organization in the Polar dashboard
3. Get your access token from Settings > API tokens
4. Get your organization ID from your organization settings
5. Create a webhook endpoint and get the webhook secret
6. Add to `.env.local`:
   - `POLAR_ACCESS_TOKEN` - Server-side API access token
   - `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` - Your organization ID
   - `POLAR_WEBHOOK_SECRET` - For webhook verification

**Why Polar?**
- Merchant of record (handles tax, compliance, invoicing)
- Built for SaaS and digital products
- Supports subscriptions and usage-based billing
- Developer-friendly API
- No complex setup like Stripe

#### Databuddy Analytics (Optional)
1. Create a Databuddy account
2. Verify your domain
3. Get your Site ID
4. Add to `.env.local`:
   - `NEXT_PUBLIC_DATABUDDY_SITE_ID`

### 3. WorkOS Authentication

**Status:** ✅ Client utilities created

WorkOS client utilities are available in `lib/workos/client.ts`:
- `getAuthorizationUrl()` - Get OAuth authorization URL
- `authenticateWithCode()` - Exchange code for tokens
- `getUserFromAccessToken()` - Get user info
- `refreshAccessToken()` - Refresh expired tokens
- `signOutUser()` - Sign out user

**Authentication API routes:**
- `/api/auth/login` - Initiate OAuth flow
- `/api/auth/callback` - OAuth callback handler
- `/api/auth/logout` - Sign out endpoint
- `/api/auth/me` - Current user endpoint

**Client-side auth:**
- `useAuth()` hook available from `@/lib/auth/auth-context`
- Auth context provides: `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`

### 4. Google Gemini AI Integration

**Status:** ✅ Complete

AI utilities are available in `lib/ai/gemini.ts`:
- `generateQuestions()` - Generate questions from topics
- `generateDistractors()` - Generate wrong answer options
- `generateExplanation()` - Generate explanations for correct answers
- `gradeOpenEndedAnswer()` - AI-powered grading for essays/short answers
- `suggestQuestionImprovements()` - Get improvement suggestions
- `calculateCreditsForOperation()` - Calculate credit costs

**Usage Example:**
```typescript
import { generateQuestions } from '@/lib/ai/gemini';

const questions = await generateQuestions({
  topic: "World War II",
  subject: "History",
  difficulty: "medium",
  questionType: "multiple_choice",
  count: 5
});
```

### 5. Analytics Integration

**Status:** ✅ Utilities created

Analytics tracking utilities are available in `lib/analytics/track.ts`:
- Event tracking functions for all major user actions
- Databuddy integration support
- Development mode logging

**Usage Example:**
```typescript
import { projectAnalytics } from '@/lib/analytics/track';

// Track project creation
projectAnalytics.created(projectId, "test");

// Track test submission
testAnalytics.submitted(submissionId, projectId, timeSpent, score);
```

**Next Steps:**
- Initialize Databuddy in your app by calling `initializeDatabuddy()` in a client component
- Add tracking calls throughout the application

## Database Schema Overview

### Core Tables

1. **users** - User accounts and profiles
   - Authentication via WorkOS
   - Credit balance tracking
   - Subscription tier management

2. **organizations** - Multi-teacher accounts (Pro/Enterprise)
   - Shared credit pools
   - Team collaboration
   - Custom branding settings

3. **projects** - Tests, essays, and surveys
   - Draft/published/archived status
   - Access codes for students
   - Rich configuration options

4. **questions** - Individual test questions
   - Multiple question types (multiple choice, true/false, short answer, essay, fill in blank)
   - AI generation support
   - Reusable from question bank

5. **submissions** - Student test attempts
   - Progress tracking
   - Auto and manual grading support
   - Multiple attempts support

6. **answers** - Individual question responses
   - AI grading for open-ended questions
   - Feedback and scoring

7. **questionBank** - Reusable question library
   - Personal and organization questions
   - Public community sharing
   - Tagging and categorization

8. **templates** - Full test templates
   - Featured templates
   - Community sharing

9. **aiGenerationHistory** - AI usage tracking
   - Credit usage tracking
   - Prompt and response logging

10. **analyticsEvents** - User activity tracking
    - Integration with Databuddy
    - Custom event tracking

11. **notifications** - In-app notifications
    - Real-time updates
    - Read/unread tracking

12. **billingTransactions** - Payment history
    - Polar integration
    - Credit purchases
    - Subscription payments

## Next Steps

After completing the foundation setup:

1. **Implement Billing Integration** (see TODO.md - Pricing & Billing)
   - Set up Polar products and pricing
   - Create checkout flow using Polar SDK
   - Implement webhook handlers for subscription events
   - Build billing portal

2. **Build Core Features** (see TODO.md - UI Components & Pages)
   - Dashboard
   - Project editor
   - Test taking experience
   - Marking/grading interface

3. **Implement AI Features** (see TODO.md - AI Features)
   - Create Convex actions for AI operations
   - Build UI for AI generation
   - Implement credit deduction

## Development Workflow

1. Start Convex development server:
   ```bash
   npx convex dev
   ```

2. Start Next.js development server (in another terminal):
   ```bash
   pnpm dev
   ```

3. Access the application at http://localhost:3000

4. Access the Convex dashboard for database management

## Troubleshooting

### Convex Connection Issues
- Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly in `.env.local`
- Check that `npx convex dev` is running
- Verify the ConvexProvider is wrapping your app in `app/layout.tsx`

### WorkOS Authentication Issues
- Verify all WorkOS environment variables are set
- Check that redirect URI matches in both WorkOS dashboard and `.env.local`
- Ensure WorkOS application is properly configured

### AI Generation Issues
- Verify `GEMINI_API_KEY` is valid
- Check Google AI Studio quotas and limits
- Review error logs for API response issues

### Polar Billing Issues
- Verify `POLAR_ACCESS_TOKEN` is valid and has correct permissions
- Check `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` matches your organization
- Ensure webhook secret is correctly configured for production

## Security Notes

- Never commit `.env.local` to version control
- Keep API keys secure and rotate them regularly
- Use environment-specific keys for development/staging/production
- Implement rate limiting for AI endpoints
- Validate all user inputs on the server side

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [WorkOS Documentation](https://workos.com/docs)
- [Google AI Studio](https://makersuite.google.com)
- [Polar Documentation](https://docs.polar.sh)
- [Next.js Documentation](https://nextjs.org/docs)