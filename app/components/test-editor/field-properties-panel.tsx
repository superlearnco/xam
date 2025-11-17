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
    localField.type === "dropdown";

  const isTextInput = localField.type === "shortInput" || localField.type === "longInput";

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
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Field Properties</SheetTitle>
            <SheetDescription>
              Configure the properties for this field
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-1">
          {/* Basic Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Properties</h3>
            
            <div className="space-y-2">
              <Label htmlFor="field-label">Label</Label>
              <Input
                id="field-label"
                value={localField.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Field label"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="field-required"
                checked={localField.required || false}
                onCheckedChange={(checked) =>
                  handleRequiredChange(checked === true)
                }
              />
              <Label htmlFor="field-required" className="cursor-pointer">
                Required
              </Label>
            </div>
          </div>

          <Separator />

          {/* Display Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Display Properties</h3>

            {isTextInput && (
              <div className="space-y-2">
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={localField.placeholder || ""}
                  onChange={(e) => handlePlaceholderChange(e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="field-help-text">Help Text</Label>
              <Textarea
                id="field-help-text"
                value={localField.helpText || ""}
                onChange={(e) => handleHelpTextChange(e.target.value)}
                placeholder="Enter help text or description"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-width">Width</Label>
              <Select
                value={localField.width || "full"}
                onValueChange={handleWidthChange}
              >
                <SelectTrigger id="field-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="half">Half Width</SelectItem>
                  <SelectItem value="third">Third Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Validation Rules */}
          {isTextInput && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Validation Rules</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-min-length">Min Length</Label>
                    <Input
                      id="field-min-length"
                      type="number"
                      min="0"
                      value={localField.minLength || ""}
                      onChange={(e) =>
                        handleMinLengthChange(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-max-length">Max Length</Label>
                    <Input
                      id="field-max-length"
                      type="number"
                      min="0"
                      value={localField.maxLength || ""}
                      onChange={(e) =>
                        handleMaxLengthChange(parseInt(e.target.value) || 0)
                      }
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-pattern">Pattern (Regex)</Label>
                  <Input
                    id="field-pattern"
                    value={localField.pattern || ""}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="e.g., ^[A-Za-z]+$"
                  />
                </div>
              </div>
            </>
          )}

          {/* Options */}
          {needsOptions && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Options</h3>

                <div className="space-y-2">
                  {(localField.options || []).map((option, index) => {
                    const isCorrect = (localField.correctAnswers || []).includes(index);
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {isQuestionType && (
                          <Checkbox
                            id={`panel-option-correct-${localField.id}-${index}`}
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
              </div>
            </>
          )}

          {/* Marks */}
          {isQuestionType && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Grading</h3>

                <div className="space-y-2">
                  <Label htmlFor="field-marks">Marks</Label>
                  <Input
                    id="field-marks"
                    type="number"
                    min="0"
                    step="0.5"
                    value={localField.marks ?? 1}
                    onChange={(e) =>
                      handleMarksChange(parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

