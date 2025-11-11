"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  Download,
  Mail,
  Sparkles,
  Flag,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "sonner";

type FilterTab = "all" | "unmarked" | "marked" | "flagged";

export default function MarkingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"projects">;

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutoMarkDialog, setShowAutoMarkDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [isAutoMarking, setIsAutoMarking] = useState(false);

  // Load project and submissions
  const project = useQuery(api.projects.getProject, { projectId });
  const allSubmissions = useQuery(api.submissions.getProjectSubmissions, {
    projectId,
  });
  const questions = useQuery(api.questions.getProjectQuestions, { projectId });

  // Mutations
  const autoGradeSubmission = useMutation(api.submissions.autoGradeSubmission);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!allSubmissions) return null;

    const total = allSubmissions.length;
    const marked = allSubmissions.filter(
      (s) => s.status === "marked" || s.status === "returned",
    ).length;
    const unmarked = allSubmissions.filter(
      (s) => s.status === "submitted",
    ).length;
    const flagged = allSubmissions.filter((s) => s.flagged).length;

    const markedSubmissions = allSubmissions.filter(
      (s) => s.status === "marked" || s.status === "returned",
    );
    const totalGrade = markedSubmissions.reduce(
      (sum, s) => sum + (s.percentage || 0),
      0,
    );
    const averageGrade =
      markedSubmissions.length > 0 ? totalGrade / markedSubmissions.length : 0;

    // Grade distribution
    const gradeDistribution = {
      A: markedSubmissions.filter((s) => (s.percentage || 0) >= 90).length,
      B: markedSubmissions.filter(
        (s) => (s.percentage || 0) >= 80 && (s.percentage || 0) < 90,
      ).length,
      C: markedSubmissions.filter(
        (s) => (s.percentage || 0) >= 70 && (s.percentage || 0) < 80,
      ).length,
      D: markedSubmissions.filter(
        (s) => (s.percentage || 0) >= 60 && (s.percentage || 0) < 70,
      ).length,
      F: markedSubmissions.filter((s) => (s.percentage || 0) < 60).length,
    };

    return {
      total,
      marked,
      unmarked,
      flagged,
      averageGrade,
      gradeDistribution,
      completionRate: total > 0 ? (marked / total) * 100 : 0,
    };
  }, [allSubmissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    if (!allSubmissions) return [];

    let filtered = allSubmissions;

    // Apply tab filter
    if (activeTab === "unmarked") {
      filtered = filtered.filter((s) => s.status === "submitted");
    } else if (activeTab === "marked") {
      filtered = filtered.filter(
        (s) => s.status === "marked" || s.status === "returned",
      );
    } else if (activeTab === "flagged") {
      filtered = filtered.filter((s) => s.flagged);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentName.toLowerCase().includes(query) ||
          s.studentEmail.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allSubmissions, activeTab, searchQuery]);

  // Grade distribution for chart
  const gradeData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        name: "A (90-100%)",
        value: stats.gradeDistribution.A,
        fill: "hsl(142, 76%, 36%)",
      },
      {
        name: "B (80-89%)",
        value: stats.gradeDistribution.B,
        fill: "hsl(173, 58%, 39%)",
      },
      {
        name: "C (70-79%)",
        value: stats.gradeDistribution.C,
        fill: "hsl(43, 96%, 56%)",
      },
      {
        name: "D (60-69%)",
        value: stats.gradeDistribution.D,
        fill: "hsl(27, 96%, 61%)",
      },
      {
        name: "F (<60%)",
        value: stats.gradeDistribution.F,
        fill: "hsl(0, 72%, 51%)",
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Handle auto-mark all
  const handleAutoMarkAll = async () => {
    setShowAutoMarkDialog(false);
    setIsAutoMarking(true);

    try {
      const unmarkedSubmissions =
        allSubmissions?.filter((s) => s.status === "submitted") || [];
      let successCount = 0;
      let errorCount = 0;

      for (const submission of unmarkedSubmissions) {
        try {
          await autoGradeSubmission({ submissionId: submission._id });
          successCount++;
        } catch (error) {
          console.error(
            `Failed to auto-grade submission ${submission._id}:`,
            error,
          );
          errorCount++;
        }
      }

      toast.success(
        `Auto-graded ${successCount} submission${successCount !== 1 ? "s" : ""}${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
      );
    } catch (error) {
      toast.error("Failed to auto-grade submissions");
    } finally {
      setIsAutoMarking(false);
    }
  };

  // Handle export grades
  const handleExportGrades = () => {
    setShowExportDialog(false);

    try {
      if (!allSubmissions || !project) return;

      // Create CSV content
      const headers = [
        "Student Name",
        "Email",
        "Status",
        "Grade",
        "Percentage",
        "Submitted At",
        "Time Taken",
      ];
      const rows = allSubmissions.map((s) => [
        s.studentName,
        s.studentEmail,
        s.status,
        s.status === "marked" || s.status === "returned"
          ? `${s.awardedMarks}/${s.totalMarks}`
          : "—",
        s.status === "marked" || s.status === "returned"
          ? `${s.percentage?.toFixed(1)}%`
          : "—",
        s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—",
        s.timeSpent
          ? `${Math.floor(s.timeSpent / 60000)}m ${Math.floor((s.timeSpent % 60000) / 1000)}s`
          : "—",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title}_grades_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Grades exported successfully");
    } catch (error) {
      toast.error("Failed to export grades");
    }
  };

  // Handle send feedback
  const handleSendFeedback = () => {
    setShowFeedbackDialog(false);
    // TODO: Implement email sending functionality
    toast.success("Feedback emails queued for delivery");
  };

  if (!project || !allSubmissions || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/app">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>My Tests</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {project.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link href={`/app/${projectId}/edit`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </Link>
            <Link href={`/app/${projectId}/options`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Options
              </button>
            </Link>
            <Link href={`/app/${projectId}/preview`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Preview
              </button>
            </Link>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
              Mark
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Average Grade
              </h3>
            </div>
            {gradeData.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ChartContainer config={{}} className="h-40 w-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {gradeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="text-center mt-2">
                  <div className="text-3xl font-bold">
                    {Math.round(stats.averageGrade)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Class Average
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">
                  No graded submissions yet
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Pending
              </h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.unmarked}</div>
            <p className="text-sm text-muted-foreground mb-4">
              Unmarked submissions
            </p>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.marked}/{stats.total} marked
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Completion
              </h3>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.total}</div>
            <p className="text-sm text-muted-foreground mb-4">
              Total submissions
            </p>
            {stats.flagged > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <Flag className="w-4 h-4" />
                <span className="text-sm">{stats.flagged} flagged</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
                onClick={() => setShowAutoMarkDialog(true)}
                disabled={stats.unmarked === 0 || isAutoMarking}
              >
                <Sparkles className="w-4 h-4" />
                {isAutoMarking ? "Marking..." : "Auto-mark All"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
                onClick={() => setShowExportDialog(true)}
                disabled={stats.total === 0}
              >
                <Download className="w-4 h-4" />
                Export Grades
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
                onClick={() => setShowFeedbackDialog(true)}
                disabled={stats.marked === 0}
              >
                <Mail className="w-4 h-4" />
                Send Feedback
              </Button>
            </div>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("unmarked")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    activeTab === "unmarked"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Unmarked
                  {stats.unmarked > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {stats.unmarked}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("marked")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "marked"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Marked
                </button>
                <button
                  onClick={() => setActiveTab("flagged")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "flagged"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Flagged
                </button>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Student</th>
                  <th className="text-left p-4 text-sm font-medium">
                    Submitted
                  </th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Grade</th>
                  <th className="text-left p-4 text-sm font-medium">Time</th>
                  <th className="text-right p-4 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/app/${projectId}/mark/${submission._id}`)
                      }
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {submission.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {submission.studentName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {submission.studentEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleString()
                          : "In progress"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            submission.status === "marked" ||
                            submission.status === "returned"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {submission.status}
                        </Badge>
                        {submission.flagged && (
                          <Flag className="w-4 h-4 text-orange-500 inline ml-2" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {submission.status === "marked" ||
                          submission.status === "returned"
                            ? `${submission.awardedMarks}/${submission.totalMarks}`
                            : "—"}
                        </div>
                        {(submission.status === "marked" ||
                          submission.status === "returned") && (
                          <div className="text-sm text-muted-foreground">
                            {submission.percentage?.toFixed(1)}%
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {submission.timeSpent
                          ? `${Math.floor(submission.timeSpent / 60000)}m ${Math.floor((submission.timeSpent % 60000) / 1000)}s`
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={
                            submission.status === "marked" ||
                            submission.status === "returned"
                              ? "outline"
                              : "default"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/app/${projectId}/mark/${submission._id}`,
                            );
                          }}
                        >
                          {submission.status === "marked" ||
                          submission.status === "returned"
                            ? "Review"
                            : "Mark"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Auto-mark dialog */}
      <AlertDialog
        open={showAutoMarkDialog}
        onOpenChange={setShowAutoMarkDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auto-mark all submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will automatically grade all auto-gradable questions
              (multiple choice, multiple select) for {stats.unmarked} unmarked
              submission{stats.unmarked !== 1 ? "s" : ""}. Questions requiring
              manual grading will remain unmarked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAutoMarkAll}>
              Auto-mark All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export grades to CSV?</AlertDialogTitle>
            <AlertDialogDescription>
              This will download a CSV file containing all submissions with
              student names, emails, grades, and timestamps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExportGrades}>
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback dialog */}
      <AlertDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send feedback to students?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send email notifications to all {stats.marked} student
              {stats.marked !== 1 ? "s" : ""} with marked submissions, including
              their grades and feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendFeedback}>
              Send Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
