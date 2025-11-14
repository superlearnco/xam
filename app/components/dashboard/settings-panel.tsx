import { useState } from "react";
import { useQuery } from "convex/react";
import { User, CreditCard, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useUser } from "@clerk/react-router";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "~/components/ui/progress";
import SubscriptionStatus from "~/components/subscription-status";

export function SettingsPanel() {
  const { user } = useUser();
  const credits = useQuery(api.credits.getCredits);
  const usageHistory = useQuery(api.credits.getUsageHistory, { limit: 10 });
  const [activeTab, setActiveTab] = useState("profile");

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      generate_test: "Generate Test",
      generate_options: "Generate Options",
      grade_response: "Grade Response",
      bulk_grade: "Bulk Grade",
      suggest_feedback: "Suggest Feedback",
    };
    return labels[feature] || feature;
  };

  const getCreditColor = (balance: number) => {
    if (balance > 100) return "text-green-500";
    if (balance > 50) return "text-yellow-500";
    if (balance > 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai-credits">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Credits
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details from Clerk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={user?.fullName || ""}
                  disabled
                  placeholder="Not set"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  value={user?.id || ""}
                  disabled
                  className="font-mono text-xs"
                />
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  To update your profile information, please visit your Clerk account settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Credits Tab */}
        <TabsContent value="ai-credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Credits Balance</CardTitle>
              <CardDescription>Your available credits for AI features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getCreditColor(credits?.balance || 0)}`}>
                  {credits?.balance?.toFixed(2) || "0.00"}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Credits Remaining</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {credits?.plan === "pay_as_you_go" ? "Pay As You Go" : "Free Plan"}
                  </p>
                </div>
                <Badge variant={credits?.plan === "pay_as_you_go" ? "default" : "secondary"}>
                  {credits?.plan || "free"}
                </Badge>
              </div>

              {credits && credits.periodUsage !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Period Usage</span>
                    <span className="font-medium">{credits.periodUsage.toFixed(2)} credits</span>
                  </div>
                  <Progress value={Math.min((credits.periodUsage / 100) * 100, 100)} />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Purchase Credits
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Credits never expire and can be used for all AI features
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Usage</CardTitle>
              <CardDescription>Your recent AI feature usage</CardDescription>
            </CardHeader>
            <CardContent>
              {!usageHistory || usageHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No usage history yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageHistory.map((usage) => (
                      <TableRow key={usage._id}>
                        <TableCell className="font-medium">
                          {getFeatureLabel(usage.feature)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {usage.model}
                        </TableCell>
                        <TableCell className="text-xs">
                          {usage.tokensInput + usage.tokensOutput}
                        </TableCell>
                        <TableCell>{usage.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(usage.timestamp), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Manage your subscription via Polar</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionStatus />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>AI feature pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Token Pricing</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Input tokens: $0.003 per 1,000 tokens</li>
                  <li>Output tokens: $0.015 per 1,000 tokens</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Credit Packages</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>$5 = 500 credits (minimum purchase)</li>
                  <li>Credits never expire</li>
                  <li>Can be used for all AI features</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

