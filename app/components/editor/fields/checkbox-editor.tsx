import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface CheckboxEditorProps {
  options: string[];
  correctAnswers: string[];
  onUpdate: (updates: {
    options?: string[];
    correctAnswer?: string[];
  }) => void;
  projectType: "test" | "essay" | "survey";
}

export function CheckboxEditor({
  options,
  correctAnswers,
  onUpdate,
  projectType,
}: CheckboxEditorProps) {
  const [localOptions, setLocalOptions] = useState(
    options.length > 0 ? options : ["Option 1", "Option 2", "Option 3"]
  );

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
    const removedOption = localOptions[index];
    const newOptions = localOptions.filter((_, i) => i !== index);
    setLocalOptions(newOptions);
    onUpdate({ options: newOptions });

    // Remove from correct answers if it was selected
    if (correctAnswers.includes(removedOption)) {
      const newCorrectAnswers = correctAnswers.filter(
        (ans) => ans !== removedOption
      );
      onUpdate({ correctAnswer: newCorrectAnswers });
    }
  };

  const handleCorrectAnswerToggle = (option: string, checked: boolean) => {
    const newCorrectAnswers = checked
      ? [...correctAnswers, option]
      : correctAnswers.filter((ans) => ans !== option);
    onUpdate({ correctAnswer: newCorrectAnswers });
  };

  const showCorrectAnswer = projectType === "test";

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2">Options</Label>
        <div className="space-y-2">
          {localOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              {showCorrectAnswer && (
                <Checkbox
                  checked={correctAnswers.includes(option)}
                  onCheckedChange={(checked) =>
                    handleCorrectAnswerToggle(option, checked as boolean)
                  }
                  id={`correct-${index}`}
                />
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

      <Button variant="outline" size="sm" onClick={handleAddOption}>
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>

      {showCorrectAnswer && (
        <p className="text-xs text-muted-foreground">
          Check the boxes next to all correct answers
        </p>
      )}
    </div>
  );
}

