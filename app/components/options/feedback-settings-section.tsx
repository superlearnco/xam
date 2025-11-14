import { useMutation } from "convex/react";
import { api } from "~/../../convex/_generated/api";
import type { Id } from "~/../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Save } from "lucide-react";

interface FeedbackSettingsSectionProps {
  projectId: Id<"projects">;
  projectType: "test" | "essay" | "survey";
  options: any;
}

export function FeedbackSettingsSection({ projectId, projectType, options }: FeedbackSettingsSectionProps) {
  const updateOptions = useMutation(api.projectOptions.update);
  
  const [instantFeedback, setInstantFeedback] = useState(options?.instantFeedback ?? false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(options?.showCorrectAnswers ?? false);
  const [showScore, setShowScore] = useState(options?.showScore ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when options change
  useEffect(() => {
    if (options) {
      setInstantFeedback(options.instantFeedback ?? false);
      setShowCorrectAnswers(options.showCorrectAnswers ?? false);
      setShowScore(options.showScore ?? true);
    }
  }, [options]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOptions({
        projectId,
        instantFeedback,
        showCorrectAnswers,
        showScore,
      });
      
      toast.success("Feedback settings updated successfully");
    } catch (error) {
      console.error("Error saving feedback settings:", error);
      toast.error("Failed to save feedback settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <CardTitle>Feedback Settings</CardTitle>
        </div>
        <CardDescription>
          Control what information respondents see after submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projectType !== "survey" && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="instantFeedback">Instant Feedback</Label>
                <p className="text-sm text-muted-foreground">
                  Show results immediately after submission
                </p>
              </div>
              <Switch
                id="instantFeedback"
                checked={instantFeedback}
                onCheckedChange={setInstantFeedback}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                <p className="text-sm text-muted-foreground">
                  Display the correct answers after submission
                </p>
              </div>
              <Switch
                id="showCorrectAnswers"
                checked={showCorrectAnswers}
                onCheckedChange={setShowCorrectAnswers}
                disabled={!instantFeedback}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="showScore">Show Score</Label>
                <p className="text-sm text-muted-foreground">
                  Display the score to respondents
                </p>
              </div>
              <Switch
                id="showScore"
                checked={showScore}
                onCheckedChange={setShowScore}
                disabled={!instantFeedback}
              />
            </div>
          </>
        )}

        {projectType === "survey" && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Feedback settings are not applicable for surveys</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Feedback Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

