# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for Xam after migrating from WorkOS.

## What Changed

We've replaced WorkOS authentication with Clerk, which provides:
- Modern authentication UI components
- Better developer experience
- Easier integration with Convex
- Built-in user management
- Organization support for multi-tenant features

## Setup Steps

### 1. Create a Clerk Account

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application

### 2. Configure Your Application

In the Clerk Dashboard:

1. **Application Settings**
   - Go to your application dashboard
   - Note your application name and ID

2. **Authentication Options**
   - Navigate to "User & Authentication" > "Email, Phone, Username"
   - Enable Email authentication (required)
   - Optional: Enable Google, GitHub, or other OAuth providers
   - Configure password requirements if needed

3. **Redirect URLs**
   - Go to "API Keys" section
   - Add your development URL: `http://localhost:3000`
   - Add your production URL when ready: `https://yourdomain.com`

### 3. Get Your API Keys

In the Clerk Dashboard, go to "API Keys":

1. Copy the **Publishable key** (starts with `pk_`)
2. Copy the **Secret key** (starts with `sk_`)

### 4. Set Up Webhook

For user synchronization with Convex:

1. In Clerk Dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - Development: `http://localhost:3000/api/webhooks/clerk`
   - Production: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - (Optional) `organization.created`, `organization.updated`, `organizationMembership.*`
5. Copy the **Signing Secret** (starts with `whsec_`)

### 5. Configure Environment Variables

Create or update your `.env.local` file with:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Polar Billing
POLAR_ACCESS_TOKEN=your_polar_token
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your_polar_org_id
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret

# Databuddy Analytics
DATABUDDY_SITE_ID=your_databuddy_site_id
NEXT_PUBLIC_DATABUDDY_SITE_ID=your_databuddy_site_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Update Convex Deployment

Run the Convex development server to apply schema changes:

```bash
npx convex dev
```

This will:
- Update the users table schema (replaced `workosUserId` with `clerkUserId`)
- Apply new indexes for Clerk authentication
- Sync the authentication configuration

### 7. Test the Authentication Flow

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/sign-up`
3. Create a test account
4. Verify you're redirected to `/app`
5. Check that your user appears in Convex dashboard

### 8. Verify Webhook Integration

1. Create a user through the sign-up flow
2. Check your Convex dashboard to see if the user was created
3. Check Clerk webhook logs to verify events were sent
4. Update user info in Clerk and verify Convex is updated

## Architecture Overview

### Authentication Flow

1. **Frontend**: Clerk handles all authentication UI and session management
2. **Middleware**: `middleware.ts` protects routes using Clerk's middleware
3. **Convex Integration**: `ConvexProviderWithClerk` automatically passes Clerk session to Convex
4. **User Sync**: Webhooks keep Convex user data in sync with Clerk

### Key Files

- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
- `app/layout.tsx` - ClerkProvider wrapper
- `components/providers/convex-provider.tsx` - Convex + Clerk integration
- `lib/auth/auth-context.tsx` - Auth context using Clerk hooks
- `lib/clerk/utils.ts` - Clerk helper functions
- `middleware.ts` - Route protection with Clerk
- `app/api/webhooks/clerk/route.ts` - Webhook handler
- `convex/auth.config.ts` - Convex auth configuration
- `convex/users.ts` - User CRUD operations
- `convex/schema.ts` - Database schema with clerkUserId

### Schema Changes

The following changes were made to the Convex schema:

```typescript
// Before (WorkOS)
workosUserId: v.string(),
workosOrganizationId: v.optional(v.string()),

// After (Clerk)
clerkUserId: v.string(),
clerkOrganizationId: v.optional(v.string()),
```

Indexes were also updated:
- `by_workosUserId` → `by_clerkUserId`
- `by_workosOrganizationId` → `by_clerkOrganizationId`

## Customization

### Styling Clerk Components

You can customize Clerk's appearance in your sign-in/sign-up pages:

```tsx
<SignIn
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-xl border border-gray-200",
      headerTitle: "text-2xl font-bold",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
    },
  }}
/>
```

### Adding Social Providers

In Clerk Dashboard:
1. Go to "User & Authentication" > "Social Connections"
2. Enable desired providers (Google, GitHub, Microsoft, etc.)
3. Configure OAuth credentials for each provider
4. Users will see these options on sign-in/sign-up pages

### Enabling Organizations

For multi-tenant features:

1. In Clerk Dashboard, go to "Organizations"
2. Enable organization features
3. Update your code to use Clerk's `<OrganizationSwitcher />` component
4. Use `useOrganization()` hook to access organization data

## Troubleshooting

### "Missing publishableKey" Error

Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in your `.env.local` file and starts with `pk_`.

### Users Not Syncing to Convex

1. Check webhook is configured correctly in Clerk Dashboard
2. Verify webhook secret matches in `.env.local`
3. Check webhook logs in Clerk Dashboard for errors
4. Ensure Convex dev server is running

### Authentication Not Working

1. Verify all environment variables are set correctly
2. Check that ClerkProvider wraps your entire app in `app/layout.tsx`
3. Ensure ConvexProviderWithClerk is using the `useAuth` hook from Clerk
4. Check browser console for errors

### Middleware Redirects Not Working

1. Verify `middleware.ts` is at the root of your project
2. Check that routes are correctly configured in `isPublicRoute` matcher
3. Clear browser cache and cookies
4. Test in incognito mode

## Migration from WorkOS

If you have existing WorkOS users, you'll need to:

1. Export user data from your WorkOS-backed Convex database
2. Create matching users in Clerk via their API or dashboard
3. Update user records in Convex to use new `clerkUserId`

Example migration script:

```typescript
// This is pseudocode - adapt to your needs
const oldUsers = await ctx.db.query("users").collect();

for (const user of oldUsers) {
  // Create user in Clerk via API
  const clerkUser = await clerkClient.users.createUser({
    emailAddress: [user.email],
    firstName: user.name.split(" ")[0],
    lastName: user.name.split(" ")[1],
  });

  // Update Convex record
  await ctx.db.patch(user._id, {
    clerkUserId: clerkUser.id,
  });
}
```

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk Webhooks](https://clerk.com/docs/webhooks/overview)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)

## Support

- Clerk Support: https://clerk.com/support
- Clerk Discord: https://clerk.com/discord
- Convex Discord: https://convex.dev/community

---

**Note**: The free tier of Clerk includes:
- Up to 10,000 monthly active users
- All authentication methods
- Standard support
- Community features

For production use with more users, consider upgrading to a paid plan.