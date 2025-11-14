import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Settings } from "lucide-react";
import type { Field } from "./form-builder";
import type { Id } from "../../../convex/_generated/dataModel";
import { getFieldLabel } from "~/components/shared/field-icon";

interface PropertyPanelProps {
  field: Field | null;
  projectType: "test" | "essay" | "survey";
  onUpdate: (fieldId: Id<"fields">, updates: Partial<Field>) => void;
}

export function PropertyPanel({
  field,
  projectType,
  onUpdate,
}: PropertyPanelProps) {
  if (!field) {
    return (
      <div className="w-80 border-l bg-muted/20 flex items-center justify-center">
        <div className="text-center p-6">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a field to edit properties
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Field>) => {
    onUpdate(field._id, updates);
  };

  const fieldLabel = getFieldLabel(field.type as any);
  const showMarks = projectType === "test" || projectType === "essay";

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold">Field Properties</h2>
        <p className="text-xs text-muted-foreground mt-1">{fieldLabel}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="prop-question">Question</Label>
            <Textarea
              id="prop-question"
              value={field.question}
              onChange={(e) => handleUpdate({ question: e.target.value })}
              placeholder="Enter your question..."
              rows={3}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="prop-description">
              Description
              <span className="text-muted-foreground ml-1">(optional)</span>
            </Label>
            <Textarea
              id="prop-description"
              value={field.description || ""}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Add help text..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Required */}
          <div className="flex items-center justify-between">
            <Label htmlFor="prop-required">Required field</Label>
            <Switch
              id="prop-required"
              checked={field.required}
              onCheckedChange={(checked) => handleUpdate({ required: checked })}
            />
          </div>

          {/* Marks (for tests and essays) */}
          {showMarks && (
            <div className="space-y-2">
              <Label htmlFor="prop-marks">Marks</Label>
              <Input
                id="prop-marks"
                type="number"
                min="0"
                value={field.marks || 0}
                onChange={(e) =>
                  handleUpdate({ marks: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Points awarded for this question
              </p>
            </div>
          )}

          {/* Field-specific properties */}
          {(field.type === "short_text" || field.type === "long_text") && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Text Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="prop-minlength">
                    Minimum Length
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-minlength"
                    type="number"
                    min="0"
                    value={field.minLength || ""}
                    onChange={(e) =>
                      handleUpdate({
                        minLength: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-maxlength">
                    Maximum Length
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-maxlength"
                    type="number"
                    min="0"
                    value={field.maxLength || ""}
                    onChange={(e) =>
                      handleUpdate({
                        maxLength: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="No maximum"
                  />
                </div>
              </div>
            </>
          )}

          {field.type === "file_upload" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">File Upload Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="prop-filetypes">
                    Allowed File Types
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-filetypes"
                    value={(field.allowedFileTypes || []).join(", ")}
                    onChange={(e) =>
                      handleUpdate({
                        allowedFileTypes: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., pdf, docx, jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-maxfilesize">
                    Max File Size (MB)
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-maxfilesize"
                    type="number"
                    min="1"
                    value={field.maxFileSize || ""}
                    onChange={(e) =>
                      handleUpdate({
                        maxFileSize: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="No limit"
                  />
                </div>
              </div>
            </>
          )}

          {field.type === "rating" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Rating Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="prop-rating-min">Minimum Value</Label>
                  <Input
                    id="prop-rating-min"
                    type="number"
                    value={field.ratingScale?.min || 1}
                    onChange={(e) =>
                      handleUpdate({
                        ratingScale: {
                          min: parseInt(e.target.value) || 1,
                          max: field.ratingScale?.max || 5,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-rating-max">Maximum Value</Label>
                  <Input
                    id="prop-rating-max"
                    type="number"
                    value={field.ratingScale?.max || 5}
                    onChange={(e) =>
                      handleUpdate({
                        ratingScale: {
                          min: field.ratingScale?.min || 1,
                          max: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-rating-minlabel">
                    Minimum Label
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-rating-minlabel"
                    value={field.ratingLabels?.min || ""}
                    onChange={(e) =>
                      handleUpdate({
                        ratingLabels: {
                          min: e.target.value,
                          max: field.ratingLabels?.max || "",
                        },
                      })
                    }
                    placeholder="e.g., Poor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-rating-maxlabel">
                    Maximum Label
                    <span className="text-muted-foreground ml-1">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="prop-rating-maxlabel"
                    value={field.ratingLabels?.max || ""}
                    onChange={(e) =>
                      handleUpdate({
                        ratingLabels: {
                          min: field.ratingLabels?.min || "",
                          max: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Excellent"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

