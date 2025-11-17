"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Type,
  FileText,
  List,
  CheckSquare,
  ChevronDown,
  Image,
  Upload,
  FileX,
  Info,
  Plus,
  X,
  Settings,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { FieldType } from "./field-types";

export interface TestField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  order: number;
  correctAnswers?: number[];
  marks?: number;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  width?: string;
}

interface FieldRendererProps {
  field: TestField;
  onUpdate: (field: TestField) => void;
  onDelete: (fieldId: string) => void;
  fieldRef?: (el: HTMLDivElement | null) => void;
  onSettingsClick?: (field: TestField) => void;
}

const FieldIcons: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  shortInput: Type,
  longInput: FileText,
  multipleChoice: List,
  checkboxes: CheckSquare,
  dropdown: ChevronDown,
  imageChoice: Image,
  fileUpload: Upload,
  pageBreak: FileX,
  infoBlock: Info,
};

export function FieldRenderer({
  field,
  onUpdate,
  onDelete,
  fieldRef,
  onSettingsClick,
}: FieldRendererProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FieldIcons[field.type];

  const handleLabelChange = (label: string) => {
    onUpdate({ ...field, label });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ ...field, required });
  };

  const handleOptionAdd = () => {
    const newOptions = [...(field.options || []), ""];
    onUpdate({ ...field, options: newOptions });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ ...field, options: newOptions });
  };

  const handleOptionRemove = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    // Remove correct answer if it was for this option
    const newCorrectAnswers = (field.correctAnswers || []).filter((ans) => {
      if (ans >= index) {
        return ans !== index;
      }
      return true;
    }).map((ans) => ans > index ? ans - 1 : ans);
    onUpdate({ ...field, options: newOptions, correctAnswers: newCorrectAnswers });
  };

  const handleCorrectAnswerChange = (index: number, checked: boolean) => {
    const currentAnswers = field.correctAnswers || [];
    if (field.type === "checkboxes") {
      // Multiple selection for checkboxes
      if (checked) {
        onUpdate({ ...field, correctAnswers: [...currentAnswers, index] });
      } else {
        onUpdate({ ...field, correctAnswers: currentAnswers.filter((ans) => ans !== index) });
      }
    } else {
      // Single selection for multipleChoice/dropdown - replace previous selection
      onUpdate({ ...field, correctAnswers: checked ? [index] : [] });
    }
  };

  const handleMarksChange = (marks: number) => {
    onUpdate({ ...field, marks });
  };

  const needsOptions =
    field.type === "multipleChoice" ||
    field.type === "checkboxes" ||
    field.type === "dropdown" ||
    field.type === "imageChoice";

  const isEditable = field.type !== "pageBreak" && field.type !== "infoBlock";
  
  const isQuestionType = field.type === "multipleChoice" || field.type === "checkboxes" || field.type === "dropdown";

  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    fieldRef?.(el);
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        "group relative border-2 border-border rounded-lg p-4 bg-card transition-all",
        isDragging && "opacity-50 border-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            {isEditable ? (
              <div className="flex-1">
                <Input
                  value={field.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Field label"
                  className="font-medium"
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="font-medium text-sm text-muted-foreground">
                  {field.type === "pageBreak" ? "Page Break" : "Info Block"}
                </div>
              </div>
            )}
            {isEditable && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required || false}
                  onCheckedChange={(checked) =>
                    handleRequiredChange(checked === true)
                  }
                />
                <Label
                  htmlFor={`required-${field.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Required
                </Label>
              </div>
            )}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSettingsClick(field)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Field settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(field.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {needsOptions && (
            <div className="space-y-2 pl-9">
              <Label className="text-sm text-muted-foreground">Options</Label>
              {(field.options || []).map((option, index) => {
                const isCorrect = (field.correctAnswers || []).includes(index);
                return (
                  <div key={index} className="flex items-center gap-2">
                    {isQuestionType && (
                      <Checkbox
                        id={`option-correct-${field.id}-${index}`}
                        checked={isCorrect}
                        onCheckedChange={(checked) =>
                          handleCorrectAnswerChange(index, checked === true)
                        }
                        title="Mark as correct answer"
                      />
                    )}
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOptionRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptionAdd}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {isQuestionType && (
            <div className="space-y-3 pl-9 border-t pt-3">
              <div className="flex items-center gap-4">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm text-muted-foreground">Marks</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={field.marks ?? 1}
                    onChange={(e) => handleMarksChange(parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          )}

          {field.type === "longInput" && (
            <div className="pl-9">
              <Textarea
                placeholder="Preview of long input field"
                disabled
                className="resize-none"
              />
            </div>
          )}

          {field.type === "infoBlock" && (
            <div className="pl-9">
              <Textarea
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter information to display"
                className="resize-none"
              />
            </div>
          )}

          {field.type === "fileUpload" && (
            <div className="pl-9">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  File upload field (UploadThing integration coming soon)
                </p>
              </div>
            </div>
          )}

          {field.type === "imageChoice" && field.options && field.options.length > 0 && (
            <div className="pl-9">
              <div className="grid grid-cols-2 gap-4">
                {field.options.map((option, index) => {
                  const isCorrect = (field.correctAnswers || []).includes(index);
                  return (
                    <div key={index} className="relative">
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          id={`image-correct-${field.id}-${index}`}
                          checked={isCorrect}
                          onCheckedChange={(checked) =>
                            handleCorrectAnswerChange(index, checked === true)
                          }
                          title="Mark as correct answer"
                          className="bg-background"
                        />
                      </div>
                      <div className="border-2 border-border rounded-lg p-4 aspect-square flex items-center justify-center bg-muted/30">
                        {option ? (
                          <span className="text-sm">{option}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Image option {index + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {field.type === "pageBreak" && (
            <div className="pl-9">
              <div className="border-t-2 border-dashed border-border my-4">
                <div className="text-center -mt-3">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    Page Break
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

