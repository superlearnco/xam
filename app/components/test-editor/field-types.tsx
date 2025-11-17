"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  FileText,
  List,
  CheckSquare,
  ChevronDown,
  Image,
  Upload,
  FileX,
  Info,
} from "lucide-react";
import { cn } from "~/lib/utils";

export type FieldType =
  | "shortInput"
  | "longInput"
  | "multipleChoice"
  | "checkboxes"
  | "dropdown"
  | "imageChoice"
  | "fileUpload"
  | "pageBreak"
  | "infoBlock";

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const FIELD_TYPES: FieldTypeConfig[] = [
  {
    type: "shortInput",
    label: "Short Input",
    icon: Type,
    description: "Single line text input",
  },
  {
    type: "longInput",
    label: "Long Input",
    icon: FileText,
    description: "Multi-line text input",
  },
  {
    type: "multipleChoice",
    label: "Multiple Choice",
    icon: List,
    description: "Single selection from options",
  },
  {
    type: "checkboxes",
    label: "Checkboxes",
    icon: CheckSquare,
    description: "Multiple selections",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDown,
    description: "Dropdown selection",
  },
  {
    type: "imageChoice",
    label: "Image Choice",
    icon: Image,
    description: "Select from images",
  },
  {
    type: "fileUpload",
    label: "File Upload",
    icon: Upload,
    description: "Upload files",
  },
  {
    type: "pageBreak",
    label: "Page Break",
    icon: FileX,
    description: "Separate pages",
  },
  {
    type: "infoBlock",
    label: "Info Block",
    icon: Info,
    description: "Display information",
  },
];

interface DraggableFieldTypeProps {
  fieldType: FieldTypeConfig;
  onClick?: () => void;
}

export function DraggableFieldType({ fieldType, onClick }: DraggableFieldTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `field-type-${fieldType.type}`,
      data: {
        type: "field-type",
        fieldType: fieldType.type,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const Icon = fieldType.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 border-border bg-card cursor-pointer transition-all hover:border-primary hover:bg-accent",
        isDragging && "opacity-50"
      )}
    >
      <div className="p-2 rounded-md bg-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{fieldType.label}</div>
        <div className="text-xs text-muted-foreground">
          {fieldType.description}
        </div>
      </div>
    </div>
  );
}

interface FieldTypesSidebarProps {
  onFieldTypeClick?: (fieldType: FieldType) => void;
}

export function FieldTypesSidebar({ onFieldTypeClick }: FieldTypesSidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/30 p-4 space-y-2 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Field Types
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click or drag to add to your test
        </p>
      </div>
      {FIELD_TYPES.map((fieldType) => (
        <DraggableFieldType 
          key={fieldType.type} 
          fieldType={fieldType}
          onClick={() => onFieldTypeClick?.(fieldType.type)}
        />
      ))}
    </div>
  );
}

