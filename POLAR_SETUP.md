# Polar Dashboard Setup Instructions

This guide will help you set up credit-based pricing in your Polar dashboard.

## Step 1: Create Credit Products

1. **Navigate to Products**

   - Log into your Polar dashboard
   - Go to **Products** in the sidebar

2. **Create a New Product**

   - Click **"New Product"** or **"Create Product"**
   - Fill in the product details:
     - **Name**: "Credits" or "Credit Pack" (or any name you prefer)
     - **Description**: "Purchase credits for usage-based features. $1 = 10 Credits"
     - **Product Type**: Select **"One-time"** (NOT recurring)
     - **Archived**: Leave unchecked

3. **Add Prices**

   - After creating the product, you'll need to add prices
   - Click **"Add Price"** or **"New Price"**
   - For each price tier, set:
     - **Price Amount**: The dollar amount (e.g., 1000 = $10.00, 5000 = $50.00)
     - **Currency**: USD (or your preferred currency)
     - **Type**: One-time (NOT recurring)
     - **Billing Period**: N/A (for one-time products)

   **Recommended Credit Packages:**

   - $1.00 = 10 Credits
   - $5.00 = 50 Credits
   - $10.00 = 100 Credits
   - $25.00 = 250 Credits
   - $50.00 = 500 Credits
   - $100.00 = 1,000 Credits

4. **Save the Product**
   - Make sure the product is **NOT archived**
   - The product should appear in your product list

## Step 2: Verify Webhook Configuration

1. **Go to Settings → Webhooks**

   - In your Polar dashboard, navigate to **Settings** → **Webhooks**

2. **Check/Add Webhook Endpoint**

   - Your webhook URL should be: `https://yourdomain.com/webhook/polar`
   - Or for local testing: `http://localhost:5173/webhook/polar` (using a tool like ngrok)
   - Make sure these events are enabled:
     - ✅ `order.created` (CRITICAL for credit purchases)
     - ✅ `subscription.created`
     - ✅ `subscription.updated`
     - ✅ `subscription.canceled`
     - ✅ `subscription.revoked`
     - ✅ `subscription.uncanceled`

3. **Copy Webhook Secret**
   - Copy the webhook secret
   - Add it to your `.env.local` file as `POLAR_WEBHOOK_SECRET`

## Step 3: Test Your Setup

1. **Test Credit Purchase**

   - Go to your app's dashboard
   - Click on "Purchase Credits"
   - Select a credit package
   - Complete the checkout flow
   - After payment, check:
     - Your app's database (user should have credits added)
     - Polar dashboard → Orders (order should appear)
     - Polar dashboard → Webhooks (webhook event should be received)

2. **Verify Credits Added**

   - In your app, check the dashboard
   - The user's credit balance should increase by the purchased amount
   - Formula: `(amount_paid_in_dollars) × 10 = credits_added`

3. **Check Webhook Events**
   - In Polar dashboard → Settings → Webhooks
   - View recent webhook deliveries
   - Verify `order.created` events are being received and processed

## Step 4: Environment Variables

Make sure these are set in your `.env.local`:

```bash
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_ORGANIZATION_ID=your_organization_id
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER=sandbox  # or "production" for live
```

## Important Notes

1. **Product Type**: Credit products MUST be **one-time** (non-recurring). Recurring products are for subscriptions, not credits.

2. **Price Calculation**: The system automatically calculates credits as:

   - `$1.00 = 10 Credits`
   - So a $10 purchase = 100 credits
   - The calculation happens in the webhook handler

3. **Metadata**: The checkout flow automatically includes `userId` in metadata, which is used to credit the correct user account.

4. **Customer Matching**: If metadata is missing, the system will try to match by customer email as a fallback.

5. **Sandbox vs Production**:
   - Use `sandbox` for testing
   - Switch to `production` when ready to go live
   - Make sure to create products in both environments if needed

## Troubleshooting

**Credits not being added after purchase?**

- Check webhook delivery status in Polar dashboard
- Verify `order.created` event is enabled
- Check server logs for webhook processing errors
- Ensure `POLAR_WEBHOOK_SECRET` matches your dashboard

**Products not showing in app?**

- Verify products are NOT archived
- Check that products are one-time (not recurring)
- Ensure `POLAR_ORGANIZATION_ID` is correct
- Check server logs for API errors

**Webhook not receiving events?**

- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Ensure events are enabled in webhook settings
- Use a tool like ngrok for local testing

## How Credit-Based Billing Works

### Credit-Based Billing

- Users purchase credits upfront ($1 = 10 credits)
- Credits are deducted when features are used
- Users must have enough credits to use features
- Use: `useCredits({ amount: 10, description: "API call" })`

### Example Usage in Your Code

```typescript
import { useAction } from "convex/react";
import { api } from "~/convex/_generated/api";

const useCredits = useAction(api.credits.useCredits);

// When user performs an action that costs credits:
await useCredits({
  amount: 10, // Cost in credits
  description: "API call made",
});
```

## Next Steps

Once set up:

1. Users can purchase credits
2. Credits are automatically added when payment completes
3. Use the `useCredits` action in your code to deduct credits
4. Track usage and transactions in your database
