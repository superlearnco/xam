import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/polar/client";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Polar Webhook Handler
 * Handles subscription lifecycle events, purchases, and benefit grants/revocations
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
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse event
    const event = JSON.parse(body);
    const eventType = event.type;

    console.log(`Received Polar webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;

      case "subscription.revoked":
        await handleSubscriptionRevoked(event.data);
        break;

      case "order.created":
        await handleOrderCreated(event.data);
        break;

      case "checkout.created":
        await handleCheckoutCreated(event.data);
        break;

      case "checkout.updated":
        await handleCheckoutUpdated(event.data);
        break;

      case "benefit.granted":
        await handleBenefitGranted(event.data);
        break;

      case "benefit.revoked":
        await handleBenefitRevoked(event.data);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
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

/**
 * Handle subscription creation
 * Grant initial credits and activate subscription benefits
 */
async function handleSubscriptionCreated(subscription: any) {
  try {
    const { customer_id, product_id, id: subscription_id, status } = subscription;

    // Find user by Polar customer ID
    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    // Determine credits to grant based on plan
    let creditsToGrant = 0;
    let planName = "";

    if (product_id.includes("starter")) {
      creditsToGrant = 2000;
      planName = "starter";
    } else if (product_id.includes("pro")) {
      creditsToGrant = 5000;
      planName = "pro";
    } else if (product_id.includes("enterprise")) {
      creditsToGrant = 15000;
      planName = "enterprise";
    }

    // Update user subscription in Convex
    await convex.mutation(api.billing.handleSubscriptionChange, {
      userId: user._id,
      subscriptionId: subscription_id,
      polarCustomerId: customer_id,
      status,
      planName,
      creditsToGrant,
    });

    console.log(`Subscription created for user ${user._id}: ${planName}`);
  } catch (error) {
    console.error("Error handling subscription.created:", error);
    throw error;
  }
}

/**
 * Handle subscription updates
 * Update plan, credits, and benefits
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { customer_id, product_id, id: subscription_id, status } = subscription;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    let planName = "";
    let creditsToGrant = 0;

    if (product_id.includes("starter")) {
      planName = "starter";
      creditsToGrant = 2000;
    } else if (product_id.includes("pro")) {
      planName = "pro";
      creditsToGrant = 5000;
    } else if (product_id.includes("enterprise")) {
      planName = "enterprise";
      creditsToGrant = 15000;
    }

    await convex.mutation(api.billing.handleSubscriptionChange, {
      userId: user._id,
      subscriptionId: subscription_id,
      polarCustomerId: customer_id,
      status,
      planName,
      creditsToGrant,
    });

    console.log(`Subscription updated for user ${user._id}: ${planName}`);
  } catch (error) {
    console.error("Error handling subscription.updated:", error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 * Mark subscription as canceled (still active until end of period)
 */
async function handleSubscriptionCanceled(subscription: any) {
  try {
    const { customer_id, id: subscription_id } = subscription;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    await convex.mutation(api.billing.handleSubscriptionChange, {
      userId: user._id,
      subscriptionId: subscription_id,
      polarCustomerId: customer_id,
      status: "canceled",
      planName: "free",
      creditsToGrant: 0,
    });

    console.log(`Subscription canceled for user ${user._id}`);
  } catch (error) {
    console.error("Error handling subscription.canceled:", error);
    throw error;
  }
}

/**
 * Handle subscription revocation
 * Immediately revoke access to subscription benefits
 */
async function handleSubscriptionRevoked(subscription: any) {
  try {
    const { customer_id, id: subscription_id } = subscription;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    await convex.mutation(api.billing.handleSubscriptionChange, {
      userId: user._id,
      subscriptionId: subscription_id,
      polarCustomerId: customer_id,
      status: "revoked",
      planName: "free",
      creditsToGrant: 0,
    });

    console.log(`Subscription revoked for user ${user._id}`);
  } catch (error) {
    console.error("Error handling subscription.revoked:", error);
    throw error;
  }
}

/**
 * Handle order creation (one-time purchases like credit packs)
 */
async function handleOrderCreated(order: any) {
  try {
    const { customer_id, product_id, amount } = order;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    // Determine credits based on product
    let creditsToAdd = 0;

    if (product_id.includes("500")) {
      creditsToAdd = 500;
    } else if (product_id.includes("1000")) {
      creditsToAdd = 1000;
    } else if (product_id.includes("2500")) {
      creditsToAdd = 2500;
    } else if (product_id.includes("5000")) {
      creditsToAdd = 5000;
    }

    // Add credits to user account
    await convex.mutation(api.billing.addCredits, {
      userId: user._id,
      credits: creditsToAdd,
      reason: `Credit purchase: ${product_id}`,
    });

    console.log(`Order processed: Added ${creditsToAdd} credits to user ${user._id}`);
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
  // Optional: Track checkout completion in analytics
}

/**
 * Handle benefit granted to customer
 */
async function handleBenefitGranted(benefit: any) {
  try {
    const { customer_id, benefit_id } = benefit;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    // Update user's benefits in Convex
    await convex.mutation(api.billing.grantBenefit, {
      userId: user._id,
      benefitId: benefit_id,
    });

    console.log(`Benefit ${benefit_id} granted to user ${user._id}`);
  } catch (error) {
    console.error("Error handling benefit.granted:", error);
    throw error;
  }
}

/**
 * Handle benefit revoked from customer
 */
async function handleBenefitRevoked(benefit: any) {
  try {
    const { customer_id, benefit_id } = benefit;

    const user = await convex.query(api.users.getUserByPolarCustomerId, {
      polarCustomerId: customer_id,
    });

    if (!user) {
      console.error(`User not found for customer ${customer_id}`);
      return;
    }

    // Revoke benefit in Convex
    await convex.mutation(api.billing.revokeBenefit, {
      userId: user._id,
      benefitId: benefit_id,
    });

    console.log(`Benefit ${benefit_id} revoked from user ${user._id}`);
  } catch (error) {
    console.error("Error handling benefit.revoked:", error);
    throw error;
  }
}
