# Polar Integration Guide

**Billing Provider:** Polar.sh (Merchant of Record)  
**Status:** Ready to Implement  
**Documentation:** https://docs.polar.sh

---

## Why Polar?

Polar is a merchant of record platform specifically built for SaaS and digital products. Unlike traditional payment processors, Polar handles:

- ✅ Tax calculation and collection globally
- ✅ Invoicing and receipts
- ✅ Compliance (VAT, sales tax, etc.)
- ✅ Subscription management
- ✅ Usage-based billing
- ✅ Credit/one-time purchases
- ✅ Webhooks for all events

**No Stripe complexity, no tax headaches, just simple billing.**

---

## Environment Variables

Add these to your `.env.local`:

```env
# Polar Billing Configuration
POLAR_ACCESS_TOKEN=polar_at_xxx...
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your-org-id
POLAR_WEBHOOK_SECRET=whsec_xxx...
```

### Getting Your Credentials

1. **Sign up:** https://polar.sh
2. **Create Organization:** Dashboard → New Organization
3. **Get Access Token:** Settings → API Tokens → Create Token
4. **Get Organization ID:** Organization Settings → copy ID
5. **Get Webhook Secret:** Webhooks → Create Endpoint → copy secret

---

## Installation

```bash
npm install @polar-sh/sdk
```

---

## Pricing Structure

### Plans

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| **Free** | $0 | 500 | 3 projects, 50 submissions, no AI |
| **Starter** | $19/mo | 2,000 | Unlimited projects, basic AI |
| **Pro** | $49/mo | 5,000 | Advanced AI, branding, teams |
| **Enterprise** | Custom | Custom | White-label, SSO, unlimited |

### Credit Add-ons (One-time Purchase)

- 500 credits: $10
- 1,000 credits: $18
- 2,500 credits: $40
- 5,000 credits: $75

### Credit Usage Rates

- AI question generation: 5 credits
- AI distractor generation: 3 credits
- AI explanation: 2 credits
- AI grading (short answer): 5 credits
- AI grading (essay): 10 credits
- AI grading with feedback: +2 credits

---

## Implementation Steps

### 1. Create Polar Client (`lib/polar/client.ts`)

```typescript
import { Polar } from "@polar-sh/sdk";

// Initialize Polar client
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

// Organization ID
export const POLAR_ORG_ID = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID!;

// Helper: Create checkout session
export async function createCheckoutSession(params: {
  productId: string;
  successUrl: string;
  customerId?: string;
}) {
  const checkout = await polar.checkouts.create({
    productId: params.productId,
    successUrl: params.successUrl,
    customerId: params.customerId,
  });

  return checkout;
}

// Helper: Get customer subscriptions
export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await polar.subscriptions.list({
    customerId,
    organizationId: POLAR_ORG_ID,
  });

  return subscriptions;
}

// Helper: Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await polar.subscriptions.cancel(subscriptionId);
  return subscription;
}

// Helper: Get product by ID
export async function getProduct(productId: string) {
  const product = await polar.products.get(productId);
  return product;
}

// Helper: List all products
export async function listProducts() {
  const products = await polar.products.list({
    organizationId: POLAR_ORG_ID,
  });

  return products;
}
```

### 2. Create Convex Billing Functions (`convex/billing.ts`)

```typescript
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getCurrentUserOrThrow } from "./lib/utils";
import { internal } from "./_generated/api";

// Query: Get user's subscription status
export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      credits: user.credits,
      polarCustomerId: user.stripeCustomerId, // Rename this field later
    };
  },
});

// Action: Create checkout session
export const createCheckout = action({
  args: {
    productId: v.string(),
    successUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Call Polar API (implement in lib/polar/client.ts)
    const checkout = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: args.productId,
        success_url: args.successUrl,
        customer_email: user.email,
      }),
    });

    const data = await checkout.json();
    return data.url; // Redirect URL
  },
});

// Mutation: Handle subscription webhook
export const handleSubscriptionCreated = mutation({
  args: {
    customerId: v.string(),
    subscriptionId: v.string(),
    productId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.customerId)
      )
      .first();

    if (!user) {
      throw new Error("User not found for customer ID");
    }

    // Determine tier from product ID
    const tierMap: Record<string, "free" | "basic" | "pro" | "enterprise"> = {
      starter: "basic",
      pro: "pro",
      enterprise: "enterprise",
    };

    const tier = tierMap[args.productId] || "free";

    // Update user subscription
    await ctx.db.patch(user._id, {
      subscriptionTier: tier,
      subscriptionStatus: args.status,
      updatedAt: Date.now(),
    });

    // Log transaction
    await ctx.db.insert("billingTransactions", {
      userId: user._id,
      type: "subscription",
      amount: 0, // Set from webhook data
      currency: "usd",
      status: "succeeded",
      description: `Subscription created: ${tier}`,
      createdAt: Date.now(),
    });
  },
});
```

### 3. Create Webhook Endpoint (`app/api/webhooks/polar/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("polar-signature");
    const body = await request.text();

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case "subscription.created":
        await convex.mutation(api.billing.handleSubscriptionCreated, {
          customerId: event.data.customer_id,
          subscriptionId: event.data.id,
          productId: event.data.product_id,
          status: event.data.status,
        });
        break;

      case "subscription.updated":
        // Handle subscription update
        break;

      case "subscription.canceled":
        // Handle cancellation
        break;

      case "order.created":
        // Handle credit purchase
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const crypto = require("crypto");
  const secret = process.env.POLAR_WEBHOOK_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 4. Create Billing UI (`app/app/billing/page.tsx`)

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  const subscription = useQuery(api.billing.getSubscription);
  const createCheckout = useMutation(api.billing.createCheckout);

  const handleUpgrade = async (productId: string) => {
    const checkoutUrl = await createCheckout({
      productId,
      successUrl: `${window.location.origin}/app/billing/success`,
    });

    window.location.href = checkoutUrl;
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <p className="text-2xl font-bold capitalize">{subscription?.tier}</p>
        <p className="text-muted-foreground">{subscription?.status}</p>
        <p className="mt-4">
          <span className="font-semibold">Credits:</span> {subscription?.credits}
        </p>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-2">Starter</h3>
          <p className="text-3xl font-bold mb-4">$19<span className="text-sm">/mo</span></p>
          <ul className="space-y-2 mb-6">
            <li>✓ 2,000 credits/month</li>
            <li>✓ Unlimited projects</li>
            <li>✓ Basic AI features</li>
          </ul>
          <Button onClick={() => handleUpgrade("starter")} className="w-full">
            Upgrade to Starter
          </Button>
        </Card>

        <Card className="p-6 border-primary">
          <h3 className="text-xl font-bold mb-2">Pro</h3>
          <p className="text-3xl font-bold mb-4">$49<span className="text-sm">/mo</span></p>
          <ul className="space-y-2 mb-6">
            <li>✓ 5,000 credits/month</li>
            <li>✓ Advanced AI grading</li>
            <li>✓ Custom branding</li>
            <li>✓ Team collaboration</li>
          </ul>
          <Button onClick={() => handleUpgrade("pro")} className="w-full">
            Upgrade to Pro
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-2">Enterprise</h3>
          <p className="text-3xl font-bold mb-4">Custom</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Custom credits</li>
            <li>✓ White-label</li>
            <li>✓ SSO/SAML</li>
            <li>✓ Dedicated support</li>
          </ul>
          <Button variant="outline" className="w-full">
            Contact Sales
          </Button>
        </Card>
      </div>
    </div>
  );
}
```

---

## Polar Dashboard Setup

### 1. Create Products

In Polar dashboard, create 4 products:

**Starter Plan**
- Type: Subscription
- Price: $19/month
- Benefits: Add custom benefits (ai_generation, unlimited_projects, etc.)

**Pro Plan**
- Type: Subscription
- Price: $49/month
- Benefits: All Starter + advanced_ai, custom_branding, team_collaboration

**Enterprise Plan**
- Type: Subscription
- Price: Custom
- Benefits: All Pro + white_label, sso, api_access

**Credit Packs**
- Type: One-time
- Create multiple variants (500, 1000, 2500, 5000 credits)

### 2. Configure Benefits

Create custom benefits in Polar:
- `ai_generation` - AI question generation
- `ai_grading` - AI-powered grading
- `advanced_analytics` - Analytics exports
- `custom_branding` - Custom branding
- `team_collaboration` - Multi-user teams
- `priority_support` - Priority support
- `api_access` - API access

### 3. Set Up Webhooks

1. Go to Webhooks in Polar dashboard
2. Create endpoint: `https://yourdomain.com/api/webhooks/polar`
3. Select events to listen for:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `order.created`
   - `checkout.updated`
   - `benefit.granted`
   - `benefit.revoked`
4. Copy webhook secret to `.env.local`

---

## Testing

### Test Mode

Polar has a test mode for development:
- Use test API tokens
- Create test products
- Use test credit cards
- No real charges

### Test Cards

Use these test cards in Polar:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

---

## Next Steps

1. ✅ Environment variables configured
2. [ ] Install `@polar-sh/sdk`
3. [ ] Create Polar client utility
4. [ ] Create Convex billing functions
5. [ ] Create webhook endpoint
6. [ ] Create billing UI pages
7. [ ] Set up products in Polar dashboard
8. [ ] Configure benefits
9. [ ] Test checkout flow
10. [ ] Test webhooks
11. [ ] Deploy and update webhook URL

---

## Resources

- **Polar Docs:** https://docs.polar.sh
- **API Reference:** https://api.polar.sh/docs
- **Webhooks:** https://docs.polar.sh/webhooks
- **SDK:** https://github.com/polarsource/polar-js

---

**Status:** Environment configured, ready to implement! 🚀