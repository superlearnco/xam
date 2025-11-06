"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Flag, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useParams } from "next/navigation"

const testQuestions = [
  {
    id: 1,
    text: "What is the powerhouse of the cell?",
    points: 5,
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctAnswer: 1,
  },
  {
    id: 2,
    text: "Which process do plants use to make food?",
    points: 5,
    options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
    correctAnswer: 1,
  },
  {
    id: 3,
    text: "What is the largest organ in the human body?",
    points: 5,
    options: ["Heart", "Liver", "Skin", "Brain"],
    correctAnswer: 2,
  },
  {
    id: 4,
    text: "Which blood type is known as the universal donor?",
    points: 5,
    options: ["A+", "B+", "AB+", "O-"],
    correctAnswer: 3,
  },
]

export default function TestPage() {
  const params = useParams()
  const [stage, setStage] = useState<"pre-test" | "test" | "submitted">("pre-test")
  const [studentName, setStudentName] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(45 * 60) // 45 minutes in seconds
  const [flagged, setFlagged] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (stage === "test" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [stage, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartTest = () => {
    if (studentName.trim()) {
      setStage("test")
    }
  }

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex })
  }

  const handleSubmit = () => {
    setStage("submitted")
  }

  const toggleFlag = () => {
    const newFlagged = new Set(flagged)
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion)
    } else {
      newFlagged.add(currentQuestion)
    }
    setFlagged(newFlagged)
  }

  const calculateScore = () => {
    let correct = 0
    testQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct += q.points
      }
    })
    return correct
  }

  const totalPoints = testQuestions.reduce((sum, q) => sum + q.points, 0)
  const score = calculateScore()
  const percentage = Math.round((score / totalPoints) * 100)

  if (stage === "pre-test") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="p-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/superlearn-full.png"
                alt="Superlearn"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </div>

            <h1 className="text-2xl font-bold mb-2 text-center">Biology Midterm Exam</h1>
            <p className="text-muted-foreground mb-6 text-center">Complete all questions to the best of your ability</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Duration</span>
                <span className="text-sm">45 minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Questions</span>
                <span className="text-sm">{testQuestions.length} questions</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Points</span>
                <span className="text-sm">{totalPoints} marks</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2"
                  autoFocus
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="honor-code" />
                <label htmlFor="honor-code" className="text-sm text-muted-foreground cursor-pointer">
                  I will complete this test honestly and independently
                </label>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleStartTest} disabled={!studentName.trim()}>
              Start Test
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (stage === "submitted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-bold mb-2">Test Submitted Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              Your submission has been recorded. Confirmation #XAM-{Math.floor(Math.random() * 10000)}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-muted/50">
                <div className="text-4xl font-bold mb-2">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </Card>
              <Card className="p-6 bg-muted/50">
                <div className="text-4xl font-bold mb-2">
                  {score}/{totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </Card>
              <Card className="p-6 bg-muted/50">
                <div className="text-4xl font-bold mb-2">
                  {percentage >= 90
                    ? "A"
                    : percentage >= 80
                      ? "B"
                      : percentage >= 70
                        ? "C"
                        : percentage >= 60
                          ? "D"
                          : "F"}
                </div>
                <div className="text-sm text-muted-foreground">Letter Grade</div>
              </Card>
            </div>

            <div className="space-y-3 mb-8">
              {testQuestions.map((q, idx) => (
                <div key={q.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {answers[idx] === q.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Correct</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-red-600">Incorrect</span>
                      </>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {answers[idx] === q.correctAnswer ? q.points : 0}/{q.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" asChild>
              <a href="/">Return to Home</a>
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  const question = testQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / testQuestions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-semibold">Biology Midterm Exam</h1>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300
                ? "bg-red-100 text-red-700"
                : timeRemaining < 600
                  ? "bg-orange-100 text-orange-700"
                  : "bg-muted"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {testQuestions.length}
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Question {currentQuestion + 1}</Badge>
                  <Badge variant="secondary">{question.points} marks</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFlag}
                  className={flagged.has(currentQuestion) ? "text-orange-600" : ""}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              <h2 className="text-2xl font-semibold mb-8">{question.text}</h2>

              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion, idx)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      answers[currentQuestion] === idx
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === idx ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {answers[currentQuestion] === idx && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestion === testQuestions.length - 1 ? (
            <Button onClick={handleSubmit} size="lg" className="gap-2">
              Submit Test
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(testQuestions.length - 1, currentQuestion + 1))}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-8 gap-2">
            {testQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                  idx === currentQuestion
                    ? "border-primary bg-primary text-primary-foreground"
                    : answers[idx] !== undefined
                      ? "border-green-500 bg-green-50 text-green-700"
                      : flagged.has(idx)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-border hover:border-primary/50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50" />
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-50" />
              <span className="text-muted-foreground">Flagged</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
