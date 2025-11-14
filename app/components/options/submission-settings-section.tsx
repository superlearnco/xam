import { useMutation } from "convex/react";
import { api } from "~/../../convex/_generated/api";
import type { Id } from "~/../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Save, Calendar } from "lucide-react";

interface SubmissionSettingsSectionProps {
  projectId: Id<"projects">;
  options: any;
}

export function SubmissionSettingsSection({ projectId, options }: SubmissionSettingsSectionProps) {
  const updateOptions = useMutation(api.projectOptions.update);
  
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(
    options?.allowMultipleSubmissions ?? false
  );
  const [showSubmissionConfirmation, setShowSubmissionConfirmation] = useState(
    options?.showSubmissionConfirmation ?? true
  );
  const [confirmationMessage, setConfirmationMessage] = useState(
    options?.confirmationMessage || ""
  );
  const [closeDateEnabled, setCloseDateEnabled] = useState(!!options?.closeDate);
  const [closeDate, setCloseDate] = useState(
    options?.closeDate ? new Date(options.closeDate).toISOString().split("T")[0] : ""
  );
  const [maxSubmissionsEnabled, setMaxSubmissionsEnabled] = useState(!!options?.maxSubmissions);
  const [maxSubmissions, setMaxSubmissions] = useState(options?.maxSubmissions || 100);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when options change
  useEffect(() => {
    if (options) {
      setAllowMultipleSubmissions(options.allowMultipleSubmissions ?? false);
      setShowSubmissionConfirmation(options.showSubmissionConfirmation ?? true);
      setConfirmationMessage(options.confirmationMessage || "");
      setCloseDateEnabled(!!options.closeDate);
      setCloseDate(
        options.closeDate ? new Date(options.closeDate).toISOString().split("T")[0] : ""
      );
      setMaxSubmissionsEnabled(!!options.maxSubmissions);
      setMaxSubmissions(options.maxSubmissions || 100);
    }
  }, [options]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOptions({
        projectId,
        allowMultipleSubmissions,
        showSubmissionConfirmation,
        confirmationMessage: confirmationMessage || undefined,
        closeDate: closeDateEnabled && closeDate ? new Date(closeDate).getTime() : undefined,
        maxSubmissions: maxSubmissionsEnabled ? maxSubmissions : undefined,
      });
      
      toast.success("Submission settings updated successfully");
    } catch (error) {
      console.error("Error saving submission settings:", error);
      toast.error("Failed to save submission settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          <CardTitle>Submission Settings</CardTitle>
        </div>
        <CardDescription>
          Configure submission behavior and limitations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowMultipleSubmissions">Allow Multiple Submissions</Label>
            <p className="text-sm text-muted-foreground">
              Let respondents submit more than once
            </p>
          </div>
          <Switch
            id="allowMultipleSubmissions"
            checked={allowMultipleSubmissions}
            onCheckedChange={setAllowMultipleSubmissions}
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showSubmissionConfirmation">Confirmation Message</Label>
              <p className="text-sm text-muted-foreground">
                Show a custom message after submission
              </p>
            </div>
            <Switch
              id="showSubmissionConfirmation"
              checked={showSubmissionConfirmation}
              onCheckedChange={setShowSubmissionConfirmation}
            />
          </div>

          {showSubmissionConfirmation && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="confirmationMessage">Custom Message</Label>
              <Textarea
                id="confirmationMessage"
                placeholder="Thank you for your submission! We'll review it shortly."
                value={confirmationMessage}
                onChange={(e) => setConfirmationMessage(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {confirmationMessage.length}/500 characters
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="closeDateEnabled">Close Date</Label>
              <p className="text-sm text-muted-foreground">
                Set a deadline for submissions
              </p>
            </div>
            <Switch
              id="closeDateEnabled"
              checked={closeDateEnabled}
              onCheckedChange={setCloseDateEnabled}
            />
          </div>

          {closeDateEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="closeDate">Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="closeDate"
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maxSubmissionsEnabled">Maximum Submissions</Label>
              <p className="text-sm text-muted-foreground">
                Limit the total number of submissions
              </p>
            </div>
            <Switch
              id="maxSubmissionsEnabled"
              checked={maxSubmissionsEnabled}
              onCheckedChange={setMaxSubmissionsEnabled}
            />
          </div>

          {maxSubmissionsEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="maxSubmissions">Max Submissions</Label>
              <Input
                id="maxSubmissions"
                type="number"
                min={1}
                max={10000}
                value={maxSubmissions}
                onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                className="w-32"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Submission Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

