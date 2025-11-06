import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all authentication cookies
    cookieStore.delete("workos_access_token");
    cookieStore.delete("workos_refresh_token");
    cookieStore.delete("workos_user_id");
    cookieStore.delete("workos_user_email");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all authentication cookies
    cookieStore.delete("workos_access_token");
    cookieStore.delete("workos_refresh_token");
    cookieStore.delete("workos_user_id");
    cookieStore.delete("workos_user_email");

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
