import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface OptionsEditorProps {
  options: string[];
  onUpdate: (options: string[]) => void;
}

export function OptionsEditor({ options, onUpdate }: OptionsEditorProps) {
  const [localOptions, setLocalOptions] = useState(
    options.length > 0 ? options : ["Option 1", "Option 2", "Option 3"]
  );

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    onUpdate(newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [...localOptions, `Option ${localOptions.length + 1}`];
    setLocalOptions(newOptions);
    onUpdate(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (localOptions.length <= 2) return; // Minimum 2 options
    const newOptions = localOptions.filter((_, i) => i !== index);
    setLocalOptions(newOptions);
    onUpdate(newOptions);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2">Dropdown Options</Label>
        <div className="space-y-2">
          {localOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
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
    </div>
  );
}

