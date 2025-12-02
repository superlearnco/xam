import type { Route } from "./+types/insights";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "convex/_generated/api";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Loader2,
  Search,
  Users,
  FileText,
  TrendingUp,
  Award,
  ChevronRight,
  BarChart3,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";

export function meta(_: Route.MetaArgs) {
  return [
    {
      title: "Insights | XAM",
    },
  ];
}

function formatShortDate(ts: number | null | undefined) {
  if (!ts) return "N/A";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getPercentageColor(percentage: number | null) {
  if (percentage === null) return "text-muted-foreground";
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 70) return "text-blue-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
}

const submissionChartConfig = {
  submissions: {
    label: "Submissions",
    // Indigo-like primary
    color: "#4f46e5",
  },
  avgPercentage: {
    label: "Avg Score",
    // Emerald-like accent
    color: "#10b981",
  },
} satisfies ChartConfig;

// Use the raw chart CSS variables (which are defined as oklch colors)
// instead of wrapping them in hsl(), which produced invalid CSS and black slices.
const scoreDistributionColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export default function DashboardInsights() {
  const [studentSearch, setStudentSearch] = useState("");

  const overall = useQuery(api.insights.getOverallInsights, {});
  const students = useQuery(api.insights.listStudentsInsights, {});

  const filteredStudents = useMemo(() => {
    if (!students || !students.students) return [];
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students.students;
    return students.students.filter((s: any) => {
      if (s.normalizedName.toLowerCase().includes(q)) return true;
      return s.nameVariants?.some((name: string) =>
        name.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch]);

  const overallLoading = overall === undefined;
  const studentsLoading = students === undefined;

  const scoreDistributionData = useMemo(() => {
    if (!overall?.scoreDistribution) return [];
    const data = [
      { name: "Excellent (90-100%)", value: overall.scoreDistribution.excellent, fill: scoreDistributionColors[0] },
      { name: "Good (70-89%)", value: overall.scoreDistribution.good, fill: scoreDistributionColors[1] },
      { name: "Average (50-69%)", value: overall.scoreDistribution.average, fill: scoreDistributionColors[2] },
      { name: "Needs Work (<50%)", value: overall.scoreDistribution.needsImprovement, fill: scoreDistributionColors[3] },
    ].filter((d) => d.value > 0);

    return data;
  }, [overall]);

  const scoreDistributionConfig = useMemo(() => {
    const config: ChartConfig = {};
    scoreDistributionData.forEach((item) => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [scoreDistributionData]);

  return (
    <div className="flex flex-1 flex-col bg-background min-h-screen">
      {/* Header Section */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Insights
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics for your tests and students.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {overallLoading && (
          <div className="flex flex-1 items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="font-medium">Loading insights...</span>
            </div>
          </div>
        )}

        {!overallLoading && overall === null && (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed bg-card/50 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No data yet</h3>
            <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
              Create tests and collect submissions to see insights. Your
              analytics will appear here once students start taking tests.
            </p>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}

        {!overallLoading && overall && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Submissions
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {overall.summary.totalSubmissions}
                  </div>
                  <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                    Across {overall.summary.testsWithSubmissions} tests
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50 dark:border-green-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                    Average Score
                  </CardTitle>
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {overall.summary.averageMarkedPercentage ?? "—"}%
                  </div>
                  <p className="text-xs text-green-700/70 dark:text-green-300/70 mt-1">
                    From {overall.summary.markedSubmissions ?? 0} graded submissions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Unique Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {overall.summary.uniqueStudents}
                  </div>
                  <p className="text-xs text-purple-700/70 dark:text-purple-300/70 mt-1">
                    Have taken your tests
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Recent Activity
                  </CardTitle>
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {overall.summary.submissionsLast7Days}
                  </div>
                  <p className="text-xs text-orange-700/70 dark:text-orange-300/70 mt-1">
                    Submissions in last 7 days
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Submission Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Submission Trend
                  </CardTitle>
                  <CardDescription>
                    Daily submissions and average scores over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={submissionChartConfig}
                    className="h-[300px] w-full"
                  >
                    <AreaChart data={overall.submissionTrend}>
                      <defs>
                        <linearGradient id="fillSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-submissions)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-submissions)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })
                        }
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) =>
                              new Date(value).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            }
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="submissions"
                        stroke="var(--color-submissions)"
                        fill="url(#fillSubmissions)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Score Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of student performance across all tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scoreDistributionData.length > 0 ? (
                    <ChartContainer
                      config={scoreDistributionConfig}
                      className="h-[300px] w-full"
                    >
                      <PieChart>
                        <Pie
                          data={scoreDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {scoreDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      No graded submissions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Test Performance Section */}
            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Most Active Tests
                  </CardTitle>
                  <CardDescription>
                    Tests with the highest number of submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {overall.mostAttemptedTests.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      No submissions yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {overall.mostAttemptedTests.map((t: any, index: number) => (
                        <div
                          key={t.testId}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{t.testName}</div>
                            <div className="text-xs text-muted-foreground">
                              Last: {formatShortDate(t.lastSubmittedAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{t.submissions}</div>
                            <div className="text-xs text-muted-foreground">submissions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Performing Tests
                  </CardTitle>
                  <CardDescription>
                    Tests with the highest average scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {overall.topTestsByAverage.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      No graded submissions yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {overall.topTestsByAverage.map((t: any, index: number) => (
                        <div
                          key={t.testId}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{t.testName}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.markedSubmissions} graded submissions
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${getPercentageColor(t.averagePercentage)}`}>
                              {t.averagePercentage}%
                            </div>
                            <div className="text-xs text-muted-foreground">average</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Students Section */}
            <section>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Student Performance
                      </CardTitle>
                      <CardDescription>
                        Click on a student to view detailed insights
                      </CardDescription>
                    </div>
                    <div className="w-full sm:w-72">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          placeholder="Search students..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {studentsLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!studentsLoading && students && students.totalStudents === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No students have taken your tests yet.
                      </p>
                    </div>
                  )}

                  {!studentsLoading && students && students.totalStudents > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-3">
                        <span>
                          Showing{" "}
                          <span className="font-medium text-foreground">
                            {filteredStudents.length}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium text-foreground">
                            {students.totalStudents}
                          </span>{" "}
                          students
                        </span>
                        <span>
                          Total attempts:{" "}
                          <span className="font-medium text-foreground">
                            {students.totalAttempts}
                          </span>
                        </span>
                      </div>

                      {filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No students match your search.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredStudents.map((student: any) => (
                            <Link
                              key={student.normalizedName}
                              to={`/dashboard/insights/student/${encodeURIComponent(student.normalizedName)}`}
                              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg uppercase">
                                {(student.nameVariants[0] ?? student.normalizedName).charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate">
                                    {student.nameVariants[0] ?? student.normalizedName}
                                  </span>
                                  {student.nameVariants.length > 1 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{student.nameVariants.length - 1} alias
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    {student.attempts} attempts
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Last: {formatShortDate(student.lastAttemptAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${getPercentageColor(student.averagePercentage)}`}>
                                    {student.averagePercentage ?? "—"}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    avg score
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
