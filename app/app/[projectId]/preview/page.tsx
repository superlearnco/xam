"use client"

import { useState } from "react"
import { ChevronLeft, Eye } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useParams } from "next/navigation"

const mockQuestions = [
  {
    id: "q1",
    type: "multiple-choice",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
    marks: 2,
  },
  {
    id: "q2",
    type: "short-answer",
    question: "Explain the process of photosynthesis in plants.",
    marks: 5,
  },
  {
    id: "q3",
    type: "multiple-select",
    question: "Which of the following are types of RNA? (Select all that apply)",
    options: ["mRNA", "tRNA", "rRNA", "DNA"],
    marks: 3,
  },
  {
    id: "q4",
    type: "long-answer",
    question: "Describe the structure and function of the human heart.",
    marks: 10,
  },
]

export default function PreviewPage() {
  const params = useParams()
  const [answers, setAnswers] = useState<Record<string, any>>({})

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
            <Badge variant="secondary" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview Mode
            </Badge>
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
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">Preview</button>
            <Link href={`/app/${params.projectId}/mark`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Mark
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Biology Midterm Exam</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Total Marks: 50</span>
              <span>•</span>
              <span>Time Limit: 45 minutes</span>
              <span>•</span>
              <span>{mockQuestions.length} Questions</span>
            </div>
          </div>

          <div className="space-y-8">
            {mockQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-border pb-8 last:border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      <Badge variant="outline">{question.marks} marks</Badge>
                    </div>
                    <h3 className="text-lg font-medium">{question.question}</h3>
                  </div>
                </div>

                {question.type === "multiple-choice" && (
                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  >
                    <div className="space-y-3">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {question.type === "multiple-select" && (
                  <div className="space-y-3">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${question.id}-${optIndex}`}
                          checked={answers[question.id]?.includes(option)}
                          onCheckedChange={(checked) => {
                            const current = answers[question.id] || []
                            setAnswers({
                              ...answers,
                              [question.id]: checked
                                ? [...current, option]
                                : current.filter((o: string) => o !== option),
                            })
                          }}
                        />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "short-answer" && (
                  <Input
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    className="max-w-2xl"
                  />
                )}

                {question.type === "long-answer" && (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    className="min-h-32"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              This is a preview of how students will see the test. Changes made here will not be saved.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
