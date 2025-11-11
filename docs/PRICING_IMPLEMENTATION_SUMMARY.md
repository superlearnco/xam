# Pricing & Billing Implementation Summary

## Overview

Xam uses a **token-based credit system** with **no subscription plans**. Users purchase credits and pay only for what they use.

## Pricing Model

### Core Pricing
- **$1 = 10 credits** (fixed rate)
- **Minimum purchase**: $5 (50 credits)
- **Welcome bonus**: 50 credits ($5 worth) for new users
- **Credits never expire**

### AI Token Pricing
- **Input tokens**: 15 credits per million tokens
- **Output tokens**: 60 credits per million tokens

### Estimated Costs per Operation
Based on average Gemini token usage:
- **Generate Question**: ~0.06 credits (~2000 input, ~500 output tokens)
- **Generate Distractors**: ~0.03 credits (~1000 input, ~300 output tokens)
- **Generate Explanation**: ~0.036 credits (~800 input, ~400 output tokens)
- **Grade Submission**: ~0.0405 credits (~1500 input, ~300 output tokens)
- **Improve Question**: ~0.054 credits (~1200 input, ~600 output tokens)
- **Generate Feedback**: ~0.078 credits (~2000 input, ~800 output tokens)
- **Generate Rubric**: ~0.057 credits (~1000 input, ~700 output tokens)

## Credit Packages

| Package | Credits | Bonus | Total | Price | Per Credit |
|---------|---------|-------|-------|-------|------------|
| Starter | 50 | 0 | 50 | $5 | $0.10 |
| Small | 100 | 0 | 100 | $10 | $0.10 |
| Medium | 250 | 25 (10%) | 275 | $25 | $0.091 |
| Large | 500 | 75 (15%) | 575 | $50 | $0.087 |
| Pro | 1000 | 200 (20%) | 1200 | $100 | $0.083 |
| Business | 2500 | 625 (25%) | 3125 | $250 | $0.080 |

## Implementation Details

### Database Schema Changes
- **Removed**: `subscriptionTier`, `subscriptionStatus`, `polarSubscriptionId`, `benefits`, `stripeCustomerId`
- **Kept**: `credits` (number), `polarCustomerId` (string, optional)
- Users start with 50 credits (welcome bonus)
- All users have access to all features (no tier restrictions)

### Key Files Implemented

#### Configuration
- `lib/polar/config/pricing.ts` - Credit packages, token pricing, calculations
- `lib/polar/credits.ts` - Credit management utilities
- `lib/polar/client.ts` - Polar SDK client wrapper

#### Backend (Convex)
- `convex/billing.ts` - Credit operations, transactions, usage tracking
- `convex/users.ts` - Updated to remove tier logic
- `convex/schema.ts` - Simplified user model

#### API Routes
- `app/api/checkout/route.ts` - Create Polar checkout sessions
- `app/api/webhooks/polar/route.ts` - Handle order.created events

#### UI Components
- `app/app/billing/page.tsx` - Credit management dashboard (needs update)
- `app/pricing/page.tsx` - Public pricing page (needs update)
- `components/credit-balance.tsx` - Credit display component

#### Tests
- `__tests__/billing/credits.test.ts` - Credit utility tests (needs update)
- `__tests__/billing/billing-operations.test.ts` - Billing logic tests (needs update)

### Environment Variables Required

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your_polar_org_id

# Credit Package Price IDs
NEXT_PUBLIC_POLAR_CREDITS_50_PRICE_ID=price_50
NEXT_PUBLIC_POLAR_CREDITS_100_PRICE_ID=price_100
NEXT_PUBLIC_POLAR_CREDITS_250_PRICE_ID=price_250
NEXT_PUBLIC_POLAR_CREDITS_500_PRICE_ID=price_500
NEXT_PUBLIC_POLAR_CREDITS_1000_PRICE_ID=price_1000
NEXT_PUBLIC_POLAR_CREDITS_2500_PRICE_ID=price_2500
```

## Polar Setup Required

### 1. Create Credit Products
Create 6 one-time purchase products in Polar:
- **50 Credits** - $5.00
- **100 Credits** - $10.00
- **250 Credits** - $25.00 (bonus: +25 credits)
- **500 Credits** - $50.00 (bonus: +75 credits)
- **1000 Credits** - $100.00 (bonus: +200 credits)
- **2500 Credits** - $250.00 (bonus: +625 credits)

### 2. Configure Webhook
- **URL**: `https://yourdomain.com/api/webhooks/polar`
- **Events**: `order.created`, `checkout.created`, `checkout.updated`
- **No subscription events needed**

## Usage Flow

### New User Registration
1. User signs up via Clerk
2. Convex creates user with 50 welcome credits
3. User can immediately use AI features

### Purchasing Credits
1. User visits `/app/billing`
2. Clicks "Buy Credits" and selects package
3. Redirected to Polar checkout
4. After payment, webhook adds credits to account
5. Credits available immediately

### Using AI Features
1. Before AI operation, check: `hasSufficientCredits(userId, creditsRequired)`
2. Perform operation with actual token count tracking
3. After operation: `deductCredits(userId, actualCredits, operation, { inputTokens, outputTokens })`
4. Display remaining balance to user

### Credit Tracking
- All credit additions/deductions logged in `billingTransactions`
- Track actual token usage in `aiGenerations` table
- Calculate actual cost: `calculateCreditsForTokens(inputTokens, outputTokens)`

## API Usage Examples

### Check Credits
```typescript
const sufficient = await ctx.runQuery(api.billing.hasSufficientCredits, {
  userId: user._id,
  creditsRequired: 0.06, // Estimated for question generation
});
```

### Deduct Credits
```typescript
await ctx.runMutation(api.billing.deductCredits, {
  userId: user._id,
  credits: actualCredits,
  reason: "AI question generation",
  metadata: {
    operation: "generate_question",
    inputTokens: 2050,
    outputTokens: 480,
    projectId: project._id,
  },
});
```

### Get Credit Balance
```typescript
const balance = await ctx.runQuery(api.billing.getCreditBalance, {
  userId: user._id,
});
// Returns: { personalCredits, organizationCredits, totalCredits, polarCustomerId }
```

## Remaining Tasks

### Must Complete
1. **Update billing page** (`app/app/billing/page.tsx`) - Remove subscription UI
2. **Update pricing page** (`app/pricing/page.tsx`) - Show only credit packages
3. **Update tests** - Fix tests to match new model
4. **AI integration** - Implement actual token tracking in AI operations
5. **Credit warnings** - Show low credit warnings throughout app
6. **Purchase flow** - Test end-to-end credit purchase

### Nice to Have
1. **Usage analytics** - Show credit usage over time
2. **Auto-purchase** - Suggest purchasing when credits low
3. **Bulk discounts** - Custom packages for high-volume users
4. **Referral credits** - Give bonus credits for referrals

## Migration Notes

### Breaking Changes
- All existing subscription tiers removed
- Users need to be migrated to credit system
- `subscriptionTier` field removed from schema

### Migration Script Needed
```typescript
// Migrate existing users
for (const user of users) {
  let creditsToGrant = 50; // Welcome bonus
  
  // Grant credits based on old tier
  if (user.subscriptionTier === "starter") creditsToGrant += 100;
  if (user.subscriptionTier === "pro") creditsToGrant += 300;
  if (user.subscriptionTier === "enterprise") creditsToGrant += 1000;
  
  await ctx.db.patch(user._id, {
    credits: creditsToGrant,
    // Remove old fields
  });
}
```

## Testing Checklist

- [ ] Create Polar test products
- [ ] Test webhook signature verification
- [ ] Test credit purchase flow (all packages)
- [ ] Test credit deduction
- [ ] Test insufficient credits error
- [ ] Test welcome bonus grant
- [ ] Test credit balance display
- [ ] Test low credit warnings
- [ ] Test transaction history
- [ ] Test usage analytics

## Support & Documentation

- **Polar Docs**: https://docs.polar.sh
- **Token Pricing Calculator**: Use `calculateCreditsForTokens(input, output)`
- **Cost Estimator**: Use `estimateQuestionGenerationCost()` functions

## Security Considerations

1. **Webhook verification** - Always verify Polar signatures
2. **Credit validation** - Check credits before AND after operations
3. **Rate limiting** - Prevent credit abuse
4. **Audit logging** - Log all credit transactions
5. **Refund handling** - Process refunds manually via Polar dashboard