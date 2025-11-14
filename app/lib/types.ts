// Shared TypeScript types for the application

import type { Doc, Id } from "convex/_generated/dataModel";

// Re-export Convex types for convenience
export type { Id } from "convex/_generated/dataModel";

// Project Types
// TODO: Uncomment these after implementing the database schema in Phase 2
// export type Project = Doc<"projects">;
// export type Field = Doc<"fields">;
// export type ProjectOptions = Doc<"projectOptions">;
// export type Submission = Doc<"submissions">;
// export type Response = Doc<"responses">;
// export type Organization = Doc<"organizations">;
// export type AIUsage = Doc<"aiUsage">;
// export type AICredits = Doc<"aiCredits">;

// Placeholder types until database schema is created
export type Project = any;
export type Field = any;
export type ProjectOptions = any;
export type Submission = any;
export type Response = any;
export type Organization = any;
export type AIUsage = any;
export type AICredits = any;

// Field Type specific data structures
export interface MultipleChoiceData {
  options: string[];
  correctAnswer?: string;
}

export interface CheckboxData {
  options: string[];
  correctAnswers?: string[];
}

export interface DropdownData {
  options: string[];
}

export interface FileUploadData {
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface RatingData {
  ratingScale?: number;
  ratingLabels?: {
    min?: string;
    max?: string;
  };
}

export interface LinearScaleData {
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface NumberData {
  minValue?: number;
  maxValue?: number;
}

export interface TextData {
  minLength?: number;
  maxLength?: number;
}

// Response Value Types
export type ResponseValue =
  | string
  | string[]
  | number
  | boolean
  | {
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    };

// AI Generation Types
export interface AIGeneratedQuestion {
  type: string;
  question: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  rubric?: string;
}

export interface AIGeneratedTest {
  questions: AIGeneratedQuestion[];
}

export interface AIGradingResult {
  marks: number;
  maxMarks: number;
  feedback: string;
  reasoning?: string;
  isCorrect: boolean;
}

export interface AIGeneratedOptions {
  options: string[];
  reasoning?: string;
}

// Statistics Types
export interface ProjectStatistics {
  totalSubmissions: number;
  completedSubmissions: number;
  averageScore?: number;
  averageTime?: number;
  gradeDistribution?: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export interface SubmissionStatistics {
  submissionId: string; // Id<"submissions">;
  respondentName?: string;
  respondentEmail?: string;
  status: string;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  submittedAt?: number;
}

// Form Data Types
export interface CreateProjectFormData {
  name: string;
  type: "test" | "essay" | "survey";
  description?: string;
}

export interface UpdateProjectFormData {
  name?: string;
  description?: string;
}

export interface CreateFieldFormData {
  projectId: string; // Id<"projects">;
  type: string;
  question: string;
  description?: string;
  marks?: number;
  required?: boolean;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  ratingScale?: number;
  ratingLabels?: {
    min?: string;
    max?: string;
  };
  allowedFileTypes?: string[];
  maxFileSize?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface UpdateFieldFormData {
  fieldId: string; // Id<"fields">;
  question?: string;
  description?: string;
  marks?: number;
  required?: boolean;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  ratingScale?: number;
  ratingLabels?: {
    min?: string;
    max?: string;
  };
  allowedFileTypes?: string[];
  maxFileSize?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface UpdateProjectOptionsFormData {
  projectId: string; // Id<"projects">;
  headerTitle?: string;
  headerColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  logo?: string;
  requireLogin?: boolean;
  password?: string;
  allowedDomain?: string;
  timeLimit?: number;
  showProgressBar?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  instantFeedback?: boolean;
  showCorrectAnswers?: boolean;
  showScore?: boolean;
  allowMultipleSubmissions?: boolean;
  showSubmissionConfirmation?: boolean;
  confirmationMessage?: string;
  closeDate?: number;
  maxSubmissions?: number;
}

export interface CreateSubmissionFormData {
  projectId: string; // Id<"projects">;
  respondentName?: string;
  respondentEmail?: string;
}

export interface CreateResponseFormData {
  submissionId: string; // Id<"submissions">;
  fieldId: string; // Id<"fields">;
  projectId: string; // Id<"projects">;
  value: ResponseValue;
}

export interface MarkResponseFormData {
  responseId: string; // Id<"responses">;
  marksAwarded: number;
  feedback?: string;
  isCorrect: boolean;
}

// Credit and Billing Types
export interface PurchaseCreditsData {
  amount: number;
  transactionId: string;
}

export interface DeductCreditsData {
  cost: number;
  feature: string;
  metadata?: {
    projectId?: string; // Id<"projects">;
    submissionId?: string; // Id<"submissions">;
    model?: string;
    tokensInput?: number;
    tokensOutput?: number;
  };
}

export interface UsageHistoryItem {
  _id: string; // Id<"aiUsage">;
  _creationTime: number;
  feature: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  timestamp: number;
}

// Organization Types
export interface CreateOrganizationData {
  name: string;
}

export interface AddMemberData {
  orgId: string; // Id<"organizations">;
  userId: string;
}

// UI Component Props Types
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

// Editor Types
export interface FieldEditorProps {
  field: Field;
  onUpdate: (fieldId: string, data: Partial<Field>) => void;
  onDelete: (fieldId: string) => void;
}

export interface FieldPaletteItem {
  type: string;
  label: string;
  icon: string;
  description?: string;
}

// Test Taking Types
export interface TestFormData {
  [fieldId: string]: ResponseValue;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

// Marking Types
export interface MarkingContext {
  project: Project;
  submission: Submission;
  fields: Field[];
  responses: Response[];
}

export interface BulkMarkingData {
  submissionIds: string[]; // Id<"submissions">[];
  marks: number[];
  feedbacks: string[];
}
