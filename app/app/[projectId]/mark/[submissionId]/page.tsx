"use client"

import { useState } from "react"
import { ChevronLeft, CheckCircle2, XCircle, Flag, Save, Send } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { mockSubmissions } from "@/lib/mock-data"

const mockQuestions = [
  {
    id: "q1",
    type: "multiple-choice",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
    correctAnswer: "Mitochondria",
    studentAnswer: "Mitochondria",
    marks: 2,
    awarded: 2,
  },
  {
    id: "q2",
    type: "short-answer",
    question: "Explain the process of photosynthesis in plants.",
    studentAnswer:
      "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
    marks: 5,
    awarded: 4,
  },
  {
    id: "q3",
    type: "multiple-select",
    question: "Which of the following are types of RNA? (Select all that apply)",
    options: ["mRNA", "tRNA", "rRNA", "DNA"],
    correctAnswers: ["mRNA", "tRNA", "rRNA"],
    studentAnswers: ["mRNA", "tRNA", "rRNA"],
    marks: 3,
    awarded: 3,
  },
  {
    id: "q4",
    type: "long-answer",
    question: "Describe the structure and function of the human heart.",
    studentAnswer:
      "The human heart is a muscular organ with four chambers. It pumps blood throughout the body. The right side receives deoxygenated blood and pumps it to the lungs, while the left side receives oxygenated blood from the lungs and pumps it to the body.",
    marks: 10,
    awarded: 0,
  },
]

export default function MarkSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const submission = mockSubmissions.find((s) => s.id === params.submissionId)
  const [questions, setQuestions] = useState(mockQuestions)
  const [feedback, setFeedback] = useState("")

  if (!submission) {
    return <div>Submission not found</div>
  }

  const totalAwarded = questions.reduce((sum, q) => sum + (q.awarded || 0), 0)
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)

  const updateMarks = (questionId: string, marks: number) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, awarded: marks } : q)))
  }

  const handleSave = () => {
    // Save logic here
    alert("Marks saved successfully!")
  }

  const handleReturn = () => {
    // Return to student logic here
    alert("Feedback sent to student!")
    router.push(`/app/${params.projectId}/mark`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/app/${params.projectId}/mark`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Biology Midterm Exam</span>
                <span>/</span>
                <span className="text-foreground font-medium">Marking</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSave} className="gap-2 bg-transparent">
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button onClick={handleReturn} className="gap-2">
                <Send className="w-4 h-4" />
                Return to Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      <Badge variant="outline">{question.marks} marks</Badge>
                      {question.type === "multiple-choice" || question.type === "multiple-select" ? (
                        question.studentAnswer === question.correctAnswer ||
                        JSON.stringify(question.studentAnswers?.sort()) ===
                          JSON.stringify(question.correctAnswers?.sort()) ? (
                          <Badge className="gap-1 bg-green-500/10 text-green-700 border-green-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-red-500/10 text-red-700 border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Incorrect
                          </Badge>
                        )
                      ) : null}
                    </div>
                    <h3 className="text-lg font-medium mb-4">{question.question}</h3>
                  </div>
                </div>

                {/* Multiple Choice */}
                {question.type === "multiple-choice" && (
                  <div className="space-y-3 mb-4">
                    {question.options?.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border-2 ${
                          option === question.correctAnswer
                            ? "border-green-500 bg-green-500/5"
                            : option === question.studentAnswer
                              ? "border-red-500 bg-red-500/5"
                              : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {option === question.correctAnswer && (
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Correct</Badge>
                          )}
                          {option === question.studentAnswer && option !== question.correctAnswer && (
                            <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Student's Answer</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Multiple Select */}
                {question.type === "multiple-select" && (
                  <div className="space-y-3 mb-4">
                    {question.options?.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border-2 ${
                          question.correctAnswers?.includes(option)
                            ? "border-green-500 bg-green-500/5"
                            : question.studentAnswers?.includes(option)
                              ? "border-red-500 bg-red-500/5"
                              : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          <div className="flex items-center gap-2">
                            {question.correctAnswers?.includes(option) && (
                              <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Correct</Badge>
                            )}
                            {question.studentAnswers?.includes(option) && (
                              <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short/Long Answer */}
                {(question.type === "short-answer" || question.type === "long-answer") && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Student's Answer:</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{question.studentAnswer}</p>
                    </div>
                  </div>
                )}

                {/* Marks Input */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Label className="text-sm font-medium">Marks:</Label>
                  <Input
                    type="number"
                    min="0"
                    max={question.marks}
                    value={question.awarded}
                    onChange={(e) => updateMarks(question.id, Number.parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">/ {question.marks}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Student Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Taken:</span>
                  <span>
                    {Math.floor(submission.timeTaken / 60)}m {submission.timeTaken % 60}s
                  </span>
                </div>
                {submission.flagged && (
                  <div className="flex items-center gap-2 text-orange-600 pt-2">
                    <Flag className="w-4 h-4" />
                    <span>Flagged for review</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Grade Summary */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Grade Summary</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">
                  {totalAwarded}/{totalMarks}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.round((totalAwarded / totalMarks) * 100)}%
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex justify-between">
                    <span className="text-muted-foreground">Q{i + 1}:</span>
                    <span>
                      {q.awarded}/{q.marks}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feedback */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Feedback</h3>
              <Textarea
                placeholder="Add feedback for the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-32"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
