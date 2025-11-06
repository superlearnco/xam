"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Eye, Share2, Plus } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { FieldLibrary } from "@/components/field-library"
import { QuestionCard } from "@/components/question-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Question {
  id: string
  type: string
  questionText: string
  points: number
  options?: string[]
  correctAnswer?: number
}

export default function EditorPage() {
  const params = useParams()
  const [testTitle, setTestTitle] = useState("Biology Midterm Exam")
  const [testDescription, setTestDescription] = useState("Complete all questions to the best of your ability.")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "multiple-choice",
      questionText: "What is the powerhouse of the cell?",
      points: 5,
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
      correctAnswer: 1,
    },
    {
      id: "q2",
      type: "multiple-choice",
      questionText: "Which process do plants use to make food?",
      points: 5,
      options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
      correctAnswer: 1,
    },
  ])

  const addField = (fieldType: string) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: fieldType,
      questionText: "",
      points: 5,
      options: fieldType === "multiple-choice" ? ["", "", "", ""] : undefined,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Field Library */}
        <FieldLibrary onAddField={addField} />

        {/* Center Panel - Form Canvas */}
        <div className="flex-1 overflow-y-auto">
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
                    <span className="text-foreground font-medium">{testTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">All changes saved</span>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Publish
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">Edit</button>
                <Link href={`/app/${params.projectId}/options`}>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Options
                  </button>
                </Link>
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Preview
                </button>
                <Link href={`/app/${params.projectId}/mark`}>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Mark
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="text-3xl font-bold border-none px-0 mb-4 focus-visible:ring-0"
                placeholder="Test Title"
              />
              <Textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                className="resize-none border-none px-0 focus-visible:ring-0"
                placeholder="Add instructions or description..."
                rows={2}
              />
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="text-base">
                  Total: {totalPoints} marks
                </Badge>
              </div>
            </motion.div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuestionCard question={question} index={index} onUpdate={updateQuestion} onDelete={deleteQuestion} />
                </motion.div>
              ))}

              {/* Add Question Button */}
              <Button
                variant="outline"
                className="w-full h-20 border-dashed gap-2 bg-transparent"
                onClick={() => addField("multiple-choice")}
              >
                <Plus className="w-5 h-5" />
                Add Question
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-border bg-muted/30 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          <p className="text-sm text-muted-foreground">Select a question to view and edit its properties</p>
        </div>
      </div>
    </div>
  )
}
