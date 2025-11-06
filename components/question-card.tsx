"use client"

import { useState } from "react"
import { GripVertical, Trash2, Copy, Sparkles, Plus, X, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface QuestionCardProps {
  question: {
    id: string
    type: string
    questionText: string
    points: number
    options?: string[]
    correctAnswer?: number
  }
  index: number
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}

export function QuestionCard({ question, index, onUpdate, onDelete }: QuestionCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateOptions = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const newOptions = [
        ...(question.options || []),
        "AI-generated option 1",
        "AI-generated option 2",
        "AI-generated option 3",
      ]
      onUpdate(question.id, { options: newOptions })
      setIsGenerating(false)
    }, 1500)
  }

  const addOption = () => {
    const newOptions = [...(question.options || []), ""]
    onUpdate(question.id, { options: newOptions })
  }

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[optionIndex] = value
    onUpdate(question.id, { options: newOptions })
  }

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options?.filter((_, i) => i !== optionIndex)
    onUpdate(question.id, { options: newOptions })
  }

  const setCorrectAnswer = (optionIndex: number) => {
    onUpdate(question.id, { correctAnswer: optionIndex })
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <button className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Question {index + 1}</Badge>
              <Badge className="bg-blue-100 text-blue-700">Multiple Choice</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(question.id, { points: Number.parseInt(e.target.value) || 0 })}
                className="w-20 text-right"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">marks</span>
              <Button variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <Textarea
              value={question.questionText}
              onChange={(e) => onUpdate(question.id, { questionText: e.target.value })}
              placeholder="Enter your question..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Options */}
          {question.type === "multiple-choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Answer Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateOptions}
                  disabled={isGenerating || !question.correctAnswer}
                  className="gap-2 bg-transparent"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate Options"}
                </Button>
              </div>

              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <button
                      onClick={() => setCorrectAnswer(optionIndex)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        question.correctAnswer === optionIndex ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {question.correctAnswer === optionIndex && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeOption(optionIndex)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addOption} className="gap-2 bg-transparent">
                <Plus className="w-4 h-4" />
                Add Option
              </Button>
            </div>
          )}

          {/* Quick Settings */}
          <div className="flex items-center gap-6 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Switch id={`required-${question.id}`} />
              <Label htmlFor={`required-${question.id}`} className="text-sm cursor-pointer">
                Required
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id={`randomize-${question.id}`} />
              <Label htmlFor={`randomize-${question.id}`} className="text-sm cursor-pointer">
                Randomize
              </Label>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
