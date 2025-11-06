import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/workos/client";

export async function GET(request: NextRequest) {
  try {
    // Get the redirect URL from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get("redirect") || "/app";

    // Generate state parameter with redirect info
    const state = JSON.stringify({ redirectTo });

    // Get WorkOS authorization URL
    const authorizationUrl = getAuthorizationUrl(state);

    // Redirect to WorkOS login
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Error initiating login:", error);
    return NextResponse.json(
      { error: "Failed to initiate login" },
      { status: 500 }
    );
  }
}
