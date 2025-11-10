"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Palette,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUserQuery);
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentUser?.preferences) {
      setEmailNotifications(currentUser.preferences.emailNotifications);
      setTheme(currentUser.preferences.theme);
    }
  }, [currentUser]);

  if (authLoading || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser || !currentUser) {
    router.push("/login");
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        emailNotifications,
        theme,
      });
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    setHasChanges(true);
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
    setHasChanges(true);
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      toast.error("Account deletion is not yet implemented");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for submissions, grades, and
                important updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Types</h4>
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="submission-notifications"
                  className="font-normal"
                >
                  Student submissions
                </Label>
                <Switch
                  id="submission-notifications"
                  checked={emailNotifications}
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="marking-notifications"
                  className="font-normal"
                >
                  Marking completed
                </Label>
                <Switch
                  id="marking-notifications"
                  checked={emailNotifications}
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="deadline-notifications"
                  className="font-normal"
                >
                  Deadline reminders
                </Label>
                <Switch
                  id="deadline-notifications"
                  checked={emailNotifications}
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="credit-notifications" className="font-normal">
                  Low credit warnings
                </Label>
                <Switch
                  id="credit-notifications"
                  checked={emailNotifications}
                  disabled
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize how the app looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose between light mode, dark mode, or sync with your system
              preferences
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Default Test Settings</span>
          </CardTitle>
          <CardDescription>
            Set default preferences for new tests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-grade" className="font-normal">
                Auto-grade by default
              </Label>
              <Switch id="auto-grade" disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="instant-feedback" className="font-normal">
                Instant feedback
              </Label>
              <Switch id="instant-feedback" disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle-questions" className="font-normal">
                Shuffle questions
              </Label>
              <Switch id="shuffle-questions" disabled />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            These settings will be applied to all new tests you create. You can
            override them for individual tests.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers,
                  including:
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>All your projects and tests</li>
                    <li>All questions and submissions</li>
                    <li>All student data and grades</li>
                    <li>Your subscription and credits</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="shadow-lg">
            <CardContent className="flex items-center space-x-3 p-4">
              <p className="text-sm font-medium">You have unsaved changes</p>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
