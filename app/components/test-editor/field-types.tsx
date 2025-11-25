"use client";

import { useRef } from "react";
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
  isFirstItem?: boolean;
}

export function DraggableFieldType({ fieldType, onClick, isFirstItem }: DraggableFieldTypeProps) {
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  
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

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if mouse didn't move much (not a drag)
    if (dragStartPos.current) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      const moved = deltaX > 5 || deltaY > 5;
      
      if (moved || isDragging) {
        e.preventDefault();
        e.stopPropagation();
        dragStartPos.current = null;
        return;
      }
    }
    onClick?.();
    dragStartPos.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5",
        isDragging && "opacity-50 ring-2 ring-primary/20 shadow-xl rotate-2"
      )}
      {...(isFirstItem ? { "data-onboarding": "field-type-item" } : {})}
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
    <div 
      className="w-80 border-r bg-slate-50/50 hidden lg:block flex flex-col flex-shrink-0 overflow-hidden h-full"
      data-onboarding="field-types-sidebar"
    >
      <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 max-h-full">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Field Types
          </h2>
          <p className="text-sm text-slate-500">
            Drag fields to build your test
          </p>
        </div>
        <div className="space-y-3">
          {FIELD_TYPES.map((fieldType, index) => (
            <DraggableFieldType 
              key={fieldType.type} 
              fieldType={fieldType}
              onClick={() => onFieldTypeClick?.(fieldType.type)}
              isFirstItem={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

