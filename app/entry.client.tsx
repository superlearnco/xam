import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

Sentry.init({
  dsn: "https://00d558c79187bda07b5019003c1526f5@o4510400690126848.ingest.us.sentry.io/0", // FIXME: Update with your project ID
  sendDefaultPii: true,
  integrations: [
    Sentry.reactRouterTracingIntegration(),
  ],
  enableLogs: true,
  tracesSampleRate: 1.0,
  tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
