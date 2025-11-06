"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, ClipboardList, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

const projectTypes = [
  {
    id: "test",
    icon: FileText,
    label: "Test",
    description: "Graded assessments with multiple question types",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "essay",
    icon: ClipboardList,
    label: "Essay",
    description: "Long-form written responses with AI-assisted marking",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "survey",
    icon: MessageSquare,
    label: "Survey",
    description: "Collect feedback with rating scales and open responses",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
]

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [selectedType, setSelectedType] = useState<string>("test")
  const [projectName, setProjectName] = useState("")
  const [useAI, setUseAI] = useState(false)
  const router = useRouter()

  const handleCreate = () => {
    if (projectName.trim()) {
      // Navigate to editor
      router.push(`/app/test_new/edit`)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-background rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Project</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Project Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                      </div>
                      <div className="font-semibold mb-1">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="project-name" className="text-base">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Biology Midterm Exam"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="use-ai"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="use-ai" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Use AI to generate questions</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!projectName.trim()} className="flex-1">
                  Create Project
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
