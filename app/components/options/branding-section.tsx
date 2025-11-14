import { useMutation } from "convex/react";
import { api } from "~/../../convex/_generated/api";
import type { Id } from "~/../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ColorPicker } from "../shared/color-picker";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Paintbrush, Save } from "lucide-react";

interface BrandingSectionProps {
  projectId: Id<"projects">;
  options: any;
}

export function BrandingSection({ projectId, options }: BrandingSectionProps) {
  const updateOptions = useMutation(api.projectOptions.update);
  
  const [headerTitle, setHeaderTitle] = useState(options?.headerTitle || "");
  const [headerColor, setHeaderColor] = useState(options?.headerColor || "#0071e3");
  const [backgroundColor, setBackgroundColor] = useState(options?.backgroundColor || "#ffffff");
  const [accentColor, setAccentColor] = useState(options?.accentColor || "#0071e3");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when options change
  useEffect(() => {
    if (options) {
      setHeaderTitle(options.headerTitle || "");
      setHeaderColor(options.headerColor || "#0071e3");
      setBackgroundColor(options.backgroundColor || "#ffffff");
      setAccentColor(options.accentColor || "#0071e3");
    }
  }, [options]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOptions({
        projectId,
        headerTitle,
        headerColor,
        backgroundColor,
        accentColor,
      });
      
      toast.success("Branding settings updated successfully");
    } catch (error) {
      console.error("Error saving branding settings:", error);
      toast.error("Failed to save branding settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          <CardTitle>Branding</CardTitle>
        </div>
        <CardDescription>
          Customize how your test appears to respondents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="headerTitle">Header Title</Label>
          <Input
            id="headerTitle"
            placeholder="Enter a custom title (optional)"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use the project name
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <ColorPicker
              label="Header Color"
              value={headerColor}
              onChange={setHeaderColor}
            />
          </div>

          <div className="space-y-2">
            <ColorPicker
              label="Background Color"
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          </div>

          <div className="space-y-2">
            <ColorPicker
              label="Accent Color"
              value={accentColor}
              onChange={setAccentColor}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Branding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

