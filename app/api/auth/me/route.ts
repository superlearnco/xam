import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromAccessToken, refreshAccessToken } from "@/lib/workos/client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("workos_access_token")?.value;
    const refreshToken = cookieStore.get("workos_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      // Try to get user with current access token
      const user = await getUserFromAccessToken(accessToken);

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
        },
      });
    } catch (error) {
      // Access token might be expired, try to refresh
      if (refreshToken) {
        try {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(refreshToken);

          // Update cookies with new tokens
          cookieStore.set("workos_access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
          });

          if (newRefreshToken) {
            cookieStore.set("workos_refresh_token", newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            });
          }

          // Get user with new access token
          const user = await getUserFromAccessToken(newAccessToken);

          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePictureUrl: user.profilePictureUrl,
            },
          });
        } catch (refreshError) {
          // Refresh failed, clear cookies
          cookieStore.delete("workos_access_token");
          cookieStore.delete("workos_refresh_token");
          cookieStore.delete("workos_user_id");
          cookieStore.delete("workos_user_email");

          return NextResponse.json(
            { error: "Session expired" },
            { status: 401 }
          );
        }
      }

      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
