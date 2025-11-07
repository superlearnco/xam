import { Polar } from "@polar-sh/sdk";

/**
 * Polar SDK Client
 * Handles billing, subscriptions, and checkout with Polar.sh (Merchant of Record)
 *
 * TODO: Refine SDK integration based on actual Polar SDK API
 * The Polar SDK may require adjustments based on their latest API
 */

// Initialize Polar client with access token
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

// Organization ID from environment
export const POLAR_ORGANIZATION_ID =
  process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID!;

/**
 * Create a checkout session for a product/plan
 */
export async function createCheckoutSession({
  productPriceId,
  customerId,
  successUrl,
  customerEmail,
}: {
  productPriceId: string;
  customerId?: string;
  successUrl: string;
  customerEmail?: string;
}) {
  try {
    // TODO: Update based on actual Polar SDK checkout API
    const checkout = await polar.checkouts.create({
      product_price_id: productPriceId,
      customer_id: customerId,
      success_url: successUrl,
      customer_email: customerEmail,
    } as any);

    return {
      success: true,
      checkoutUrl: (checkout as any).url,
      checkoutId: (checkout as any).id,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  try {
    // TODO: Update based on actual Polar SDK customer API
    const response = await polar.customers.list({
      organization_id: POLAR_ORGANIZATION_ID,
      email,
    } as any);

    return (response as any)?.[0] || null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

/**
 * Create a new Polar customer
 */
export async function createCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await polar.customers.create({
      organization_id: POLAR_ORGANIZATION_ID,
      email,
      name,
      metadata,
    } as any);

    return {
      success: true,
      customer,
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
  try {
    // TODO: Update based on actual Polar SDK subscription API
    const response = await polar.subscriptions.list({
      organization_id: POLAR_ORGANIZATION_ID,
      customer_id: customerId,
      active: true,
    } as any);

    return (response as any) || [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

/**
 * Get a specific subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await polar.subscriptions.get({
      id: subscriptionId,
    } as any);

    return subscription;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    // TODO: Update based on actual Polar SDK cancel API
    const subscription = await polar.subscriptions.update({
      id: subscriptionId,
      cancel_at_period_end: true,
    } as any);

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    };
  }
}

/**
 * Get all products for the organization
 */
export async function getProducts() {
  try {
    const response = await polar.products.list({
      organization_id: POLAR_ORGANIZATION_ID,
    } as any);

    return (response as any) || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Get benefits granted to a customer
 */
export async function getCustomerBenefits(customerId: string) {
  try {
    const response = await polar.benefits.list({
      organization_id: POLAR_ORGANIZATION_ID,
    } as any);

    // TODO: Filter benefits for this customer by checking grants
    return (response as any) || [];
  } catch (error) {
    console.error("Error fetching benefits:", error);
    return [];
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  // Polar uses standard webhook signature verification
  // The exact implementation depends on Polar's webhook signing method
  // Typically this would use HMAC-SHA256

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

/**
 * Get customer portal URL for managing subscriptions
 */
export async function getCustomerPortalUrl(
  customerId: string,
): Promise<string | null> {
  try {
    // Polar provides a customer portal for managing subscriptions
    // The exact URL format may vary based on Polar's implementation
    return `https://polar.sh/customer/${customerId}`;
  } catch (error) {
    console.error("Error getting customer portal URL:", error);
    return null;
  }
}

/**
 * Credit purchase product IDs (to be configured in Polar dashboard)
 */
export const CREDIT_PRODUCTS = {
  CREDITS_500: "500_credits",
  CREDITS_1000: "1000_credits",
  CREDITS_2500: "2500_credits",
  CREDITS_5000: "5000_credits",
} as const;

/**
 * Subscription plan product IDs (to be configured in Polar dashboard)
 */
export const SUBSCRIPTION_PLANS = {
  FREE: "free_plan",
  STARTER: "starter_plan",
  PRO: "pro_plan",
  ENTERPRISE: "enterprise_plan",
} as const;

/**
 * Benefit IDs (to be configured in Polar dashboard)
 */
export const BENEFITS = {
  AI_GENERATION: "ai_generation",
  AI_GRADING: "ai_grading",
  ADVANCED_ANALYTICS: "advanced_analytics",
  CUSTOM_BRANDING: "custom_branding",
  TEAM_COLLABORATION: "team_collaboration",
  PRIORITY_SUPPORT: "priority_support",
  API_ACCESS: "api_access",
} as const;
