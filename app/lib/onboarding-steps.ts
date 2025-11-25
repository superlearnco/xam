export type OnboardingStepId =
  | "welcome"
  | "dashboard-overview"
  | "create-new"
  | "ai-generate"
  | "credits-system"
  | "settings"
  | "completion";

export type EditorOnboardingStepId =
  | "editor-welcome"
  | "field-types-sidebar"
  | "drag-and-drop"
  | "test-canvas"
  | "field-properties"
  | "editor-tabs"
  | "options-tab"
  | "preview-tab"
  | "marking-tab"
  | "print-export"
  | "editor-completion";

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

export interface EditorOnboardingStep {
  id: EditorOnboardingStepId;
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

export const EDITOR_ONBOARDING_STEPS: EditorOnboardingStep[] = [
  {
    id: "editor-welcome",
    title: "Welcome to the Test Editor",
    description:
      "This is where you build your assessments. Let's walk through the key features so you can create professional tests in minutes.",
    showOverlay: true,
  },
  {
    id: "field-types-sidebar",
    title: "Question Types",
    description:
      "This sidebar contains all available question types. You have Short Input, Long Input, Multiple Choice, Checkboxes, Dropdown, Image Choice, Page Breaks, and Info Blocks.",
    targetSelector: "[data-onboarding='field-types-sidebar']",
    position: "right",
    highlightPadding: 8,
  },
  {
    id: "drag-and-drop",
    title: "Drag & Drop to Add",
    description:
      "Simply drag a question type from the sidebar and drop it onto the canvas to add it to your test. You can also click on a field type to add it directly.",
    targetSelector: "[data-onboarding='field-type-item']",
    position: "right",
    highlightPadding: 8,
  },
  {
    id: "test-canvas",
    title: "Your Test Canvas",
    description:
      "This is where your questions appear. Drag questions to reorder them, click on any question to edit it, or use the settings icon to open the properties panel.",
    targetSelector: "[data-onboarding='test-canvas']",
    position: "left",
    highlightPadding: 12,
  },
  {
    id: "field-properties",
    title: "Question Properties",
    description:
      "Click the settings icon on any question to open the Properties panel. Here you can set the question label, mark it as required, add images, LaTeX formulas, set marks, and configure correct answers.",
    targetSelector: "[data-onboarding='test-canvas']",
    position: "left",
    highlightPadding: 12,
  },
  {
    id: "editor-tabs",
    title: "Editor Tabs",
    description:
      "Use these tabs to switch between the Editor, Preview your test, configure Options, and set up Marking schemes for grading.",
    targetSelector: "[data-onboarding='editor-tabs']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "preview-tab",
    title: "Preview Tab",
    description:
      "The Preview tab shows exactly how your test will appear to respondents. Test your questions and ensure everything looks perfect before sharing.",
    targetSelector: "[data-onboarding='tab-preview']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "options-tab",
    title: "Options Tab",
    description:
      "Configure sharing settings, access controls, time limits, security options, and grading parameters. Generate QR codes and share links from here.",
    targetSelector: "[data-onboarding='tab-options']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "marking-tab",
    title: "Marking Tab",
    description:
      "View submissions, grade responses, and track analytics. See how respondents performed and access detailed breakdowns of their answers.",
    targetSelector: "[data-onboarding='tab-marking']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "print-export",
    title: "Print & Export",
    description:
      "Click here to print your test as a worksheet. Perfect for in-class assessments or offline use. The printed version includes proper formatting and answer spaces.",
    targetSelector: "[data-onboarding='print-btn']",
    position: "bottom",
    highlightPadding: 8,
  },
  {
    id: "editor-completion",
    title: "Ready to Create!",
    description:
      "You now know the essentials of the test editor. Start by adding your first question from the sidebar. You can restart this tour from the Settings page anytime.",
    showOverlay: true,
  },
];
