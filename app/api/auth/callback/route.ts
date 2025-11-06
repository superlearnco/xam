import { NextRequest, NextResponse } from "next/server";
import { authenticateWithCode } from "@/lib/workos/client";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=missing_code", request.url)
      );
    }

    // Authenticate with WorkOS
    const { user, accessToken, refreshToken } = await authenticateWithCode(code);

    // Parse state to get redirect URL
    let redirectTo = "/app";
    if (state) {
      try {
        const stateData = JSON.parse(state);
        redirectTo = stateData.redirectTo || "/app";
      } catch {
        // Invalid state, use default redirect
      }
    }

    // Set session cookies
    const cookieStore = await cookies();

    // Access token (httpOnly for security)
    cookieStore.set("workos_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Refresh token (httpOnly for security)
    if (refreshToken) {
      cookieStore.set("workos_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // User ID (can be accessed client-side)
    cookieStore.set("workos_user_id", user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Store user email (can be accessed client-side)
    cookieStore.set("workos_user_email", user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Redirect to intended destination
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url)
    );
  }
}
