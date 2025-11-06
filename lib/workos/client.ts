import { WorkOS } from "@workos-inc/node";

// Initialize WorkOS client for server-side operations
export const workos = new WorkOS(process.env.WORKOS_API_KEY);

// WorkOS configuration
export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID!;
export const WORKOS_REDIRECT_URI = process.env.WORKOS_REDIRECT_URI!;

// Helper to get authorization URL for OAuth flow
export function getAuthorizationUrl(state?: string) {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId: WORKOS_CLIENT_ID,
    redirectUri: WORKOS_REDIRECT_URI,
    state: state,
  });

  return authorizationUrl;
}

// Helper to authenticate with authorization code
export async function authenticateWithCode(code: string) {
  try {
    const { user, accessToken, refreshToken } =
      await workos.userManagement.authenticateWithCode({
        clientId: WORKOS_CLIENT_ID,
        code,
      });

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error authenticating with WorkOS:", error);
    throw error;
  }
}

// Helper to get user info from access token
export async function getUserFromAccessToken(accessToken: string) {
  try {
    const user = await workos.userManagement.getUser(accessToken);
    return user;
  } catch (error) {
    console.error("Error getting user from access token:", error);
    throw error;
  }
}

// Helper to refresh access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await workos.userManagement.authenticateWithRefreshToken({
      clientId: WORKOS_CLIENT_ID,
      refreshToken,
    });

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

// Helper to sign out user
export async function signOutUser(sessionId: string) {
  try {
    await workos.userManagement.revokeSession({
      sessionId,
    });
  } catch (error) {
    console.error("Error signing out user:", error);
    throw error;
  }
}
