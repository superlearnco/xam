# Xam - Quick Start Guide

Welcome to Xam! This guide will get you up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Accounts for external services (see setup below)

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

### Required for Development

#### Convex (Database)
1. Run `npx convex dev` in a terminal
2. Follow the prompts to create a project
3. Copy the deployment URL shown
4. Add to `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

#### WorkOS (Authentication)
1. Sign up at https://workos.com
2. Create a new application
3. Set redirect URI: `http://localhost:3000/api/auth/callback`
4. Copy your API key and Client ID
5. Add to `.env.local`:
```
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

#### Google Gemini AI
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Add to `.env.local`:
```
GEMINI_API_KEY=...
```

### Optional Services

#### Polar (Billing & Subscriptions)
1. Sign up at https://polar.sh
2. Create an organization
3. Get access token from Settings > API tokens
4. Get organization ID from organization settings
5. Create webhook endpoint and get secret
6. Add to `.env.local`:
```
POLAR_ACCESS_TOKEN=polar_...
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=...
POLAR_WEBHOOK_SECRET=...
```

#### Databuddy (Analytics)
```
NEXT_PUBLIC_DATABUDDY_SITE_ID=...
```

## 3. Start Development Servers

You need TWO terminal windows:

### Terminal 1: Convex Backend
```bash
npx convex dev
```
Keep this running! It manages your database and backend functions.

### Terminal 2: Next.js Frontend
```bash
pnpm dev
```

## 4. Open the App

Navigate to http://localhost:3000

## 5. Test Authentication

1. Go to http://localhost:3000/login
2. Click "Sign in with WorkOS"
3. Complete the authentication flow
4. You should be redirected to http://localhost:3000/app

## What's Already Built

✅ **Database Schema** - 12 tables ready to use (users, projects, questions, submissions, etc.)
✅ **Authentication** - Complete WorkOS OAuth flow with protected routes
✅ **AI Integration** - Google Gemini for question generation and grading
✅ **Analytics** - Event tracking system ready for Databuddy
✅ **User Management** - Credit system, subscription tiers, profiles
✅ **Middleware** - Automatic route protection
✅ **Type Safety** - Full TypeScript with Convex code generation

## Project Structure

```
xam/
├── app/                    # Next.js pages and routes
│   ├── api/auth/          # Authentication endpoints
│   ├── login/             # Login page
│   └── app/               # Protected dashboard
├── components/            # React components
│   ├── providers/         # Context providers
│   └── ui/                # UI components (shadcn/ui)
├── convex/                # Backend (database + functions)
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User operations
│   └── lib/utils.ts       # Utility functions
├── lib/                   # Utilities
│   ├── auth/              # Auth context
│   ├── workos/            # WorkOS client
│   ├── ai/                # Gemini AI
│   └── analytics/         # Event tracking
└── middleware.ts          # Route protection
```

## Using Convex

### Query data (client-side):
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const user = useQuery(api.users.getCurrentUserQuery);
  return <div>{user?.email}</div>;
}
```

### Mutate data (client-side):
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const updateProfile = useMutation(api.users.updateProfile);
  
  const handleUpdate = () => {
    updateProfile({ name: "John Doe" });
  };
}
```

## Using Authentication

### Check auth state:
```typescript
import { useAuth } from "@/lib/auth/auth-context";

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Using AI Features

### Generate questions:
```typescript
import { generateQuestions } from "@/lib/ai/gemini";

const questions = await generateQuestions({
  topic: "World War II",
  subject: "History",
  difficulty: "medium",
  questionType: "multiple_choice",
  count: 5
});
```

### Grade an answer:
```typescript
import { gradeOpenEndedAnswer } from "@/lib/ai/gemini";

const grading = await gradeOpenEndedAnswer({
  questionText: "Explain photosynthesis",
  expectedAnswer: "Process where plants convert light to energy...",
  studentAnswer: "Plants use sunlight to make food...",
  maxPoints: 10
});
```

## Track Analytics

```typescript
import { projectAnalytics, testAnalytics } from "@/lib/analytics/track";

// Track project creation
projectAnalytics.created(projectId, "test");

// Track test submission
testAnalytics.submitted(submissionId, projectId, timeSpent, score);
```

## Using Polar for Billing

```typescript
// Example: Create checkout session (to be implemented)
import { createCheckout } from "@/lib/polar/client"; // You'll create this

const checkout = await createCheckout({
  productId: "your_product_id",
  successUrl: "/app/billing/success",
  cancelUrl: "/app/billing",
});
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Start Convex (keep running)
npx convex dev

# Start Next.js (keep running)
pnpm dev

# Build for production
pnpm build

# Push Convex schema changes
npx convex dev --once
```

## Troubleshooting

### "Cannot connect to Convex"
- Make sure `npx convex dev` is running
- Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Restart both dev servers

### "Authentication failed"
- Verify WorkOS credentials in `.env.local`
- Check redirect URI matches in WorkOS dashboard
- Clear browser cookies and try again

### "Module not found" errors
- Run `pnpm install` again
- Delete `.next` folder and restart: `rm -rf .next && pnpm dev`

### Type errors in Convex files
- Run `npx convex dev --once` to regenerate types
- Restart your editor/IDE

## Next Steps

Now that everything is set up, you can:

1. **Create your first project** - Visit `/app` and click "Create New"
2. **Build the project editor** - Implement question creation UI
3. **Add AI generation UI** - Connect AI functions to UI components
4. **Implement grading** - Build submission viewing and grading interface
5. **Set up billing with Polar** - Integrate subscription management

## Documentation

- Full Setup Guide: `SETUP.md`
- Completion Summary: `docs/FOUNDATION_SETUP_COMPLETE.md`
- TODO List: `TODO.md`
- Environment Variables: `.env.example`

## Need Help?

- Convex Docs: https://docs.convex.dev
- WorkOS Docs: https://workos.com/docs
- Polar Docs: https://docs.polar.sh
- Next.js Docs: https://nextjs.org/docs
- Shadcn/ui: https://ui.shadcn.com

## Status

✅ Foundation & Setup: **COMPLETE**
⏳ Core Features: **Ready to implement**
⏳ Billing (Polar): **Ready to implement**
⏳ Advanced Features: **Ready to implement**

---

**You're all set! Happy coding! 🚀**