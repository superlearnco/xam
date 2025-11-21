import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import { ClerkProvider, useAuth } from "@clerk/react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import "./app.css";
import { Analytics } from "@vercel/analytics/react";
import { initMixpanel, identifyUser, trackEvent, resetMixpanel } from "~/lib/mixpanel";
import { useEffect } from "react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args);
}
export const links: Route.LinksFunction = () => [
  // DNS prefetch for external services
  { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  { rel: "dns-prefetch", href: "https://api.convex.dev" },
  { rel: "dns-prefetch", href: "https://clerk.dev" },
  
  // Preconnect to font services
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  
  // Font with display=swap for performance
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  
  // Preload critical assets (only if actually used immediately)
  // Removed preload for images that aren't used immediately to avoid warnings
  
  // Icon
  {
    rel: "icon",
    type: "image/png",
    href: "/xam favicon.png",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <Analytics />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  // Initialize Mixpanel on mount - ensure it happens before any tracking
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMixpanel();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ClerkProvider
      loaderData={loaderData}
      signUpFallbackRedirectUrl="/"
      signInFallbackRedirectUrl="/"
      afterSignUpUrl="/"
      afterSignInUrl="/"
    >
      <MixpanelUserTracker>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <PageViewTracker>
            <Outlet />
          </PageViewTracker>
          <Toaster />
        </ConvexProviderWithClerk>
      </MixpanelUserTracker>
    </ClerkProvider>
  );
}

// Component to track user authentication state and identify users in Mixpanel
function MixpanelUserTracker({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Ensure Mixpanel is initialized before tracking
    if (typeof window === "undefined") return;
    
    // Wait a bit to ensure Mixpanel is initialized
    const timer = setTimeout(() => {
      if (isSignedIn && userId && user) {
        // Check if this is a new user by checking localStorage
        const isNewUser = !localStorage.getItem(`mixpanel_identified_${userId}`);
        
        // Identify user in Mixpanel
        identifyUser(userId, {
          name: user.fullName || undefined,
          email: user.primaryEmailAddress?.emailAddress || undefined,
        });

        // Mark as identified to avoid tracking Sign In again on page refresh
        localStorage.setItem(`mixpanel_identified_${userId}`, "true");

        // Track Sign Up event if this is a new user (checking sign-up path or new user flag)
        if (isNewUser || location.pathname.includes("success") || location.search.includes("newUser=true")) {
          const urlParams = new URLSearchParams(location.search);
          trackEvent("Sign Up", {
            user_id: userId,
            email: user.primaryEmailAddress?.emailAddress || undefined,
            signup_method: user.externalAccounts?.[0]?.provider || "email",
            utm_source: urlParams.get("utm_source") || undefined,
            utm_medium: urlParams.get("utm_medium") || undefined,
            utm_campaign: urlParams.get("utm_campaign") || undefined,
          });
        } else {
          // Track Sign In event for returning users
          trackEvent("Sign In", {
            user_id: userId,
            login_method: user.externalAccounts?.[0]?.provider || "email",
            success: true,
          });
        }
      } else if (!isSignedIn) {
        // Reset Mixpanel on logout
        resetMixpanel();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSignedIn, userId, user, location.pathname, location.search]);

  return <>{children}</>;
}

// Component to track page views
function PageViewTracker({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userId } = useAuth();

  useEffect(() => {
    // Ensure Mixpanel is initialized before tracking
    if (typeof window === "undefined") return;
    
    // Wait a bit to ensure Mixpanel is initialized
    const timer = setTimeout(() => {
      trackEvent("Page View", {
        page_url: window.location.href,
        page_title: document.title,
        user_id: userId || undefined,
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, location.search, userId]);

  return <>{children}</>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let errorType = "unknown";
  let errorCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorType = error.status === 404 ? "404" : "route_error";
    errorCode = error.status;
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    errorType = "javascript_error";
    details = error.message;
    stack = error.stack;
  }

  // Track error event in Mixpanel
  if (typeof window !== "undefined") {
    trackEvent("Error", {
      error_type: errorType,
      error_message: details,
      error_code: errorCode,
      page_url: window.location.href,
      user_id: undefined, // Will be set by Mixpanel if user is identified
    });
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
