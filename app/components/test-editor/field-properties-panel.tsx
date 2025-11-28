"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Plus, X } from "lucide-react";
import { FileUpload } from "~/components/ui/file-upload";
import { LatexEditor } from "./latex-editor";
import { LatexTextRenderer } from "./latex-text-renderer";
import type { TestField } from "./field-renderer";
import type { FieldType } from "./field-types";

interface FieldPropertiesPanelProps {
  field: TestField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (field: TestField) => void;
}

export function FieldPropertiesPanel({
  field,
  open,
  onOpenChange,
  onUpdate,
}: FieldPropertiesPanelProps) {
  const [localField, setLocalField] = useState<TestField | null>(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  if (!localField) return null;

  const needsOptions =
    localField.type === "multipleChoice" ||
    localField.type === "checkboxes" ||
    localField.type === "dropdown" ||
    localField.type === "imageChoice";

  const isQuestionType =
    localField.type === "multipleChoice" ||
    localField.type === "checkboxes" ||
    localField.type === "dropdown" ||
    localField.type === "imageChoice";

  const isTextInput = localField.type === "shortInput" || localField.type === "longInput";
  
  const isInputOrChoiceType = isQuestionType || isTextInput;

  const handleUpdate = (updates: Partial<TestField>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleLabelChange = (label: string) => {
    handleUpdate({ label });
  };

  const handleRequiredChange = (required: boolean) => {
    handleUpdate({ required });
  };

  const handlePlaceholderChange = (placeholder: string) => {
    handleUpdate({ placeholder });
  };

  const handleHelpTextChange = (helpText: string) => {
    handleUpdate({ helpText });
  };

  const handleFileUrlChange = (fileUrl: string | undefined) => {
    handleUpdate({ fileUrl });
  };

  const handleLatexContentChange = (latexContent: string) => {
    handleUpdate({ latexContent });
  };

  const handleMinLengthChange = (minLength: number) => {
    handleUpdate({ minLength });
  };

  const handleMaxLengthChange = (maxLength: number) => {
    handleUpdate({ maxLength });
  };

  const handlePatternChange = (pattern: string) => {
    handleUpdate({ pattern });
  };

  const handleWidthChange = (width: string) => {
    handleUpdate({ width });
  };

  const handleMarksChange = (marks: number) => {
    handleUpdate({ marks });
  };

  const handleOptionAdd = () => {
    const newOptions = [...(localField.options || []), ""];
    handleUpdate({ options: newOptions });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = value;
    handleUpdate({ options: newOptions });
  };

  const handleOptionRemove = (index: number) => {
    const newOptions = [...(localField.options || [])];
    newOptions.splice(index, 1);
    const newCorrectAnswers = (localField.correctAnswers || [])
      .filter((ans) => ans !== index)
      .map((ans) => (ans > index ? ans - 1 : ans));
    handleUpdate({ options: newOptions, correctAnswers: newCorrectAnswers });
  };

  const handleCorrectAnswerChange = (index: number, checked: boolean) => {
    const currentAnswers = localField.correctAnswers || [];
    if (localField.type === "checkboxes") {
      if (checked) {
        handleUpdate({ correctAnswers: [...currentAnswers, index] });
      } else {
        handleUpdate({
          correctAnswers: currentAnswers.filter((ans) => ans !== index),
        });
      }
    } else {
      handleUpdate({ correctAnswers: checked ? [index] : [] });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-0 bg-white border-l shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 z-10">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">Field Properties</SheetTitle>
            <SheetDescription className="text-slate-500">
              Configure the behavior and appearance of this field
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Properties */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-lg font-semibold text-slate-900">Basic Info</h3>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="field-label" className="text-sm font-medium text-slate-700">Field Label</Label>
                <Input
                  id="field-label"
                  value={localField.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Enter the question or prompt"
                  className="h-11 text-base"
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <Checkbox
                  id="field-required"
                  checked={localField.required || false}
                  onCheckedChange={(checked) =>
                    handleRequiredChange(checked === true)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="field-required" className="cursor-pointer font-medium text-slate-700 flex-1">
                  Required Answer
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    Respondents must answer this question
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Display Properties */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h3 className="text-lg font-semibold text-slate-900">Content & Display</h3>
            </div>

            <div className="space-y-5">
              {isTextInput && (
                <div className="space-y-2">
                  <Label htmlFor="field-placeholder" className="text-sm font-medium text-slate-700">Placeholder Text</Label>
                  <Input
                    id="field-placeholder"
                    value={localField.placeholder || ""}
                    onChange={(e) => handlePlaceholderChange(e.target.value)}
                    placeholder="Example answer..."
                    className="h-10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Image Attachment</Label>
                <div className="p-1">
                  <FileUpload
                    endpoint="imageUploader"
                    value={localField.fileUrl}
                    onUploadComplete={(url) => handleFileUrlChange(url)}
                    onRemove={() => handleFileUrlChange(undefined)}
                    variant="button"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <LatexEditor
                  label="Math Formula (LaTeX)"
                  value={localField.latexContent || ""}
                  onChange={handleLatexContentChange}
                  placeholder="e.g. x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-help-text" className="text-sm font-medium text-slate-700">Help Text / Instructions</Label>
                <Textarea
                  id="field-help-text"
                  value={localField.helpText || ""}
                  onChange={(e) => handleHelpTextChange(e.target.value)}
                  placeholder="Additional instructions for the respondent..."
                  rows={3}
                  className="resize-none text-sm bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-width" className="text-sm font-medium text-slate-700">Width</Label>
                <Select
                  value={localField.width || "full"}
                  onValueChange={handleWidthChange}
                >
                  <SelectTrigger id="field-width" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width (100%)</SelectItem>
                    <SelectItem value="half">Half Width (50%)</SelectItem>
                    <SelectItem value="third">Third Width (33%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Validation Rules */}
          {isTextInput && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-amber-500 rounded-full" />
                <h3 className="text-lg font-semibold text-slate-900">Validation</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-min-length" className="text-sm font-medium text-slate-700">Min Length</Label>
                    <Input
                      id="field-min-length"
                      type="number"
                      min="0"
                      value={localField.minLength || ""}
                      onChange={(e) =>
                        handleMinLengthChange(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-max-length" className="text-sm font-medium text-slate-700">Max Length</Label>
                    <Input
                      id="field-max-length"
                      type="number"
                      min="0"
                      value={localField.maxLength || ""}
                      onChange={(e) =>
                        handleMaxLengthChange(parseInt(e.target.value) || 0)
                      }
                      placeholder="Unlimited"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-pattern" className="text-sm font-medium text-slate-700">Pattern (Regex)</Label>
                  <Input
                    id="field-pattern"
                    value={localField.pattern || ""}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="e.g., ^[A-Za-z]+$"
                    className="h-10 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Regular expression for advanced validation</p>
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          {needsOptions && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-slate-900">Options</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground px-2 pb-2 border-b border-slate-100">
                  <span>Option Label</span>
                  {isQuestionType && <span>Correct?</span>}
                </div>
                {(localField.options || []).map((option, index) => {
                  const isCorrect = (localField.correctAnswers || []).includes(index);
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center gap-3 p-1">
                        <div className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className="h-10"
                          />
                        </div>
                      {isQuestionType && (
                        <div className="flex items-center justify-center w-10">
                          <Checkbox
                            id={`panel-option-correct-${localField.id}-${index}`}
                            checked={isCorrect}
                            onCheckedChange={(checked) =>
                              handleCorrectAnswerChange(index, checked === true)
                            }
                            className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                        </div>
                      )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOptionRemove(index)}
                          className="h-10 w-10 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {option && (option.includes('$') || option.includes('$$')) && (
                        <div className="ml-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-sm">
                          <span className="text-xs text-slate-500 mr-2">Preview:</span>
                          <LatexTextRenderer text={option} />
                        </div>
                      )}
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleOptionAdd}
                  className="w-full mt-4 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Marks */}
          {isInputOrChoiceType && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
               <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-slate-900">Grading</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-marks" className="text-sm font-medium text-slate-700">Points / Marks</Label>
                <Input
                  id="field-marks"
                  type="number"
                  min="0"
                  step="0.5"
                  value={localField.marks ?? 1}
                  onChange={(e) =>
                    handleMarksChange(parseFloat(e.target.value) || 0)
                  }
                  className="h-10 w-32"
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

