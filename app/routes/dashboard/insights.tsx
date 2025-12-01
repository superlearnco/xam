import type { Route } from "./+types/insights";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

export function meta(_: Route.MetaArgs) {
  return [
    {
      title: "Insights | XAM",
    },
  ];
}

function formatDate(ts: number | null | undefined) {
  if (!ts) return "N/A";
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

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
      return s.nameVariants?.some(
        (name: string) => name.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch]);

  const overallLoading = overall === undefined;
  const studentsLoading = students === undefined;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Insights
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Get a high-level view of how your tests are performing, then drill
            into individual students. Student names are merged ignoring
            capitalization and extra spaces.
          </p>
        </div>
      </section>

      <Tabs defaultValue="overall" className="flex-1">
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-4 space-y-6">
          {overallLoading && (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading overall insights…</span>
              </div>
            </div>
          )}

          {!overallLoading && overall === null && (
            <Card>
              <CardHeader>
                <CardTitle>No data yet</CardTitle>
                <CardDescription>
                  Create tests and collect submissions to see overall insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once students start submitting tests, you&apos;ll see
                  aggregate trends here, including average scores and your most
                  attempted tests.
                </p>
              </CardContent>
            </Card>
          )}

          {!overallLoading && overall && (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>Usage across all tests</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tests with submissions
                      </span>
                      <span className="text-xl font-semibold">
                        {overall.summary.testsWithSubmissions} /{" "}
                        {overall.summary.totalTests}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total submissions
                      </span>
                      <span className="text-xl font-semibold">
                        {overall.summary.totalSubmissions}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                      <span>
                        Submissions (last 7 days):{" "}
                        <span className="font-medium">
                          {overall.summary.submissionsLast7Days}
                        </span>
                      </span>
                      <span>
                        Last submission:{" "}
                        {formatDate(overall.summary.lastSubmissionAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                    <CardDescription>Marked submissions only</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        Average %
                      </span>
                      <span className="text-2xl font-semibold">
                        {overall.summary.averageMarkedPercentage ?? "—"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on all marked submissions across your tests.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Unique respondents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        Unique students
                      </span>
                      <span className="text-2xl font-semibold">
                        {overall.summary.uniqueStudents}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Names are de-duplicated by case-insensitive, whitespace
                      normalized matching.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Most attempted tests</CardTitle>
                    <CardDescription>
                      Tests with the highest number of submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overall.mostAttemptedTests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No submissions yet.
                      </p>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {overall.mostAttemptedTests.map((t: any) => (
                          <div
                            key={t.testId}
                            className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                          >
                            <div className="space-y-1">
                              <div className="font-medium">{t.testName}</div>
                              <div className="text-xs text-muted-foreground">
                                Last submission: {formatDate(t.lastSubmittedAt)}
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div>
                                Submissions:{" "}
                                <span className="font-medium">
                                  {t.submissions}
                                </span>
                              </div>
                              <div>
                                Marked:{" "}
                                <span className="font-medium">
                                  {t.markedSubmissions}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top tests by average %</CardTitle>
                    <CardDescription>
                      Based on marked submissions only
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overall.topTestsByAverage.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No marked submissions yet.
                      </p>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {overall.topTestsByAverage.map((t: any) => (
                          <div
                            key={t.testId}
                            className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                          >
                            <div className="space-y-1">
                              <div className="font-medium">{t.testName}</div>
                              <div className="text-xs text-muted-foreground">
                                Average %:{" "}
                                <span className="font-medium">
                                  {t.averagePercentage ?? "—"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div>
                                Submissions:{" "}
                                <span className="font-medium">
                                  {t.submissions}
                                </span>
                              </div>
                              <div>
                                Marked:{" "}
                                <span className="font-medium">
                                  {t.markedSubmissions}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-4 space-y-4">
          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Student insights</h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Browse all students who have submitted any test. Search by
                  name to quickly find a student. Names that differ only by
                  capitalization or spacing are merged.
                </p>
              </div>
              <div className="w-full max-w-xs">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Search students
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Start typing a name…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {studentsLoading && (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading student insights…</span>
              </div>
            </div>
          )}

          {!studentsLoading && students && students.totalStudents === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No students yet</CardTitle>
                <CardDescription>
                  When students start submitting tests, they&apos;ll appear
                  here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll see a list of students along with attempts,
                  average percentages, and recency of their last attempt.
                </p>
              </CardContent>
            </Card>
          )}

          {!studentsLoading && students && students.totalStudents > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing{" "}
                  <span className="font-medium">{filteredStudents.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {students.totalStudents}
                  </span>{" "}
                  students
                </span>
                <span>
                  Total attempts:{" "}
                  <span className="font-medium">
                    {students.totalAttempts}
                  </span>
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-sm text-muted-foreground">
                    No students match your search.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student.normalizedName}
                      className="grid gap-2 rounded-lg border bg-card px-4 py-3 text-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)]"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {student.nameVariants[0] ?? student.normalizedName}
                        </div>
                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                          {student.nameVariants.slice(1).map((name: string) => (
                            <Badge key={name} variant="outline">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-1 text-xs text-muted-foreground">
                        <span>
                          Attempts:{" "}
                          <span className="font-medium">
                            {student.attempts}
                          </span>
                        </span>
                        <span>
                          Marked:{" "}
                          <span className="font-medium">
                            {student.markedAttempts}
                          </span>
                        </span>
                        <span>
                          Avg %:{" "}
                          <span className="font-medium">
                            {student.averagePercentage ?? "—"}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-1 text-xs text-muted-foreground sm:items-end">
                        <span>
                          First: {formatDate(student.firstAttemptAt)}
                        </span>
                        <span>
                          Last: {formatDate(student.lastAttemptAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
