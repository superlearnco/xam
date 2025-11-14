import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Create a checkout session for purchasing AI credits
 * Credits are sold at $1 = 10 credits, minimum $5 purchase
 */
export const createCreditCheckout = action({
  args: {
    amount: v.number(), // Amount in USD (minimum 5)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate minimum amount
    if (args.amount < 5) {
      throw new Error("Minimum purchase amount is $5");
    }

    // Get user
    const user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user || !user.email) {
      throw new Error("User not found or email not available");
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    if (!process.env.POLAR_ORGANIZATION_ID) {
      throw new Error("POLAR_ORGANIZATION_ID is not configured");
    }

    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    // Find the AI Credits product
    const { result: productsResult } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    const creditsProduct = productsResult.items.find(
      (product) => product.name === "AI Credits"
    );

    if (!creditsProduct) {
      throw new Error("AI Credits product not found in Polar");
    }

    // Calculate credits (10 credits per dollar)
    const credits = args.amount * 10;

    // Create checkout
    const checkoutData = {
      products: [creditsProduct.id],
      successUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?purchase=success`,
      customerEmail: user.email,
      metadata: {
        userId: user.tokenIdentifier,
        credits: credits.toString(),
        amount: args.amount.toString(),
        type: "ai_credits",
      },
    };

    console.log("Creating AI credits checkout:", JSON.stringify(checkoutData, null, 2));

    const result = await polar.checkouts.create(checkoutData);
    return result.url;
  },
});

/**
 * Handle successful AI credit purchase from webhook
 */
export const handleCreditPurchase = mutation({
  args: {
    userId: v.string(),
    amount: v.number(), // Amount in cents
    transactionId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Convert amount from cents to dollars, then to credits (10 credits per dollar)
    const dollars = args.amount / 100;
    const credits = dollars * 10;

    console.log(`Adding ${credits} credits to user ${args.userId} (transaction ${args.transactionId})`);

    // Add credits using existing purchaseCredits mutation
    await ctx.runMutation(api.credits.index.purchaseCredits, {
      amount: credits,
      transactionId: args.transactionId,
    });

    return { success: true, creditsAdded: credits };
  },
});

/**
 * Create a Pay-As-You-Go subscription checkout
 */
export const createPayAsYouGoCheckout = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user || !user.email) {
      throw new Error("User not found or email not available");
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    if (!process.env.POLAR_ORGANIZATION_ID) {
      throw new Error("POLAR_ORGANIZATION_ID is not configured");
    }

    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    // Find the Pay-As-You-Go product
    const { result: productsResult } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    const payAsYouGoProduct = productsResult.items.find(
      (product) => product.name === "Pay-As-You-Go AI"
    );

    if (!payAsYouGoProduct) {
      throw new Error("Pay-As-You-Go AI product not found in Polar");
    }

    // Get the first price (should be the monthly metered price)
    const price = payAsYouGoProduct.prices[0];
    if (!price) {
      throw new Error("No price found for Pay-As-You-Go product");
    }

    // Create checkout using existing function
    const checkoutData = {
      products: [payAsYouGoProduct.id],
      successUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?subscription=success`,
      customerEmail: user.email,
      metadata: {
        userId: user.tokenIdentifier,
        type: "pay_as_you_go",
        priceId: price.id,
      },
    };

    console.log("Creating Pay-As-You-Go checkout:", JSON.stringify(checkoutData, null, 2));

    const result = await polar.checkouts.create(checkoutData);
    return result.url;
  },
});

/**
 * Update user to Pay-As-You-Go plan after subscription created
 */
export const handlePayAsYouGoSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get or create user's credits
    let userCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (!userCredits) {
      await ctx.db.insert("aiCredits", {
        userId: user._id,
        balance: 0,
        plan: "pay_as_you_go",
        periodUsage: 0,
        lastUpdated: now,
      });
    } else {
      await ctx.db.patch(userCredits._id, {
        plan: "pay_as_you_go",
        lastUpdated: now,
      });
    }

    console.log(`Updated user ${args.userId} to Pay-As-You-Go plan`);

    return { success: true };
  },
});

