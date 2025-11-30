import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import * as Sentry from "@sentry/react-router";

import { ClerkProvider, useAuth, useUser } from "@clerk/react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import "./app.css";
import { Analytics } from "@vercel/analytics/react";
import { Databuddy } from "@databuddy/sdk/react";
import { identifyUser, trackEvent, resetDataBuddy, trackErrorEvent } from "~/lib/databuddy";
import { useEffect } from "react";
import { ConsentManagerProvider, CookieBanner } from "@c15t/react";

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
        <Databuddy
          clientId={import.meta.env.PUBLIC_DATABUDDY_CLIENT_ID as string}
          trackWebVitals
          trackErrors
          enableBatching
          disabled={import.meta.env.NODE_ENV === "development"}
        />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'c15t',
        backendURL: import.meta.env.PUBLIC_C15T_URL as string,
        consentCategories: ['necessary', 'marketing', 'analytics'],
      }}
    >
      <ClerkProvider
        loaderData={loaderData}
        signUpFallbackRedirectUrl="/"
        signInFallbackRedirectUrl="/"
        afterSignUpUrl="/"
        afterSignInUrl="/"
      >
        <DataBuddyUserTracker>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <PageViewTracker>
              <Outlet />
            </PageViewTracker>
            <Toaster />
          </ConvexProviderWithClerk>
        </DataBuddyUserTracker>
      </ClerkProvider>
      <CookieBanner />
    </ConsentManagerProvider>
  );
}

// Component to track user authentication state and identify users in DataBuddy
function DataBuddyUserTracker({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Wait a bit to ensure DataBuddy is initialized
    const timer = setTimeout(() => {
      if (isSignedIn && userId && user) {
        // Check if this is a new user by checking localStorage
        const isNewUser = !localStorage.getItem(`databuddy_identified_${userId}`);
        
        // Identify user in DataBuddy
        identifyUser(userId, {
          name: user.fullName || undefined,
          email: user.primaryEmailAddress?.emailAddress || undefined,
        });

        // Mark as identified to avoid tracking Sign In again on page refresh
        localStorage.setItem(`databuddy_identified_${userId}`, "true");

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
        // Reset DataBuddy on logout
        resetDataBuddy();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSignedIn, userId, user, location.pathname, location.search]);

  return <>{children}</>;
}

// Component to track page views
// Note: DataBuddy automatically tracks screen views, but we track manually for SPA route changes
function PageViewTracker({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userId } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Wait a bit to ensure DataBuddy is initialized
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
  } else if (error && error instanceof Error) {
    Sentry.captureException(error);
    if (import.meta.env.DEV) {
      errorType = "javascript_error";
      details = error.message;
      stack = error.stack;
    }
  }

  // Track error event in DataBuddy
  if (typeof window !== "undefined") {
    trackErrorEvent(details, {
      error_type: errorType,
      error_message: details,
      error_code: errorCode,
      page_url: window.location.href,
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
