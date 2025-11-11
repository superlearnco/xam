import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession, getCustomerByEmail, createCustomer } from "@/lib/polar/client";

/**
 * POST /api/checkout/create
 * Create a Polar checkout session for credit purchase
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productPriceId, successUrl, cancelUrl } = body;

    if (!productPriceId || !successUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user email from session claims
    const userEmail = sessionClaims?.email as string;
    const userName = sessionClaims?.name as string || sessionClaims?.firstName as string || undefined;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if customer exists in Polar, or create one
    let customer = await getCustomerByEmail(userEmail);

    if (!customer) {
      const createResult = await createCustomer({
        email: userEmail,
        name: userName,
        metadata: {
          clerkUserId: userId,
        },
      });

      if (!createResult.success) {
        return NextResponse.json(
          { success: false, error: "Failed to create customer" },
          { status: 500 }
        );
      }

      customer = createResult.customer;
    }

    // Create checkout session
    const checkout = await createCheckoutSession({
      productPriceId,
      customerId: customer?.id,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/app/billing/success`,
      customerEmail: userEmail,
    });

    if (!checkout.success) {
      return NextResponse.json(
        { success: false, error: checkout.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.checkoutId,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
