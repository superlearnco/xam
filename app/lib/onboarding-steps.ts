export type OnboardingStepId =
  | "welcome"
  | "dashboard-overview"
  | "create-new"
  | "ai-generate"
  | "credits-system"
  | "settings"
  | "completion";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  targetSelector?: string;
  position?: TooltipPosition;
  highlightPadding?: number;
  showOverlay?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to XAM",
    description:
      "XAM helps you create, manage, and grade assessments with ease. Let's take a quick tour of the key features to get you started.",
    showOverlay: true,
  },
  {
    id: "dashboard-overview",
    title: "Your Dashboard",
    description:
      "This is your central hub. Here you can see all your tests, surveys, and essays. Use the search bar and filters to quickly find what you need.",
    targetSelector: "[data-onboarding='dashboard-filters']",
    position: "bottom",
    highlightPadding: 12,
  },
  {
    id: "create-new",
    title: "Create New Assessment",
    description:
      "Click here to create a new test, survey, or essay from scratch. You'll be taken to a powerful editor where you can add various question types.",
    targetSelector: "[data-onboarding='create-new-btn']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "ai-generate",
    title: "Generate with AI",
    description:
      "Let AI help you create assessments instantly. Just describe what you need, and our AI will generate questions for you. This uses credits from your account.",
    targetSelector: "[data-onboarding='ai-generate-btn']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "credits-system",
    title: "Credits & Usage",
    description:
      "AI features use credits. Visit the Credits page to view your balance, purchase more credits, and track your usage over time.",
    targetSelector: "[data-onboarding='nav-credits']",
    position: "right",
    highlightPadding: 8,
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Manage your account preferences, view your profile, and customize your XAM experience from the settings page.",
    targetSelector: "[data-onboarding='nav-settings']",
    position: "right",
    highlightPadding: 8,
  },
  {
    id: "completion",
    title: "You're All Set!",
    description:
      "You're ready to start creating assessments. If you ever want to see this tour again, you can restart it from the Settings page.",
    showOverlay: true,
  },
];

