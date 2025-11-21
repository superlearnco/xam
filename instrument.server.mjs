import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://00d558c79187bda07b5019003c1526f5@o4510400690126848.ingest.us.sentry.io/0",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration
  sendDefaultPii: true,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  tracesSampleRate: 1.0, // Capture 100% of the transactions
});

