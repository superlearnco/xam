import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

interface MultipleChoiceEditorProps {
  fieldId?: Id<"fields">;
  question?: string;
  options: string[];
  correctAnswer?: string;
  onUpdate: (updates: {
    options?: string[];
    correctAnswer?: string;
  }) => void;
  projectType: "test" | "essay" | "survey";
}

export function MultipleChoiceEditor({
  fieldId,
  question,
  options,
  correctAnswer,
  onUpdate,
  projectType,
}: MultipleChoiceEditorProps) {
  const [localOptions, setLocalOptions] = useState(
    options.length > 0 ? options : ["Option 1", "Option 2", "Option 3"]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOptionsAction = useMutation(api.ai.actions.generateOptions);
  const credits = useQuery(api.credits.getCredits);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...localOptions, `Option ${localOptions.length + 1}`];
    setLocalOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (localOptions.length <= 2) return; // Minimum 2 options
    const newOptions = localOptions.filter((_, i) => i !== index);
    setLocalOptions(newOptions);
    onUpdate({ options: newOptions });

    // If deleted option was the correct answer, clear it
    if (correctAnswer === localOptions[index]) {
      onUpdate({ correctAnswer: undefined });
    }
  };

  const handleCorrectAnswerChange = (value: string) => {
    onUpdate({ correctAnswer: value });
  };

  const handleGenerateOptions = async () => {
    if (!fieldId || !question || !correctAnswer) {
      toast.error("Missing required information");
      return;
    }

    // Check credits
    if (credits && credits.balance < 0.5) {
      toast.error("Insufficient credits. Please purchase more credits.");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateOptionsAction({
        fieldId,
        question,
        correctAnswer,
      });

      if (result.success && result.options) {
        // Update local state with generated options
        const newOptions = [correctAnswer, ...result.options];
        setLocalOptions(newOptions);
        onUpdate({ options: newOptions });

        toast.success(
          `Generated 3 dummy options (${result.cost.toFixed(2)} credits used)`
        );
      }
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate options"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const showCorrectAnswer = projectType === "test";
  const canGenerateOptions =
    showCorrectAnswer && correctAnswer && question && fieldId && !isGenerating;

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2">Options</Label>
        <div className="space-y-2">
          {localOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              {showCorrectAnswer && (
                <RadioGroup
                  value={correctAnswer || ""}
                  onValueChange={handleCorrectAnswerChange}
                >
                  <RadioGroupItem value={option} id={`correct-${index}`} />
                </RadioGroup>
              )}
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(index)}
                disabled={localOptions.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>

        {showCorrectAnswer && correctAnswer && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!canGenerateOptions}
            onClick={handleGenerateOptions}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate Dummy Options"}
            {!isGenerating && (
              <span className="ml-2 text-xs text-muted-foreground">
                (~0.5 credit)
              </span>
            )}
          </Button>
        )}
      </div>

      {showCorrectAnswer && !correctAnswer && (
        <p className="text-xs text-muted-foreground">
          Select a correct answer to enable AI dummy option generation
        </p>
      )}

      {showCorrectAnswer && (
        <p className="text-xs text-muted-foreground">
          Select the radio button next to the correct answer
        </p>
      )}
    </div>
  );
}

