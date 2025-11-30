import { track, getTracker, clear, trackError } from "@databuddy/sdk";

// Track an event in DataBuddy
export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await track(eventName, properties);
  } catch (error) {
    console.error("Failed to track event in DataBuddy:", error);
  }
}

// Identify a user in DataBuddy by setting global properties
export function identifyUser(
  userId: string,
  properties?: {
    name?: string;
    email?: string;
    [key: string]: any;
  }
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const tracker = getTracker();
    if (tracker) {
      tracker.setGlobalProperties({
        user_id: userId,
        name: properties?.name,
        email: properties?.email,
        ...properties,
      });
    }
  } catch (error) {
    console.error("Failed to identify user in DataBuddy:", error);
  }
}

// Reset DataBuddy (useful on logout)
export function resetDataBuddy() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    clear();
  } catch (error) {
    console.error("Failed to reset DataBuddy:", error);
  }
}

// Track error events
export async function trackErrorEvent(
  message: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await trackError(message, properties);
  } catch (error) {
    console.error("Failed to track error in DataBuddy:", error);
  }
}

