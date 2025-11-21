import mixpanel from "mixpanel-browser";

let isInitialized = false;

// Initialize Mixpanel with the provided token
// Autocapture is enabled, Session Replay is disabled
export function initMixpanel() {
  if (typeof window !== "undefined" && !isInitialized) {
    try {
      mixpanel.init("9f032919bc705ef9df95a8712387105c", {
        debug: true,
        track_pageview: true,
        persistence: "localStorage",
        autocapture: true,
      });
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Mixpanel:", error);
    }
  }
}

// Check if Mixpanel is ready to use
function isMixpanelReady(): boolean {
  if (typeof window === "undefined" || !isInitialized) {
    return false;
  }
  try {
    // Check if mixpanel has the necessary internal state
    return mixpanel && typeof mixpanel.track === "function";
  } catch {
    return false;
  }
}

// Identify a user in Mixpanel
export function identifyUser(userId: string, properties?: {
  name?: string;
  email?: string;
  [key: string]: any;
}) {
  if (!isMixpanelReady()) {
    console.warn("Mixpanel not initialized, skipping identify");
    return;
  }
  
  try {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set({
        $name: properties.name,
        $email: properties.email,
        ...properties,
      });
    }
  } catch (error) {
    console.error("Failed to identify user in Mixpanel:", error);
  }
}

// Track an event in Mixpanel
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!isMixpanelReady()) {
    console.warn("Mixpanel not initialized, skipping event:", eventName);
    return;
  }
  
  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.error("Failed to track event in Mixpanel:", error);
  }
}

// Reset Mixpanel (useful on logout)
export function resetMixpanel() {
  if (!isMixpanelReady()) {
    return;
  }
  
  try {
    mixpanel.reset();
  } catch (error) {
    console.error("Failed to reset Mixpanel:", error);
  }
}

