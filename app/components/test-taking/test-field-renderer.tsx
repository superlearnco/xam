import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import type { Doc } from "../../../convex/_generated/dataModel";

interface TestFieldRendererProps {
  field: Doc<"fields">;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function TestFieldRenderer({
  field,
  value,
  onChange,
  error,
}: TestFieldRendererProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const renderField = () => {
    switch (field.type) {
      case "short_text":
        return (
          <Input
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type your answer..."
            required={field.required}
            maxLength={field.maxLength}
            minLength={field.minLength}
          />
        );

      case "long_text":
        return (
          <Textarea
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type your answer..."
            required={field.required}
            maxLength={field.maxLength}
            minLength={field.minLength}
            rows={6}
          />
        );

      case "multiple_choice":
        return (
          <RadioGroup
            value={localValue || ""}
            onValueChange={handleChange}
            required={field.required}
          >
            <div className="space-y-3">
              {field.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50"
                >
                  <RadioGroupItem value={option} id={`${field._id}-${index}`} />
                  <Label
                    htmlFor={`${field._id}-${index}`}
                    className="flex-1 cursor-pointer text-base font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "checkbox":
        const checkboxValues = Array.isArray(localValue) ? localValue : [];
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50"
              >
                <Checkbox
                  id={`${field._id}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...checkboxValues, option]
                      : checkboxValues.filter((v) => v !== option);
                    handleChange(newValues);
                  }}
                />
                <Label
                  htmlFor={`${field._id}-${index}`}
                  className="flex-1 cursor-pointer text-base font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <Select value={localValue || ""} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            value={localValue || ""}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder="Enter a number..."
            required={field.required}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        );

      case "scale":
        const scaleMin = field.scaleMin || 0;
        const scaleMax = field.scaleMax || 10;
        const scaleStep = field.scaleStep || 1;
        const scaleValue = localValue || scaleMin;

        return (
          <div className="space-y-4">
            <Slider
              value={[scaleValue]}
              onValueChange={(values) => handleChange(values[0])}
              min={scaleMin}
              max={scaleMax}
              step={scaleStep}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{scaleMin}</span>
              <span className="font-medium">{scaleValue}</span>
              <span className="text-muted-foreground">{scaleMax}</span>
            </div>
          </div>
        );

      case "rating":
        const ratingScale = field.ratingScale || 5;
        const ratingValue = localValue || 0;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: ratingScale }).map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleChange(starValue)}
                    className={`text-3xl transition-colors ${
                      starValue <= ratingValue
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            {field.ratingLabels && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{field.ratingLabels.min}</span>
                <span>{field.ratingLabels.max}</span>
              </div>
            )}
          </div>
        );

      case "file_upload":
        return (
          <div className="space-y-3">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In production, you would upload to storage and get a URL
                  // For now, we'll store the file name
                  handleChange(file.name);
                }
              }}
              accept={field.allowedFileTypes?.join(",")}
              required={field.required}
            />
            {field.allowedFileTypes && (
              <p className="text-sm text-muted-foreground">
                Allowed types: {field.allowedFileTypes.join(", ")}
              </p>
            )}
            {field.maxFileSize && (
              <p className="text-sm text-muted-foreground">
                Max size: {field.maxFileSize} MB
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Label className="text-lg font-medium">
              {field.question}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.marks !== undefined && field.marks > 0 && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {field.marks} {field.marks === 1 ? "mark" : "marks"}
              </span>
            )}
          </div>
          {field.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">{renderField()}</div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Character/length limits */}
      {(field.type === "short_text" || field.type === "long_text") &&
        field.maxLength && (
          <p className="text-xs text-muted-foreground">
            {localValue?.length || 0} / {field.maxLength} characters
          </p>
        )}
    </div>
  );
}

