import {
  Type,
  ListOrdered,
  CheckSquare,
  FileText,
  Upload,
  Star,
  Calendar,
  Sliders,
  Link,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export type FieldType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkbox"
  | "file_upload"
  | "rating"
  | "date"
  | "scale"
  | "url";

interface FieldIconProps {
  type: FieldType;
  className?: string;
}

const fieldIconMap: Record<FieldType, LucideIcon> = {
  short_text: Type,
  long_text: FileText,
  multiple_choice: ListOrdered,
  checkbox: CheckSquare,
  file_upload: Upload,
  rating: Star,
  date: Calendar,
  scale: Sliders,
  url: Link,
};

export function FieldIcon({ type, className }: FieldIconProps) {
  const Icon = fieldIconMap[type] || Type;
  return <Icon className={cn("h-4 w-4", className)} />;
}

export function getFieldIcon(type: FieldType): LucideIcon {
  return fieldIconMap[type] || Type;
}

export function getFieldLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    short_text: "Short Text",
    long_text: "Long Text",
    multiple_choice: "Multiple Choice",
    checkbox: "Checkbox",
    file_upload: "File Upload",
    rating: "Rating",
    date: "Date",
    scale: "Scale",
    url: "URL",
  };
  return labels[type] || "Unknown";
}
