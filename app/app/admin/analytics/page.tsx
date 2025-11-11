"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  FileText,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);

  // Fetch analytics data
  const dashboardStats = useQuery(api.analytics.getDashboardStats, {
    startDate: Date.now() - timeRange * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
  });

  const userGrowth = useQuery(api.analytics.getUserGrowth, { days: timeRange });
  const projectTrends = useQuery(api.analytics.getProjectTrends, { days: timeRange });
  const submissionTrends = useQuery(api.analytics.getSubmissionTrends, { days: timeRange });
  const creditUsageTrends = useQuery(api.analytics.getCreditUsageTrends, { days: timeRange });
  const revenueTrends = useQuery(api.analytics.getRevenueTrends, { days: timeRange });
  const mostActiveUsers = useQuery(api.analytics.getMostActiveUsers, { limit: 10 });
  const featureUsage = useQuery(api.analytics.getFeatureUsage, { days: timeRange });
  const errorStats = useQuery(api.analytics.getErrorStats, { days: 7 });
  const conversionFunnel = useQuery(api.analytics.getConversionFunnel, { days: timeRange });

  const isLoading = !dashboardStats || !userGrowth || !projectTrends;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    const data = {
      dashboardStats,
      userGrowth,
      projectTrends,
      submissionTrends,
      creditUsageTrends,
      revenueTrends,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Internal analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={timeRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(7)}
            >
              7D
            </Button>
            <Button
              variant={timeRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(30)}
            >
              30D
            </Button>
            <Button
              variant={timeRange === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(90)}
            >
              90D
            </Button>
          </div>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.users.active} active in last {timeRange} days
            </p>
            <div className="text-xs text-green-600 mt-1">
              +{dashboardStats.users.new} new users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.projects.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.projects.published} published
            </p>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {dashboardStats.projects.draft} drafts
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.submissions.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.submissions.recent} in last {timeRange} days
            </p>
            <div className="text-xs text-blue-600 mt-1">
              {dashboardStats.submissions.graded} graded
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(dashboardStats.billing.totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.billing.transactionCount} transactions
            </p>
            <div className="text-xs text-green-600 mt-1">
              {dashboardStats.billing.creditsPurchased} credits sold
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Daily new user signups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Creation</CardTitle>
                <CardDescription>Daily project creation trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#10b981" name="Total" />
                    <Bar dataKey="published" fill="#3b82f6" name="Published" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Submission Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Activity</CardTitle>
                <CardDescription>Daily submission volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={submissionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#f59e0b" name="Submissions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Signups</span>
                      <span className="font-bold">{conversionFunnel?.signups || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Created Project</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{conversionFunnel?.createdProject || 0}</span>
                        <Badge variant="secondary">
                          {conversionFunnel?.conversionRates.signupToProject.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${conversionFunnel?.conversionRates.signupToProject || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Published Project</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{conversionFunnel?.publishedProject || 0}</span>
                        <Badge variant="secondary">
                          {conversionFunnel?.conversionRates.projectToPublish.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${conversionFunnel?.conversionRates.projectToPublish || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Used AI Features</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{conversionFunnel?.usedAI || 0}</span>
                        <Badge variant="secondary">
                          {conversionFunnel?.conversionRates.signupToAI.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${conversionFunnel?.conversionRates.signupToAI || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Top 10 users by activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostActiveUsers?.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{user.name || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{user.projectCount}</div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{user.aiGenerationCount}</div>
                          <div className="text-xs text-muted-foreground">AI Uses</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{user.creditsUsed}</div>
                          <div className="text-xs text-muted-foreground">Credits</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Published", value: dashboardStats.projects.published },
                        { name: "Draft", value: dashboardStats.projects.draft },
                        { name: "Archived", value: dashboardStats.projects.archived },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Trends</CardTitle>
                <CardDescription>Creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#10b981" name="Total" />
                    <Bar dataKey="published" fill="#3b82f6" name="Published" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Usage Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit Usage Trends</CardTitle>
                <CardDescription>Daily AI credit consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={creditUsageTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="credits" stroke="#8b5cf6" name="Credits Used" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Feature Usage</CardTitle>
                <CardDescription>Usage by feature type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboardStats.ai.usageByType).map(([name, value]) => ({
                        name: name.replace(/_/g, " "),
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(dashboardStats.ai.usageByType).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Statistics</CardTitle>
                <CardDescription>Aggregate AI usage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-muted-foreground">Total Generations</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.ai.totalGenerations}</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Credits Used</span>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.ai.totalCreditsUsed}</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Avg Credits/Gen</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {dashboardStats.ai.averageCreditsPerGeneration.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-muted-foreground">AI Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">
                      ${((dashboardStats.ai.totalCreditsUsed / 10) * 0.1).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `$${(Number(value) / 100).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue (USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-3xl font-bold">
                      ${(dashboardStats.billing.totalRevenue / 100).toFixed(2)}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                    <div className="text-2xl font-bold">{dashboardStats.billing.transactionCount}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Credits Sold</div>
                    <div className="text-2xl font-bold">{dashboardStats.billing.creditsPurchased}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Transaction</div>
                    <div className="text-2xl font-bold">
                      $
                      {dashboardStats.billing.transactionCount > 0
                        ? (dashboardStats.billing.totalRevenue / dashboardStats.billing.transactionCount / 100).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credit Economics</CardTitle>
                <CardDescription>Credit purchase vs usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credits Purchased</span>
                    <span className="font-bold">{dashboardStats.billing.creditsPurchased}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credits Used</span>
                    <span className="font-bold">{dashboardStats.ai.totalCreditsUsed}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilization Rate</span>
                    <Badge>
                      {dashboardStats.billing.creditsPurchased > 0
                        ? ((dashboardStats.ai.totalCreditsUsed / dashboardStats.billing.creditsPurchased) * 100).toFixed(1)
                        : "0"}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue per Credit</span>
                    <span className="font-bold">
                      $
                      {dashboardStats.billing.creditsPurchased > 0
                        ? (dashboardStats.billing.totalRevenue / dashboardStats.billing.creditsPurchased / 100).toFixed(3)
                        : "0.000"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Statistics</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold">{errorStats?.successRate.toFixed(1)}%</div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Attempts</span>
                      <span className="font-bold">{errorStats?.totalGenerations || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Failed</span>
                      <span className="font-bold text-red-600">{errorStats?.failedGenerations || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Types</CardTitle>
                <CardDescription>Breakdown by error type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errorStats && Object.keys(errorStats.errorsByType).length > 0 ? (
                    Object.entries(errorStats.errorsByType).map(([error, count]) => (
                      <div key={error} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm">{error}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No errors recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
