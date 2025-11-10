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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Coins,
  Crown,
  Loader2,
  Save,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUserQuery);
  const creditBalance = useQuery(api.users.getCreditBalance);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

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

  const handleEdit = () => {
    setName(currentUser.name);
    setAvatar(currentUser.avatar || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: name || undefined,
        avatar: avatar || undefined,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName("");
    setAvatar("");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-slate-500";
      case "starter":
        return "bg-blue-500";
      case "pro":
        return "bg-purple-500";
      case "enterprise":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your personal details and account status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    isEditing
                      ? avatar || currentUser.avatar
                      : currentUser.avatar
                  }
                  alt={currentUser.name}
                />
                <AvatarFallback className="text-lg">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold">
                      {currentUser.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email}
                  </p>
                  {currentUser.emailVerified && (
                    <Badge variant="secondary" className="mt-1">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(currentUser.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.lastLoginAt
                      ? formatDistanceToNow(currentUser.lastLoginAt, {
                          addSuffix: true,
                        })
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
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
                </>
              ) : (
                <Button onClick={handleEdit}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Badge className={getTierColor(currentUser.subscriptionTier)}>
                  {getTierLabel(currentUser.subscriptionTier)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {currentUser.subscriptionStatus === "active"
                    ? "Active subscription"
                    : "Inactive subscription"}
                </p>
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/app/billing")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-5 w-5" />
                <span>Credits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {creditBalance ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold">
                      {creditBalance.totalCredits}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total credits available
                    </p>
                  </div>

                  {creditBalance.organizationCredits > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Personal:
                          </span>
                          <span className="font-medium">
                            {creditBalance.personalCredits}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Organization:
                          </span>
                          <span className="font-medium">
                            {creditBalance.organizationCredits}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {creditBalance.totalCredits < 50 && (
                    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      Low credit balance
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/app/billing")}
              >
                Buy Credits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
