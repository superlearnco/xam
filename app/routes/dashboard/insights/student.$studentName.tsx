import { useParams, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
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
  ArrowLeft,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function meta({ params }: { params: { studentName: string } }) {
  const name = decodeURIComponent(params.studentName);
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  return [
    {
      title: `${displayName} - Student Insights | XAM`,
    },
  ];
}

function formatDate(ts: number | null | undefined) {
  if (!ts) return "N/A";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPercentageColor(percentage: number | null) {
  if (percentage === null) return "text-muted-foreground";
  if (percentage >= 90) return "text-green-600 dark:text-green-400";
  if (percentage >= 70) return "text-blue-600 dark:text-blue-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getPercentageBg(percentage: number | null) {
  if (percentage === null) return "bg-muted";
  if (percentage >= 90) return "bg-green-100 dark:bg-green-900/30";
  if (percentage >= 70) return "bg-blue-100 dark:bg-blue-900/30";
  if (percentage >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case "declining":
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    case "stable":
      return <Minus className="h-5 w-5 text-blue-600" />;
    default:
      return <Minus className="h-5 w-5 text-muted-foreground" />;
  }
}

function getTrendText(trend: string) {
  switch (trend) {
    case "improving":
      return { text: "Improving", color: "text-green-600 dark:text-green-400" };
    case "declining":
      return { text: "Declining", color: "text-red-600 dark:text-red-400" };
    case "stable":
      return { text: "Stable", color: "text-blue-600 dark:text-blue-400" };
    default:
      return { text: "Insufficient data", color: "text-muted-foreground" };
  }
}

const performanceChartConfig = {
  percentage: {
    label: "Score %",
    // Indigo-like primary
    color: "#4f46e5",
  },
} satisfies ChartConfig;

const testPerformanceConfig = {
  averagePercentage: {
    label: "Average %",
    // Indigo-like primary
    color: "#4f46e5",
  },
} satisfies ChartConfig;

const scoreDistributionColors = [
  "hsl(142, 76%, 36%)", // green for excellent
  "hsl(221, 83%, 53%)", // blue for good
  "hsl(45, 93%, 47%)", // yellow for average
  "hsl(0, 84%, 60%)", // red for needs work
];

export default function StudentInsightsPage() {
  const params = useParams();
  const studentName = decodeURIComponent(params.studentName || "");

  const studentData = useQuery(api.insights.getStudentInsights, {
    studentName: studentName,
  });

  const isLoading = studentData === undefined;

  const scoreDistributionData =
    studentData?.scoreDistribution
      ? [
          {
            name: "Excellent",
            value: studentData.scoreDistribution.excellent,
            fill: scoreDistributionColors[0],
          },
          {
            name: "Good",
            value: studentData.scoreDistribution.good,
            fill: scoreDistributionColors[1],
          },
          {
            name: "Average",
            value: studentData.scoreDistribution.average,
            fill: scoreDistributionColors[2],
          },
          {
            name: "Needs Work",
            value: studentData.scoreDistribution.needsImprovement,
            fill: scoreDistributionColors[3],
          },
        ].filter((d) => d.value > 0)
      : [];

  const scoreDistributionConfig: ChartConfig = {};
  scoreDistributionData.forEach((item) => {
    scoreDistributionConfig[item.name] = { label: item.name, color: item.fill };
  });

  const displayName = studentData?.student.nameVariants[0] || studentName;
  const capitalizedName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="flex flex-1 flex-col bg-background min-h-screen">
      {/* Header Section */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="w-fit">
              <Link to="/dashboard/insights">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Insights
              </Link>
            </Button>
          </div>
          {!isLoading && studentData && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold text-2xl uppercase">
                {capitalizedName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {capitalizedName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {studentData.student.nameVariants.length > 1 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Also known as:</span>
                      {studentData.student.nameVariants.slice(1).map((name) => (
                        <Badge key={name} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="font-medium">Loading student insights...</span>
            </div>
          </div>
        )}

        {!isLoading && studentData === null && (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed bg-card/50 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Student not found</h3>
            <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
              We couldn't find any data for this student. They may not have
              taken any tests yet.
            </p>
            <Button asChild>
              <Link to="/dashboard/insights">Back to Insights</Link>
            </Button>
          </div>
        )}

        {!isLoading && studentData && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Attempts
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {studentData.overall.attempts}
                  </div>
                  <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                    {studentData.overall.markedAttempts} graded
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
                    {studentData.overall.averagePercentage ?? "—"}%
                  </div>
                  <p className="text-xs text-green-700/70 dark:text-green-300/70 mt-1">
                    Overall performance
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Performance Trend
                  </CardTitle>
                  {getTrendIcon(studentData.overall.improvementTrend)}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getTrendText(studentData.overall.improvementTrend).color}`}
                  >
                    {getTrendText(studentData.overall.improvementTrend).text}
                  </div>
                  <p className="text-xs text-purple-700/70 dark:text-purple-300/70 mt-1">
                    Based on recent tests
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Tests Taken
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {studentData.perTest.length}
                  </div>
                  <p className="text-xs text-orange-700/70 dark:text-orange-300/70 mt-1">
                    Different tests attempted
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Best/Worst Test and Activity */}
            <section className="grid gap-4 md:grid-cols-3">
              {studentData.overall.bestTest && (
                <Card className="border-green-200/50 dark:border-green-800/50">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Best Performance
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Highest scoring test
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold truncate">
                      {studentData.overall.bestTest.name}
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {studentData.overall.bestTest.percentage}%
                    </div>
                  </CardContent>
                </Card>
              )}

              {studentData.overall.worstTest &&
                studentData.overall.worstTest.name !==
                  studentData.overall.bestTest?.name && (
                  <Card className="border-orange-200/50 dark:border-orange-800/50">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">
                          Needs Improvement
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Lowest scoring test
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="font-semibold truncate">
                        {studentData.overall.worstTest.name}
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {studentData.overall.worstTest.percentage}%
                      </div>
                    </CardContent>
                  </Card>
                )}

              <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Activity Period
                    </CardTitle>
                    <CardDescription className="text-xs">
                      First to last attempt
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">First: </span>
                    <span className="font-medium">
                      {formatDate(studentData.overall.firstAttemptAt)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last: </span>
                    <span className="font-medium">
                      {formatDate(studentData.overall.lastAttemptAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Over Time
                  </CardTitle>
                  <CardDescription>
                    Score progression across all test attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentData.performanceTrend.length > 0 ? (
                    <ChartContainer
                      config={performanceChartConfig}
                      className="h-[300px] w-full"
                    >
                      <AreaChart data={studentData.performanceTrend}>
                        <defs>
                          <linearGradient
                            id="fillPerformance"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-percentage)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-percentage)"
                              stopOpacity={0.1}
                            />
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
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          domain={[0, 100]}
                        />
                        <ReferenceLine
                          y={studentData.overall.averagePercentage ?? 0}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="5 5"
                          label={{
                            value: "Avg",
                            position: "right",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                          }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              }
                            />
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke="var(--color-percentage)"
                          fill="url(#fillPerformance)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      No graded submissions to display
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of performance levels
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
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="name" hideLabel />}
                        />
                        <ChartLegend
                          content={<ChartLegendContent nameKey="name" />}
                        />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      No graded submissions to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Test Performance Comparison */}
            {studentData.testPerformance.length > 0 && (
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance by Test
                    </CardTitle>
                    <CardDescription>
                      Average scores across different tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={testPerformanceConfig}
                      className="h-[300px] w-full"
                    >
                      <BarChart
                        data={studentData.testPerformance}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="testName"
                          tickLine={false}
                          axisLine={false}
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value, payload) => {
                                const item = payload?.[0]?.payload;
                                return item?.fullTestName || value;
                              }}
                            />
                          }
                        />
                        <Bar
                          dataKey="averagePercentage"
                          fill="var(--color-averagePercentage)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Test History Table */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Submission History
                  </CardTitle>
                  <CardDescription>
                    Complete record of all test attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentData.history
                          .slice()
                          .reverse()
                          .map((h, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {h.testName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(h.submittedAt)}
                              </TableCell>
                              <TableCell className="text-center">
                                {h.isMarked ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Graded
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {h.isMarked && h.percentage != null ? (
                                  <span
                                    className={`font-semibold ${getPercentageColor(h.percentage)}`}
                                  >
                                    {h.percentage}%
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Per-Test Summary */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Test Summary
                  </CardTitle>
                  <CardDescription>
                    Performance breakdown by each test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {studentData.perTest.map((test) => (
                      <div
                        key={test.testId}
                        className={`p-4 rounded-lg border ${getPercentageBg(test.averagePercentage)}`}
                      >
                        <div className="font-semibold truncate mb-2">
                          {test.testName}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Attempts:</span>
                            <span className="ml-1 font-medium">{test.attempts}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Graded:</span>
                            <span className="ml-1 font-medium">
                              {test.markedAttempts}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg:</span>
                            <span
                              className={`ml-1 font-bold ${getPercentageColor(test.averagePercentage)}`}
                            >
                              {test.averagePercentage ?? "—"}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latest:</span>
                            <span
                              className={`ml-1 font-bold ${getPercentageColor(test.latestPercentage)}`}
                            >
                              {test.latestPercentage ?? "—"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
