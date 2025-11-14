import { useMutation } from "convex/react";
import { api } from "~/../../convex/_generated/api";
import type { Id } from "~/../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings2, Save, Clock } from "lucide-react";

interface TestSettingsSectionProps {
  projectId: Id<"projects">;
  projectType: "test" | "essay" | "survey";
  options: any;
}

export function TestSettingsSection({ projectId, projectType, options }: TestSettingsSectionProps) {
  const updateOptions = useMutation(api.projectOptions.update);
  
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(!!options?.timeLimit);
  const [timeLimit, setTimeLimit] = useState(options?.timeLimit || 60);
  const [showProgressBar, setShowProgressBar] = useState(options?.showProgressBar ?? true);
  const [shuffleQuestions, setShuffleQuestions] = useState(options?.shuffleQuestions ?? false);
  const [shuffleOptions, setShuffleOptions] = useState(options?.shuffleOptions ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when options change
  useEffect(() => {
    if (options) {
      setTimeLimitEnabled(!!options.timeLimit);
      setTimeLimit(options.timeLimit || 60);
      setShowProgressBar(options.showProgressBar ?? true);
      setShuffleQuestions(options.shuffleQuestions ?? false);
      setShuffleOptions(options.shuffleOptions ?? false);
    }
  }, [options]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOptions({
        projectId,
        timeLimit: timeLimitEnabled ? timeLimit : undefined,
        showProgressBar,
        shuffleQuestions,
        shuffleOptions,
      });
      
      toast.success("Test settings updated successfully");
    } catch (error) {
      console.error("Error saving test settings:", error);
      toast.error("Failed to save test settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Only show this section for tests and essays
  if (projectType === "survey") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <CardTitle>Test Settings</CardTitle>
        </div>
        <CardDescription>
          Configure timing, randomization, and display options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="timeLimitEnabled">Time Limit</Label>
              <p className="text-sm text-muted-foreground">
                Set a time limit for completing the test
              </p>
            </div>
            <Switch
              id="timeLimitEnabled"
              checked={timeLimitEnabled}
              onCheckedChange={setTimeLimitEnabled}
            />
          </div>

          {timeLimitEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="timeLimit">Minutes</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  max={480}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="showProgressBar">Show Progress Bar</Label>
            <p className="text-sm text-muted-foreground">
              Display progress indicator to respondents
            </p>
          </div>
          <Switch
            id="showProgressBar"
            checked={showProgressBar}
            onCheckedChange={setShowProgressBar}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
            <p className="text-sm text-muted-foreground">
              Randomize question order for each respondent
            </p>
          </div>
          <Switch
            id="shuffleQuestions"
            checked={shuffleQuestions}
            onCheckedChange={setShuffleQuestions}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="shuffleOptions">Shuffle Options</Label>
            <p className="text-sm text-muted-foreground">
              Randomize answer options for multiple choice questions
            </p>
          </div>
          <Switch
            id="shuffleOptions"
            checked={shuffleOptions}
            onCheckedChange={setShuffleOptions}
          />
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Test Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

