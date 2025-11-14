// App-wide constants

// Project Types
export const PROJECT_TYPES = {
  TEST: "test",
  ESSAY: "essay",
  SURVEY: "survey",
} as const;

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES];

// Project Status
export const PROJECT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

// Field Types
export const FIELD_TYPES = {
  SHORT_TEXT: "short_text",
  LONG_TEXT: "long_text",
  MULTIPLE_CHOICE: "multiple_choice",
  CHECKBOX: "checkbox",
  DROPDOWN: "dropdown",
  FILE_UPLOAD: "file_upload",
  DATE: "date",
  RATING: "rating",
  LINEAR_SCALE: "linear_scale",
  NUMBER: "number",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

// Submission Status
export const SUBMISSION_STATUS = {
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  MARKED: "marked",
  RETURNED: "returned",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

// AI Features
export const AI_FEATURES = {
  TEST_GENERATION: "test_generation",
  GRADING: "grading",
  FEEDBACK: "feedback",
  OPTION_GENERATION: "option_generation",
  RUBRIC_GENERATION: "rubric_generation",
} as const;

export type AIFeature = (typeof AI_FEATURES)[keyof typeof AI_FEATURES];

// AI Models
export const AI_MODELS = {
  FAST: "grok-2-1212",
  REASONING: "grok-beta",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

// Billing Plans
export const BILLING_PLANS = {
  FREE: "free",
  PAY_AS_YOU_GO: "pay_as_you_go",
  PRO_MONTHLY: "pro_monthly",
  PRO_YEARLY: "pro_yearly",
} as const;

export type BillingPlan = (typeof BILLING_PLANS)[keyof typeof BILLING_PLANS];

// Free Tier Limits
export const FREE_TIER = {
  MONTHLY_CREDITS: 5.0,
  MAX_PROJECTS: 5,
  MAX_SUBMISSIONS_PER_PROJECT: 50,
} as const;

// Pro Plan Limits
export const PRO_TIER = {
  MONTHLY_CREDITS: 50.0,
  MAX_PROJECTS: -1, // unlimited
  MAX_SUBMISSIONS_PER_PROJECT: -1, // unlimited
} as const;

// Token Costs (in USD per 1k tokens)
export const TOKEN_COSTS = {
  INPUT_PER_1K: 0.002,
  OUTPUT_PER_1K: 0.01,
} as const;

// Field Icons Map (for display purposes)
export const FIELD_ICONS = {
  [FIELD_TYPES.SHORT_TEXT]: "Type",
  [FIELD_TYPES.LONG_TEXT]: "AlignLeft",
  [FIELD_TYPES.MULTIPLE_CHOICE]: "ListOrdered",
  [FIELD_TYPES.CHECKBOX]: "CheckSquare",
  [FIELD_TYPES.DROPDOWN]: "ChevronDown",
  [FIELD_TYPES.FILE_UPLOAD]: "Upload",
  [FIELD_TYPES.DATE]: "Calendar",
  [FIELD_TYPES.RATING]: "Star",
  [FIELD_TYPES.LINEAR_SCALE]: "Gauge",
  [FIELD_TYPES.NUMBER]: "Hash",
} as const;

// Field Labels Map
export const FIELD_LABELS = {
  [FIELD_TYPES.SHORT_TEXT]: "Short Text",
  [FIELD_TYPES.LONG_TEXT]: "Long Text",
  [FIELD_TYPES.MULTIPLE_CHOICE]: "Multiple Choice",
  [FIELD_TYPES.CHECKBOX]: "Checkbox",
  [FIELD_TYPES.DROPDOWN]: "Dropdown",
  [FIELD_TYPES.FILE_UPLOAD]: "File Upload",
  [FIELD_TYPES.DATE]: "Date",
  [FIELD_TYPES.RATING]: "Rating",
  [FIELD_TYPES.LINEAR_SCALE]: "Linear Scale",
  [FIELD_TYPES.NUMBER]: "Number",
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  PROJECT_NAME_MIN: 1,
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  FIELD_QUESTION_MIN: 1,
  FIELD_QUESTION_MAX: 500,
  FIELD_DESCRIPTION_MAX: 1000,
  OPTION_MIN: 2,
  OPTION_MAX: 10,
  OPTION_TEXT_MAX: 200,
  FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB
  TIME_LIMIT_MIN: 5,
  TIME_LIMIT_MAX: 240, // 4 hours in minutes
  MARKS_MIN: 0,
  MARKS_MAX: 100,
} as const;

// Default Values
export const DEFAULTS = {
  RATING_SCALE_MIN: 1,
  RATING_SCALE_MAX: 5,
  LINEAR_SCALE_MIN: 1,
  LINEAR_SCALE_MAX: 10,
  LINEAR_SCALE_STEP: 1,
  HEADER_COLOR: "#000000",
  BACKGROUND_COLOR: "#ffffff",
  ACCENT_COLOR: "#3b82f6",
  TIME_LIMIT: 60, // minutes
  MAX_SUBMISSIONS: 1,
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROJECT_EDITOR: (projectId: string) => `/projects/${projectId}/editor`,
  PROJECT_OPTIONS: (projectId: string) => `/projects/${projectId}/options`,
  PROJECT_MARKING: (projectId: string) => `/projects/${projectId}/marking`,
  PROJECT_MARKING_SUBMISSION: (projectId: string, submissionId: string) =>
    `/projects/${projectId}/marking/${submissionId}`,
  TAKE_TEST: (projectId: string) => `/take/${projectId}`,
  TAKE_TEST_START: (projectId: string, submissionId: string) =>
    `/take/${projectId}/${submissionId}`,
  TAKE_TEST_SUCCESS: (projectId: string, submissionId: string) =>
    `/take/${projectId}/${submissionId}/success`,
} as const;
