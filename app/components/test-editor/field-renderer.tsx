"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import {
  GripVertical,
  Trash2,
  Type,
  FileText,
  List,
  CheckSquare,
  ChevronDown,
  Image,
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
import { FileUpload } from "~/components/ui/file-upload";
import { cn } from "~/lib/utils";
import type { FieldType } from "./field-types";
import { FIELD_TYPES } from "./field-types";
import katex from "katex";
import "katex/dist/katex.min.css";

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
  fileUrl?: string;
  latexContent?: string;
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
  
  // Get field type label
  const fieldTypeConfig = FIELD_TYPES.find(ft => ft.type === field.type);
  const fieldTypeLabel = fieldTypeConfig?.label || field.type;

  // Handle file URL - check if it's a storage ID and convert to URL
  const isStorageId = field.fileUrl?.startsWith("k") && field.fileUrl.length > 10;
  const storageId = isStorageId ? (field.fileUrl as Id<"_storage">) : undefined;
  const fileUrlFromQuery = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId } : "skip"
  );
  
  // Use query result if we have a storage ID, otherwise use fileUrl directly
  const displayFileUrl = storageId 
    ? (fileUrlFromQuery || (isStorageId ? undefined : field.fileUrl))
    : field.fileUrl;

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
  
  const isQuestionType = field.type === "multipleChoice" || field.type === "checkboxes" || field.type === "dropdown" || field.type === "imageChoice";
  
  const isInputOrChoiceType = isQuestionType || field.type === "shortInput" || field.type === "longInput";

  const combinedRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    fieldRef?.(el);
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        "group relative p-5 transition-all rounded-xl border bg-white shadow-sm hover:shadow-md",
        isDragging 
          ? "opacity-50 border-primary/50 shadow-xl z-50 ring-2 ring-primary/20" 
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-3 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-md"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-primary/5 text-primary hidden sm:block ring-1 ring-inset ring-primary/10">
              <Icon className="h-5 w-5" />
            </div>
            {isEditable ? (
              <div className="flex-1 space-y-3">
                <Input
                  value={field.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Question Text"
                  className="text-lg font-medium border-0 border-b border-transparent focus:border-primary rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-slate-400 transition-all hover:border-slate-200"
                />
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full">{fieldTypeLabel}</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`required-${field.id}`}
                      checked={field.required || false}
                      onCheckedChange={(checked) =>
                        handleRequiredChange(checked === true)
                      }
                      className="h-4 w-4 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-sm"
                    />
                    <Label
                      htmlFor={`required-${field.id}`}
                      className="cursor-pointer hover:text-slate-700"
                    >
                      Required
                    </Label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-900 pb-1">
                  {field.type === "pageBreak" ? "Page Break" : "Info Block"}
                </div>
                <div className="flex mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-medium text-slate-500">{fieldTypeLabel}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onSettingsClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSettingsClick(field)}
                  title="Field settings"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(field.id)}
                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {displayFileUrl && (
            <div className="pl-0 sm:pl-14">
              <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden bg-slate-50 max-w-full group/image shadow-sm">
                <img 
                  src={displayFileUrl} 
                  alt="Question attachment" 
                  className="max-h-64 object-contain"
                  onError={(e) => {
                    console.warn("Image failed to load:", displayFileUrl);
                  }}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/image:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onUpdate({ ...field, fileUrl: undefined })}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {field.fileUrl && !displayFileUrl && storageId && (
            <div className="pl-9">
              <div className="border rounded-lg p-4 bg-muted/30 max-w-full">
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}

          {field.latexContent && (
            <div className="pl-0 sm:pl-14">
              <div 
                className="p-3 rounded-lg bg-slate-50/50 border border-slate-200 overflow-x-auto"
                dangerouslySetInnerHTML={{ 
                  __html: katex.renderToString(field.latexContent, { 
                    throwOnError: false,
                    displayMode: true 
                  }) 
                }}
              />
            </div>
          )}

          {needsOptions && (
            <div className="space-y-3 pl-0 sm:pl-14">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Options</Label>
              {(field.options || []).map((option, index) => {
                const isCorrect = (field.correctAnswers || []).includes(index);
                return (
                  <div key={index} className="flex items-center gap-3 group/option">
                    {isQuestionType && (
                      <Checkbox
                        id={`option-correct-${field.id}-${index}`}
                        checked={isCorrect}
                        onCheckedChange={(checked) =>
                          handleCorrectAnswerChange(index, checked === true)
                        }
                        title="Mark as correct answer"
                        className="h-5 w-5 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full transition-colors"
                      />
                    )}
                    <div className="flex-1 relative">
                        <Input
                        value={option}
                        onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="font-normal text-base border border-slate-200 focus-visible:ring-1 focus-visible:ring-primary rounded-md px-3 bg-white transition-colors hover:border-slate-300"
                        />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOptionRemove(index)}
                      className="opacity-0 group-hover/option:opacity-100 transition-opacity text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOptionAdd}
                className="ml-8 text-primary hover:text-primary/80 hover:bg-primary/5 font-medium mt-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {isInputOrChoiceType && (
            <div className="pl-0 sm:pl-14 border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Points</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={field.marks ?? 1}
                    onChange={(e) => handleMarksChange(parseFloat(e.target.value) || 0)}
                    className="w-24 font-mono border-slate-200 focus-visible:ring-primary rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {field.type === "longInput" && (
            <div className="pl-0 sm:pl-14">
              <div className="relative">
                <Textarea
                    placeholder="Long answer text area preview..."
                    disabled
                    className="resize-none min-h-[100px] border border-slate-200 bg-slate-50/30 text-base rounded-md disabled:opacity-100 disabled:text-slate-400"
                />
              </div>
            </div>
          )}

          {field.type === "infoBlock" && (
            <div className="pl-0 sm:pl-14">
              <Textarea
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter information to display (Markdown supported)"
                className="resize-none min-h-[100px] text-base bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-md"
              />
            </div>
          )}

          {field.type === "imageChoice" && field.options && field.options.length > 0 && (
            <div className="pl-0 sm:pl-14">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {field.options.map((option, index) => {
                  const isCorrect = (field.correctAnswers || []).includes(index);
                  const imageUrl = option && option.startsWith("http") ? option : undefined;
                  return (
                    <div key={index} className="relative group/image-option">
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          id={`image-correct-${field.id}-${index}`}
                          checked={isCorrect}
                          onCheckedChange={(checked) =>
                            handleCorrectAnswerChange(index, checked === true)
                          }
                          title="Mark as correct answer"
                          className="bg-white border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm"
                        />
                      </div>
                      <div className="border border-slate-200 rounded-lg p-1 aspect-square bg-slate-50 overflow-hidden hover:border-slate-400 transition-colors hover:shadow-sm">
                        {imageUrl ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imageUrl}
                              alt={`Image choice ${index + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover/image-option:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleOptionChange(index, "")}
                              title="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center bg-white rounded-md">
                            <FileUpload
                              endpoint="imageUploader"
                              onUploadComplete={(url) => {
                                handleOptionChange(index, url);
                              }}
                              onUploadError={(error) => {
                                // Error handling is done by FileUpload component
                              }}
                              variant="dropzone"
                              className="h-full w-full opacity-50 hover:opacity-100 transition-opacity"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {field.type === "pageBreak" && (
            <div className="pl-0 sm:pl-14">
              <div className="flex items-center gap-4 py-4 opacity-60">
                <div className="h-px bg-slate-300 flex-1"></div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">Page Break</span>
                <div className="h-px bg-slate-300 flex-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

