import * as Sentry from "@sentry/react-router";

export async function loader() {
  // Send a log before throwing the error
  console.log("User triggered test error");

  // Send a test metric before throwing the error
  // Sentry.metrics.count('test_counter', 1 );

  throw new Error("Sentry Test Error");
}

export default function SentryTest() {
  return <div>This page will throw an error!</div>;
}

