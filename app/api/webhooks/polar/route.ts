import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/polar/client";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { getTotalCredits } from "@/lib/polar/config/pricing";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Polar Webhook Handler
 * Handles credit purchases and order events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-polar-signature") || "";
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET!;

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse event
    const event = JSON.parse(body);
    const eventType = event.type;

    console.log(`Received Polar webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case "order.created":
        await handleOrderCreated(event.data);
        break;

      case "checkout.created":
        await handleCheckoutCreated(event.data);
        break;

      case "checkout.updated":
        await handleCheckoutUpdated(event.data);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle order creation (credit purchases)
 */
async function handleOrderCreated(order: any) {
  try {
    const { customer_id, product_id, id: order_id, amount } = order;

    // Find user by Polar customer ID
    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    // Determine credits based on product
    let creditsToAdd = 0;

    // Extract package ID from product_id
    // Expected format: "credits_50", "credits_100", etc.
    if (product_id.includes("5000")) {
      creditsToAdd = getTotalCredits("credits_5000");
    } else if (product_id.includes("2500")) {
      creditsToAdd = getTotalCredits("credits_2500");
    } else if (product_id.includes("1000")) {
      creditsToAdd = getTotalCredits("credits_1000");
    } else if (product_id.includes("500")) {
      creditsToAdd = getTotalCredits("credits_500");
    } else if (product_id.includes("250")) {
      creditsToAdd = getTotalCredits("credits_250");
    } else if (product_id.includes("100")) {
      creditsToAdd = getTotalCredits("credits_100");
    } else if (product_id.includes("50")) {
      creditsToAdd = getTotalCredits("credits_50");
    }

    if (creditsToAdd === 0) {
      console.error(`Unknown product ID: ${product_id}`);
      return;
    }

    // Add credits to user account
    await convex.mutation(api.billing.addCredits, {
      userId: user._id,
      credits: creditsToAdd,
      reason: `Credit purchase: ${product_id}`,
      transactionId: order_id,
      amount: amount / 100, // Convert cents to dollars
    });

    console.log(
      `Order processed: Added ${creditsToAdd} credits to user ${user._id}`,
    );
  } catch (error) {
    console.error("Error handling order.created:", error);
    throw error;
  }
}

/**
 * Handle checkout session creation
 */
async function handleCheckoutCreated(checkout: any) {
  console.log("Checkout created:", checkout.id);
  // Optional: Track checkout sessions in analytics
}

/**
 * Handle checkout session updates
 */
async function handleCheckoutUpdated(checkout: any) {
  console.log("Checkout updated:", checkout.id, checkout.status);

  if (checkout.status === "confirmed") {
    console.log("Checkout confirmed, order will be created automatically");
  } else if (checkout.status === "failed") {
    console.error("Checkout failed:", checkout.id);
  }
}
