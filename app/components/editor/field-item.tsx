import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { getFieldIcon, getFieldLabel } from "~/components/shared/field-icon";
import { cn } from "~/lib/utils";
import { MultipleChoiceEditor } from "./fields/multiple-choice-editor";
import { CheckboxEditor } from "./fields/checkbox-editor";
import { OptionsEditor } from "./fields/options-editor";
import type { Field } from "./form-builder";
import type { Id } from "../../../convex/_generated/dataModel";

interface FieldItemProps {
  field: Field;
  index: number;
  projectType: "test" | "essay" | "survey";
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

export function FieldItem({
  field,
  index,
  projectType,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: FieldItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getFieldIcon(field.type as any);
  const fieldLabel = getFieldLabel(field.type as any);

  const handleQuestionChange = (value: string) => {
    onUpdate({ question: value });
  };

  const handleDescriptionChange = (value: string) => {
    onUpdate({ description: value });
  };

  const handleMarksChange = (value: string) => {
    const marks = parseInt(value) || 0;
    onUpdate({ marks });
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdate({ required: checked });
  };

  const showMarks = projectType === "test" || projectType === "essay";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".no-select")) {
          return;
        }
        onSelect();
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground no-select"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Icon and Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <Icon className="h-3 w-3" />
                  {fieldLabel}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Question {index + 1}
                </span>
                {field.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
                {showMarks && field.marks !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {field.marks} {field.marks === 1 ? "mark" : "marks"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 no-select">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this field?")) {
                      onDelete();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Question Preview (collapsed) */}
            {!isExpanded && (
              <div className="text-sm">
                <p className="font-medium line-clamp-2">
                  {field.question || "Untitled Question"}
                </p>
                {field.description && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                    {field.description}
                  </p>
                )}
              </div>
            )}

            {/* Expanded Editor */}
            {isExpanded && (
              <div className="space-y-4 mt-4 no-select">
                {/* Question Input */}
                <div className="space-y-2">
                  <Label htmlFor={`question-${field._id}`}>Question</Label>
                  <Textarea
                    id={`question-${field._id}`}
                    value={field.question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Enter your question..."
                    rows={2}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor={`description-${field._id}`}>
                    Description (optional)
                  </Label>
                  <Input
                    id={`description-${field._id}`}
                    value={field.description || ""}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Add help text..."
                  />
                </div>

                {/* Field-specific editors */}
                {field.type === "multiple_choice" && (
                  <MultipleChoiceEditor
                    fieldId={field._id as Id<"fields">}
                    question={field.question}
                    options={field.options || []}
                    correctAnswer={
                      typeof field.correctAnswer === "string"
                        ? field.correctAnswer
                        : undefined
                    }
                    onUpdate={(updates) => onUpdate(updates)}
                    projectType={projectType}
                  />
                )}

                {field.type === "checkbox" && (
                  <CheckboxEditor
                    options={field.options || []}
                    correctAnswers={
                      Array.isArray(field.correctAnswer)
                        ? field.correctAnswer
                        : []
                    }
                    onUpdate={(updates) => onUpdate(updates)}
                    projectType={projectType}
                  />
                )}

                {field.type === "dropdown" && (
                  <OptionsEditor
                    options={field.options || []}
                    onUpdate={(options) => onUpdate({ options })}
                  />
                )}

                {/* Common Settings */}
                <div className="pt-4 border-t space-y-4">
                  {showMarks && (
                    <div className="space-y-2">
                      <Label htmlFor={`marks-${field._id}`}>Marks</Label>
                      <Input
                        id={`marks-${field._id}`}
                        type="number"
                        min="0"
                        value={field.marks || 0}
                        onChange={(e) => handleMarksChange(e.target.value)}
                        className="w-24"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`required-${field._id}`}>
                      Required field
                    </Label>
                    <Switch
                      id={`required-${field._id}`}
                      checked={field.required}
                      onCheckedChange={handleRequiredChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

