"use client";

import { useEffect } from "react";
import { initializeDatabuddy } from "@/lib/analytics/track";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Databuddy analytics on mount
    initializeDatabuddy();
  }, []);

  return <>{children}</>;
}
