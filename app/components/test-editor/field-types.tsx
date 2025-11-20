"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  FileText,
  List,
  CheckSquare,
  ChevronDown,
  Image,
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
        "flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5",
        isDragging && "opacity-50 ring-2 ring-primary/20 shadow-xl rotate-2"
      )}
    >
      <div className="p-2 rounded-lg bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900">{fieldType.label}</div>
        <div className="text-xs text-slate-500 truncate">
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
    <div className="w-80 border-r bg-slate-50/50 p-6 space-y-6 overflow-y-auto hidden lg:block">
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Field Types
        </h2>
        <p className="text-sm text-slate-500">
          Drag fields to build your test
        </p>
      </div>
      <div className="space-y-3">
        {FIELD_TYPES.map((fieldType) => (
          <DraggableFieldType 
            key={fieldType.type} 
            fieldType={fieldType}
            onClick={() => onFieldTypeClick?.(fieldType.type)}
          />
        ))}
      </div>
    </div>
  );
}

