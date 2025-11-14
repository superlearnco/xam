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
import { Lock, Save, Eye, EyeOff } from "lucide-react";

interface AccessControlSectionProps {
  projectId: Id<"projects">;
  options: any;
}

export function AccessControlSection({ projectId, options }: AccessControlSectionProps) {
  const updateOptions = useMutation(api.projectOptions.update);
  
  const [requireLogin, setRequireLogin] = useState(options?.requireLogin || false);
  const [passwordEnabled, setPasswordEnabled] = useState(!!options?.password);
  const [password, setPassword] = useState(options?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [allowedDomain, setAllowedDomain] = useState(options?.allowedDomain || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when options change
  useEffect(() => {
    if (options) {
      setRequireLogin(options.requireLogin || false);
      setPasswordEnabled(!!options.password);
      setPassword(options.password || "");
      setAllowedDomain(options.allowedDomain || "");
    }
  }, [options]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOptions({
        projectId,
        requireLogin,
        password: passwordEnabled ? password : undefined,
        allowedDomain: allowedDomain || undefined,
      });
      
      toast.success("Access control settings updated successfully");
    } catch (error) {
      console.error("Error saving access control settings:", error);
      toast.error("Failed to save access control settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Access Control</CardTitle>
        </div>
        <CardDescription>
          Control who can access and submit your test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requireLogin">Require Login</Label>
            <p className="text-sm text-muted-foreground">
              Respondents must be signed in to access this test
            </p>
          </div>
          <Switch
            id="requireLogin"
            checked={requireLogin}
            onCheckedChange={setRequireLogin}
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="passwordEnabled">Password Protection</Label>
              <p className="text-sm text-muted-foreground">
                Require a password to access this test
              </p>
            </div>
            <Switch
              id="passwordEnabled"
              checked={passwordEnabled}
              onCheckedChange={setPasswordEnabled}
            />
          </div>

          {passwordEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="allowedDomain">Email Domain Restriction</Label>
          <Input
            id="allowedDomain"
            placeholder="e.g., school.edu"
            value={allowedDomain}
            onChange={(e) => setAllowedDomain(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Only allow emails from a specific domain (optional)
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Access Control"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

