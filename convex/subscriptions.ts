import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { api } from "./_generated/api";
import { action, httpAction, mutation, query } from "./_generated/server";

const createCheckout = async ({
  customerEmail,
  productPriceId,
  successUrl,
  metadata,
}: {
  customerEmail: string;
  productPriceId: string;
  successUrl: string;
  metadata?: Record<string, string>;
}) => {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  const polar = new Polar({
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  // Get product ID from price ID
  const { result: productsResult } = await polar.products.list({
    organizationId: process.env.POLAR_ORGANIZATION_ID,
    isArchived: false,
  });

  let productId = null;
  for (const product of productsResult.items) {
    const hasPrice = product.prices.some(
      (price: any) => price.id === productPriceId
    );
    if (hasPrice) {
      productId = product.id;
      break;
    }
  }

  if (!productId) {
    throw new Error(`Product not found for price ID: ${productPriceId}`);
  }

  const checkoutData = {
    products: [productId],
    successUrl: successUrl,
    customerEmail: customerEmail,
    metadata: {
      ...metadata,
      priceId: productPriceId,
    },
  };


  const result = await polar.checkouts.create(checkoutData);
  return result;
};

export const getAvailablePlansQuery = query({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRecurring: item.isRecurring,
      prices: item.prices.map((price: any) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      })),
    }));

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

export const getAvailablePlans = action({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRecurring: item.isRecurring,
      prices: item.prices.map((price: any) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      })),
    }));

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

// Get credit products (one-time products for purchasing credits)
export const getCreditProducts = action({
  handler: async (ctx) => {
    const polar = new Polar({
      server:
        (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Filter for one-time products (non-recurring) which are credit purchases
    const creditProducts = result.items
      .filter((item) => !item.isRecurring)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        prices: item.prices.map((price: any) => ({
          id: price.id,
          amount: price.priceAmount,
          currency: price.priceCurrency,
          credits: Math.floor((price.priceAmount / 100) * 10), // $1 = 10 credits
        })),
      }));

    return {
      items: creditProducts,
    };
  },
});


export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // First check if user exists
    let user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.subject,
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await ctx.runMutation(api.users.upsertUser);

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    const checkout = await createCheckout({
      customerEmail: user.email!,
      productPriceId: args.priceId,
      successUrl: `${process.env.FRONTEND_URL}/success`,
      metadata: {
        userId: user.tokenIdentifier,
      },
    });

    return checkout.url;
  },
});

export const checkUserSubscriptionStatus = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tokenIdentifier: string;

    if (args.userId) {
      // Use provided userId directly as tokenIdentifier (they are the same)
      tokenIdentifier = args.userId;
    } else {
      // Fall back to auth context
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return { hasActiveSubscription: false };
      }
      tokenIdentifier = identity.subject;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const checkUserSubscriptionStatusByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk user ID (this assumes the tokenIdentifier contains the Clerk user ID)
    // In Clerk, the subject is typically in the format "user_xxxxx" where xxxxx is the Clerk user ID
    const tokenIdentifier = `user_${args.clerkUserId}`;

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    // If not found with user_ prefix, try the raw userId
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.clerkUserId))
        .unique();
    }

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const fetchUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    return subscription;
  },
});

export const handleWebhookEvent = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    // Extract event type from webhook payload
    const eventType = args.body.type;

    // Store webhook event
    await ctx.db.insert("webhookEvents", {
      type: eventType,
      polarEventId: args.body.data?.id || "unknown",
      createdAt: args.body.data?.created_at || new Date().toISOString(),
      modifiedAt:
        args.body.data?.modified_at ||
        args.body.data?.created_at ||
        new Date().toISOString(),
      data: args.body.data,
    });

    switch (eventType) {
      case "subscription.created":
        // Insert new subscription
        await ctx.db.insert("subscriptions", {
          polarId: args.body.data.id,
          polarPriceId: args.body.data.price_id,
          currency: args.body.data.currency,
          interval: args.body.data.recurring_interval,
          userId: args.body.data.metadata.userId,
          status: args.body.data.status,
          currentPeriodStart: new Date(
            args.body.data.current_period_start
          ).getTime(),
          currentPeriodEnd: new Date(
            args.body.data.current_period_end
          ).getTime(),
          cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
          amount: args.body.data.amount,
          startedAt: new Date(args.body.data.started_at).getTime(),
          endedAt: args.body.data.ended_at
            ? new Date(args.body.data.ended_at).getTime()
            : undefined,
          canceledAt: args.body.data.canceled_at
            ? new Date(args.body.data.canceled_at).getTime()
            : undefined,
          customerCancellationReason:
            args.body.data.customer_cancellation_reason || undefined,
          customerCancellationComment:
            args.body.data.customer_cancellation_comment || undefined,
          metadata: args.body.data.metadata || {},
          customFieldData: args.body.data.custom_field_data || {},
          customerId: args.body.data.customer_id,
        });
        break;

      case "subscription.updated":
        // Find existing subscription
        const existingSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (existingSub) {
          await ctx.db.patch(existingSub._id, {
            amount: args.body.data.amount,
            status: args.body.data.status,
            currentPeriodStart: new Date(
              args.body.data.current_period_start
            ).getTime(),
            currentPeriodEnd: new Date(
              args.body.data.current_period_end
            ).getTime(),
            cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
            metadata: args.body.data.metadata || {},
            customFieldData: args.body.data.custom_field_data || {},
          });
        }
        break;

      case "subscription.active":
        // Find and update subscription
        const activeSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (activeSub) {
          await ctx.db.patch(activeSub._id, {
            status: args.body.data.status,
            startedAt: new Date(args.body.data.started_at).getTime(),
          });
        }
        break;

      case "subscription.canceled":
        // Find and update subscription
        const canceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (canceledSub) {
          await ctx.db.patch(canceledSub._id, {
            status: args.body.data.status,
            canceledAt: args.body.data.canceled_at
              ? new Date(args.body.data.canceled_at).getTime()
              : undefined,
            customerCancellationReason:
              args.body.data.customer_cancellation_reason || undefined,
            customerCancellationComment:
              args.body.data.customer_cancellation_comment || undefined,
          });
        }
        break;

      case "subscription.uncanceled":
        // Find and update subscription
        const uncanceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (uncanceledSub) {
          await ctx.db.patch(uncanceledSub._id, {
            status: args.body.data.status,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            customerCancellationReason: undefined,
            customerCancellationComment: undefined,
          });
        }
        break;

      case "subscription.revoked":
        // Find and update subscription
        const revokedSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (revokedSub) {
          await ctx.db.patch(revokedSub._id, {
            status: "revoked",
            endedAt: args.body.data.ended_at
              ? new Date(args.body.data.ended_at).getTime()
              : undefined,
          });
        }
        break;

      case "checkout.created":
      case "checkout.succeeded":
        // Checkout events might have metadata we need
        // Don't process credits here, wait for order.created
        break;

      case "order.created":
        // Handle credit purchases from one-time orders
        // $1 = 10 credits
        try {
          const orderData = args.body.data;

          // Try multiple ways to get userId from metadata
          // Check both order metadata and checkout metadata (if present)
          let userId =
            orderData.metadata?.userId ||
            orderData.metadata?.user_id ||
            orderData.metadata?.["userId"] ||
            orderData.checkout?.metadata?.userId ||
            orderData.checkout_metadata?.userId;

          // If userId not in metadata, try to find user by customer email
          if (!userId && orderData.customer_email) {
            const userByEmail = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("email"), orderData.customer_email))
              .first();
            if (userByEmail) {
              userId = userByEmail.tokenIdentifier;
            }
          }

          // Also try customer_id if available
          if (!userId && orderData.customer_id) {
            // Note: customer_id might not directly map to our user, but worth trying
          }

          if (!userId) {
            console.error(
              "[WEBHOOK] ERROR: No userId found in order metadata or by email"
            );
            console.error(
              "[WEBHOOK] Order metadata keys:",
              Object.keys(orderData.metadata || {})
            );
            console.error("[WEBHOOK] Order data keys:", Object.keys(orderData));
            console.error(
              "[WEBHOOK] Full order data:",
              JSON.stringify(orderData, null, 2)
            );
            break;
          }

          // Check if this order was already processed (prevent duplicate credits)
          const existingTransaction = await ctx.db
            .query("creditTransactions")
            .withIndex("polarOrderId", (q) =>
              q.eq("polarOrderId", orderData.id)
            )
            .first();

          if (existingTransaction) {
            break;
          }

          // Polar orders have an items array, not a single product_id
          // Check if this is a one-time product (credit purchase)
          const orderItems = orderData.items || [];

          if (orderItems.length === 0) {
            break;
          }

          // Calculate total credits from all items
          // For one-time products (credit purchases), use amount (in cents)
          // $1 = 10 credits, amount is in cents
          const amountInDollars = (orderData.amount || 0) / 100;
          const creditsToAdd = Math.floor(amountInDollars * 10);

          if (creditsToAdd > 0) {
            // Find the user and add credits directly (mutations can't call other mutations)
            const user = await ctx.db
              .query("users")
              .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
              .unique();

            if (!user) {
              console.error("User not found:", userId);
              break;
            }

            const currentCredits = user.credits || 0;
            const newCredits = currentCredits + creditsToAdd;

            // Update user credits
            await ctx.db.patch(user._id, {
              credits: newCredits,
            });

            // Create transaction record
            await ctx.db.insert("creditTransactions", {
              userId: userId,
              amount: creditsToAdd,
              type: "purchase",
              description: `Purchased ${creditsToAdd} credits`,
              polarOrderId: orderData.id,
              createdAt: Date.now(),
            });

          }
        } catch (error) {
          console.error("Error processing order.created webhook:", error);
          // Don't throw - we want to store the webhook event even if processing fails
        }
        break;

      default:
        // Unhandled event type
        break;
    }
  },
});

// Use our own validation similar to validateEvent from @polar-sh/sdk/webhooks
// The only diffference is we use btoa to encode the secret since Convex js runtime doesn't support Buffer
const validateEvent = (
  body: string | Buffer,
  headers: Record<string, string>,
  secret: string
) => {
  const base64Secret = btoa(secret);
  const webhook = new Webhook(base64Secret);
  webhook.verify(body, headers);
};

export const paymentWebhook = httpAction(async (ctx, request) => {
  try {
    const rawBody = await request.text();

    // Internally validateEvent uses headers as a dictionary e.g. headers["webhook-id"]
    // So we need to convert the headers to a dictionary
    // (request.headers is a Headers object which is accessed as request.headers.get("webhook-id"))
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Validate the webhook event
    if (!process.env.POLAR_WEBHOOK_SECRET) {
      throw new Error(
        "POLAR_WEBHOOK_SECRET environment variable is not configured"
      );
    }
    validateEvent(rawBody, headers, process.env.POLAR_WEBHOOK_SECRET);

    const body = JSON.parse(rawBody);

    // track events and based on events store data
    await ctx.runMutation(api.subscriptions.handleWebhookEvent, {
      body,
    });

    return new Response(JSON.stringify({ message: "Webhook received!" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return new Response(
        JSON.stringify({ message: "Webhook verification failed" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify({ message: "Webhook failed" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});

// Debug queries
export const debugGetWebhookEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("webhookEvents")
      .order("desc")
      .take(args.limit || 20);
    return events;
  },
});

export const debugGetOrderWebhooks = query({
  handler: async (ctx) => {
    const orderEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("type", (q) => q.eq("type", "order.created"))
      .order("desc")
      .take(10);
    return orderEvents;
  },
});

// Test query to manually add credits
export const testAddCreditsToUser = mutation({
  args: {
    email: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User not found with email: ${args.email}`);
    }

    const currentCredits = user.credits || 0;
    const newCredits = currentCredits + args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: newCredits,
    });

    // Create transaction record
    await ctx.db.insert("creditTransactions", {
      userId: user.tokenIdentifier,
      amount: args.amount,
      type: "purchase",
      description: `Manual test credit addition`,
      createdAt: Date.now(),
    });


    return {
      success: true,
      user: user.email,
      oldCredits: currentCredits,
      newCredits: newCredits,
    };
  },
});

// Test mutation to simulate order.created webhook
export const testOrderCreatedWebhook = mutation({
  args: {
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find a recent order webhook
    const orderWebhook = await ctx.db
      .query("webhookEvents")
      .withIndex("type", (q) => q.eq("type", "order.created"))
      .order("desc")
      .first();

    if (!orderWebhook) {
      throw new Error("No order.created webhook found");
    }

    const orderData = orderWebhook.data;

    // Try multiple ways to get userId from metadata
    let userId =
      orderData.metadata?.userId ||
      orderData.metadata?.user_id ||
      orderData.metadata?.["userId"] ||
      orderData.checkout?.metadata?.userId ||
      orderData.checkout_metadata?.userId;

    // If userId not in metadata, try to find user by customer email
    if (!userId && orderData.customer_email) {
      const userByEmail = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), orderData.customer_email))
        .first();
      if (userByEmail) {
        userId = userByEmail.tokenIdentifier;
      }
    }

    if (!userId) {
      console.error("[TEST] ERROR: No userId found");
      return { success: false, error: "No userId found" };
    }

    // Check if this order was already processed
    const existingTransaction = await ctx.db
      .query("creditTransactions")
      .withIndex("polarOrderId", (q) => q.eq("polarOrderId", orderData.id))
      .first();

    if (existingTransaction) {
      return { success: false, error: "Order already processed" };
    }

    // Calculate credits
    const amountInDollars = (orderData.amount || 0) / 100;
    const creditsToAdd = Math.floor(amountInDollars * 10);

    if (creditsToAdd <= 0) {
      return { success: false, error: "No credits to add" };
    }

    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) {
      console.error("[TEST] User not found:", userId);
      return { success: false, error: "User not found" };
    }


    const currentCredits = user.credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: newCredits,
    });

    // Create transaction record
    await ctx.db.insert("creditTransactions", {
      userId: userId,
      amount: creditsToAdd,
      type: "purchase",
      description: `Purchased ${creditsToAdd} credits`,
      polarOrderId: orderData.id,
      createdAt: Date.now(),
    });


    return {
      success: true,
      userId: userId,
      creditsAdded: creditsToAdd,
      newBalance: newCredits,
      orderId: orderData.id,
    };
  },
});

// Mutation to reprocess all unprocessed order.created webhooks
export const reprocessAllOrders = mutation({
  handler: async (ctx) => {
    // Get all order.created webhooks
    const orderWebhooks = await ctx.db
      .query("webhookEvents")
      .withIndex("type", (q) => q.eq("type", "order.created"))
      .collect();


    const results = {
      total: orderWebhooks.length,
      processed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const webhook of orderWebhooks) {
      const orderData = webhook.data;

      try {
        // Get userId
        let userId =
          orderData.metadata?.userId ||
          orderData.metadata?.user_id ||
          orderData.metadata?.["userId"] ||
          orderData.checkout?.metadata?.userId ||
          orderData.checkout_metadata?.userId;

        // Try email lookup if no userId
        if (!userId && orderData.customer_email) {
          const userByEmail = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), orderData.customer_email))
            .first();
          if (userByEmail) {
            userId = userByEmail.tokenIdentifier;
          }
        }

        if (!userId) {
          results.skipped++;
          continue;
        }

        // Check if already processed
        const existingTransaction = await ctx.db
          .query("creditTransactions")
          .withIndex("polarOrderId", (q) => q.eq("polarOrderId", orderData.id))
          .first();

        if (existingTransaction) {
          results.skipped++;
          continue;
        }

        // Calculate credits
        const amountInDollars = (orderData.amount || 0) / 100;
        const creditsToAdd = Math.floor(amountInDollars * 10);

        if (creditsToAdd <= 0) {
          results.skipped++;
          continue;
        }

        // Find user
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
          .unique();

        if (!user) {
          results.errors.push(`User not found: ${userId}`);
          continue;
        }

        // Add credits
        const currentCredits = user.credits || 0;
        const newCredits = currentCredits + creditsToAdd;

        await ctx.db.patch(user._id, {
          credits: newCredits,
        });

        await ctx.db.insert("creditTransactions", {
          userId: userId,
          amount: creditsToAdd,
          type: "purchase",
          description: `Reprocessed: Purchased ${creditsToAdd} credits`,
          polarOrderId: orderData.id,
          createdAt: Date.now(),
        });

        results.processed++;
      } catch (error) {
        console.error(
          `[REPROCESS] Error processing order ${orderData.id}:`,
          error
        );
        results.errors.push(`Order ${orderData.id}: ${error}`);
      }
    }

    return results;
  },
});

export const createCustomerPortalUrl = action({
  handler: async (ctx, args: { customerId: string }) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    try {
      const result = await polar.customerSessions.create({
        customerId: args.customerId,
      });

      // Only return the URL to avoid Convex type issues
      return { url: result.customerPortalUrl };
    } catch (error) {
      console.error("Error creating customer session:", error);
      throw new Error("Failed to create customer session");
    }
  },
});

// Query to get recent webhook events for debugging
export const getRecentWebhookEvents = query({
  args: {
    limit: v.optional(v.number()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.eventType) {
      const events = await ctx.db
        .query("webhookEvents")
        .withIndex("type", (q) => q.eq("type", args.eventType!))
        .order("desc")
        .take(args.limit || 50);
      return events;
    } else {
      const events = await ctx.db
        .query("webhookEvents")
        .order("desc")
        .take(args.limit || 50);
      return events;
    }
  },
});
