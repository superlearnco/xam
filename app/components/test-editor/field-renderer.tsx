"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useAction } from "convex/react";
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
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { FileUpload } from "~/components/ui/file-upload";
import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { FieldType } from "./field-types";
import { FIELD_TYPES } from "./field-types";
import katex from "katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { LatexTextRenderer } from "./latex-text-renderer";

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
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: field.id,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const generateDummyAnswers = useAction(api.tests.generateDummyAnswers);

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

  const getGenerateDistractorsState = () => {
    // Check if button should be enabled
    if (!field.label) {
      return { disabled: true, message: "Please enter a question first" };
    }
    const currentCorrectIndices = field.correctAnswers || [];
    if (currentCorrectIndices.length === 0) {
      return { disabled: true, message: "Please mark at least one correct answer" };
    }
    const correctOptions = currentCorrectIndices.map(idx => field.options?.[idx]).filter(Boolean) as string[];
    if (correctOptions.length === 0) {
      return { disabled: true, message: "Please fill in the correct answer text" };
    }
    return { disabled: false, message: "" };
  };

  const handleGenerateDistractors = async () => {
    if (!field.label) {
        toast.error("Please enter a question first");
        return;
    }
    const currentCorrectIndices = field.correctAnswers || [];
    if (currentCorrectIndices.length === 0) {
        toast.error("Please mark at least one correct answer");
        return;
    }

    const correctOptions = currentCorrectIndices.map(idx => field.options?.[idx]).filter(Boolean) as string[];
    if (correctOptions.length === 0) {
         toast.error("Please fill in the correct answer text");
         return;
    }

    setIsGenerating(true);
    try {
        const distractors = await generateDummyAnswers({
            question: field.label,
            correctAnswers: correctOptions
        });
        
        // Add to options
        const currentOptions = field.options || [];
        onUpdate({
            ...field,
            options: [...currentOptions, ...distractors]
        });
        toast.success("Distractors generated!");
    } catch (error) {
        toast.error("Failed to generate distractors: " + (error as Error).message);
    } finally {
        setIsGenerating(false);
    }
  };

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
    setSortableRef(el);
    setDroppableRef(el);
    fieldRef?.(el);
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        "group relative p-6 transition-all duration-200 rounded-2xl border bg-white",
        isDragging 
          ? "opacity-90 border-primary shadow-xl scale-[1.02] z-50 rotate-1" 
          : "border-slate-200 hover:border-primary/30 hover:shadow-md",
        isOver && !isDragging && "ring-2 ring-primary/30 ring-inset bg-primary/5"
      )}
    >
      <div className="flex items-start gap-5">
        <button
          {...attributes}
          {...listeners}
          className="mt-3 cursor-grab active:cursor-grabbing text-slate-300 hover:text-primary transition-colors p-1.5 hover:bg-primary/5 rounded-md -ml-2"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 space-y-6">
          <div className="flex items-start gap-4">
            {isEditable ? (
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                   <div className="mt-1 p-2 rounded-lg bg-primary/5 text-primary ring-1 ring-primary/10 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <Input
                          value={field.label}
                          onChange={(e) => handleLabelChange(e.target.value)}
                          placeholder="Type your question here..."
                          className="text-lg font-medium text-slate-900 border-0 border-b border-slate-200 focus:border-primary focus:border-b-2 rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-slate-400 transition-all hover:border-slate-300 h-auto py-1.5"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-4 pl-[52px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    <span className="">{fieldTypeLabel}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`required-${field.id}`}
                      checked={field.required || false}
                      onCheckedChange={(checked) =>
                        handleRequiredChange(checked === true)
                      }
                      className="h-4 w-4 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[4px]"
                    />
                    <Label
                      htmlFor={`required-${field.id}`}
                      className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                    >
                      Required
                    </Label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    <Icon className="h-4 w-4" />
                 </div>
                <div>
                    <div className="text-lg font-semibold text-slate-900">
                    {field.type === "pageBreak" ? "Page Break" : "Info Block"}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{fieldTypeLabel}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
              {onSettingsClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSettingsClick(field)}
                  title="Field settings"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(field.id)}
                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {displayFileUrl && (
            <div className="pl-[52px]">
              <div className="relative inline-block border border-slate-100 rounded-xl overflow-hidden bg-slate-50 max-w-full group/image shadow-sm">
                <img 
                  src={displayFileUrl} 
                  alt="Question attachment" 
                  className="max-h-80 object-contain"
                  onError={(e) => {
                    console.warn("Image failed to load:", displayFileUrl);
                  }}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/image:opacity-100 transition-all shadow-sm hover:bg-white hover:text-destructive"
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
            <div className="pl-[52px]">
              <div 
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 overflow-x-auto"
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
            <div className="space-y-3 pl-[52px]">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Answer Options</Label>
              <div className="space-y-2.5">
              {(field.options || []).map((option, index) => {
                const isCorrect = (field.correctAnswers || []).includes(index);
                return (
                  <div key={index} className="flex items-center gap-3 group/option">
                    {isQuestionType && (
                        <div className="relative">
                          <Checkbox
                            id={`option-correct-${field.id}-${index}`}
                            checked={isCorrect}
                            onCheckedChange={(checked) =>
                              handleCorrectAnswerChange(index, checked === true)
                            }
                            title="Mark as correct answer"
                            className={cn(
                                "h-5 w-5 border-slate-300 rounded-full transition-all",
                                isCorrect ? "bg-green-500 border-green-500 text-white" : "hover:border-primary"
                            )}
                          />
                        </div>
                    )}
                    <div className="flex-1 relative">
                        <Input
                        value={option}
                        onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className={cn(
                            "font-normal text-base border border-slate-200 focus-visible:ring-1 focus-visible:ring-primary rounded-lg px-3.5 py-2 bg-white transition-all hover:border-slate-300 shadow-sm",
                            isCorrect && "border-green-200 bg-green-50/30 text-green-900 font-medium"
                        )}
                        />
                        {option && (option.includes('$') || option.includes('$$')) && (
                          <div className="mt-1.5 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-sm">
                            <LatexTextRenderer text={option} />
                          </div>
                        )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOptionRemove(index)}
                      className="opacity-0 group-hover/option:opacity-100 transition-all text-slate-300 hover:text-destructive hover:bg-destructive/5 rounded-lg h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOptionAdd}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 font-medium h-9 px-3 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Add Option
                </Button>

                {isEditable && field.type !== "imageChoice" && (() => {
                  const { disabled, message } = getGenerateDistractorsState();
                  const button = (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateDistractors}
                      disabled={isGenerating || disabled}
                      className={cn(
                        "text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium h-9 px-3 rounded-lg",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Sparkles className={cn("h-3.5 w-3.5 mr-2", isGenerating && "animate-spin")} />
                      {isGenerating ? "Generating..." : "Generate Distractors"}
                    </Button>
                  );

                  if (disabled && message) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            {button}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{message}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return button;
                })()}
              </div>
            </div>
          )}

          {isInputOrChoiceType && (
            <div className="pl-[52px] border-t border-slate-100 pt-5 mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-medium text-slate-500">Points:</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={field.marks ?? 1}
                    onChange={(e) => handleMarksChange(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 font-mono border-slate-200 focus-visible:ring-primary rounded-md text-center bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          {field.type === "longInput" && (
            <div className="pl-[52px]">
              <div className="relative">
                <div className="absolute inset-0 bg-slate-50/50 z-10 rounded-lg" />
                <Textarea
                    placeholder="The student's answer will appear here..."
                    disabled
                    className="resize-none min-h-[100px] border-slate-200 bg-white text-base rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {field.type === "infoBlock" && (
            <div className="pl-[52px]">
              <Textarea
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter information to display (Markdown supported)"
                className="resize-none min-h-[100px] text-base bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-lg shadow-inner"
              />
            </div>
          )}

          {field.type === "imageChoice" && field.options && field.options.length > 0 && (
            <div className="pl-[52px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {field.options.map((option, index) => {
                  const isCorrect = (field.correctAnswers || []).includes(index);
                  const imageUrl = option && option.startsWith("http") ? option : undefined;
                  return (
                    <div key={index} className="relative group/image-option">
                      <div className="absolute top-2 left-2 z-20">
                        <Checkbox
                          id={`image-correct-${field.id}-${index}`}
                          checked={isCorrect}
                          onCheckedChange={(checked) =>
                            handleCorrectAnswerChange(index, checked === true)
                          }
                          title="Mark as correct answer"
                          className={cn(
                              "bg-white border-slate-200 shadow-md h-5 w-5 rounded-full transition-all",
                              isCorrect ? "bg-green-500 border-green-500 text-white" : "hover:border-primary"
                          )}
                        />
                      </div>
                      <div className={cn(
                          "border rounded-xl p-1 aspect-square bg-slate-50 overflow-hidden transition-all shadow-sm",
                          isCorrect ? "border-green-500 ring-2 ring-green-500/20" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      )}>
                        {imageUrl ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imageUrl}
                              alt={`Image choice ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover/image-option:opacity-100 transition-all shadow-sm hover:bg-white hover:text-destructive bg-white/90 backdrop-blur-sm"
                              onClick={() => handleOptionChange(index, "")}
                              title="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center bg-white rounded-lg border border-dashed border-slate-200">
                            <FileUpload
                              endpoint="imageUploader"
                              onUploadComplete={(url) => {
                                handleOptionChange(index, url);
                              }}
                              onUploadError={(error) => {
                                // Error handling is done by FileUpload component
                              }}
                              variant="dropzone"
                              className="h-full w-full opacity-70 hover:opacity-100 transition-opacity"
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
            <div className="pl-[52px]">
              <div className="flex items-center gap-4 py-2 opacity-75">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Page Break</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

