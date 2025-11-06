"use client"

import { useState } from "react"
import { ChevronLeft, Download, Mail, Sparkles, Flag, CheckCircle2, Clock } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useParams } from "next/navigation"
import { mockSubmissions } from "@/lib/mock-data"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const gradeData = [
  { name: "A (90-100%)", value: 3, fill: "hsl(var(--chart-1))" },
  { name: "B (80-89%)", value: 5, fill: "hsl(var(--chart-2))" },
  { name: "C (70-79%)", value: 4, fill: "hsl(var(--chart-3))" },
  { name: "D (60-69%)", value: 2, fill: "hsl(var(--chart-4))" },
  { name: "F (<60%)", value: 1, fill: "hsl(var(--chart-5))" },
]

export default function MarkingPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("all")

  const filteredSubmissions = mockSubmissions.filter((sub) => {
    if (activeTab === "unmarked") return sub.status === "submitted"
    if (activeTab === "marked") return sub.status === "marked"
    if (activeTab === "flagged") return sub.flagged
    return true
  })

  const unmarkedCount = mockSubmissions.filter((s) => s.status === "submitted").length

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
                <span className="text-foreground font-medium">Biology Midterm Exam</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link href={`/app/${params.projectId}/edit`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </Link>
            <Link href={`/app/${params.projectId}/options`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Options
              </button>
            </Link>
            <Link href={`/app/${params.projectId}/preview`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Preview
              </button>
            </Link>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">Mark</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Average Grade</h3>
            </div>
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
              <div className="text-3xl font-bold">78%</div>
              <div className="text-sm text-muted-foreground">Class Average</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-2">{unmarkedCount}</div>
            <p className="text-sm text-muted-foreground mb-4">Unmarked submissions</p>
            <Progress value={60} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">13/20 marked</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Completion</h3>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-2">18/25</div>
            <p className="text-sm text-muted-foreground mb-4">Students submitted</p>
            <Progress value={72} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">72% completion rate</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Sparkles className="w-4 h-4" />
                Auto-mark All
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export Grades
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Mail className="w-4 h-4" />
                Send Feedback
              </Button>
            </div>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("unmarked")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === "unmarked" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Unmarked
                {unmarkedCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unmarkedCount}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab("marked")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "marked" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Marked
              </button>
              <button
                onClick={() => setActiveTab("flagged")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "flagged" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Flagged
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Student</th>
                  <th className="text-left p-4 text-sm font-medium">Submitted</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Grade</th>
                  <th className="text-left p-4 text-sm font-medium">Time</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-border hover:bg-muted/50 transition-colors">
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
                          <div className="font-medium">{submission.studentName}</div>
                          <div className="text-sm text-muted-foreground">{submission.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={submission.status === "marked" ? "default" : "secondary"}>
                        {submission.status}
                      </Badge>
                      {submission.flagged && <Flag className="w-4 h-4 text-orange-500 inline ml-2" />}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {submission.status === "marked" ? `${submission.grade}/${submission.totalMarks}` : "—"}
                      </div>
                      {submission.status === "marked" && (
                        <div className="text-sm text-muted-foreground">{submission.percentage}%</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {Math.floor(submission.timeTaken / 60)}m {submission.timeTaken % 60}s
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/app/${params.projectId}/mark/${submission.id}`}>
                        <Button size="sm" variant={submission.status === "marked" ? "outline" : "default"}>
                          {submission.status === "marked" ? "Review" : "Mark"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
