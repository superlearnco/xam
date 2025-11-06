"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, MoreVertical, Clock, Users, FileText, ClipboardList, MessageSquare } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { CreateProjectModal } from "@/components/create-project-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockProjects } from "@/lib/mock-data"
import Link from "next/link"

const typeConfig = {
  test: {
    icon: FileText,
    color: "bg-blue-100 text-blue-700",
    label: "Test",
  },
  essay: {
    icon: ClipboardList,
    color: "bg-purple-100 text-purple-700",
    label: "Essay",
  },
  survey: {
    icon: MessageSquare,
    color: "bg-green-100 text-green-700",
    label: "Survey",
  },
}

const statusConfig = {
  draft: { color: "bg-gray-100 text-gray-700", label: "Draft" },
  published: { color: "bg-green-100 text-green-700", label: "Published" },
  archived: { color: "bg-orange-100 text-orange-700", label: "Archived" },
}

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const filteredProjects = mockProjects.filter((project) => filterType === "all" || project.type === filterType)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tests</h1>
            <p className="text-muted-foreground">Manage your tests, essays, and surveys</p>
          </div>

          <Button size="lg" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Create New
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="essay">Essays</SelectItem>
              <SelectItem value="survey">Surveys</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const TypeIcon = typeConfig[project.type].icon

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    <TypeIcon className="w-16 h-16 text-primary/40" />
                    <Badge className={`absolute top-3 right-3 ${typeConfig[project.type].color}`}>
                      {typeConfig[project.type].label}
                    </Badge>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.submissions}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={statusConfig[project.status].color}>
                        {statusConfig[project.status].label}
                      </Badge>

                      <Link href={`/app/${project.id}/edit`}>
                        <Button size="sm" variant="ghost">
                          {project.status === "draft" ? "Continue" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {filterType === "all"
                ? "Create your first project to get started"
                : `No ${filterType}s found. Try a different filter.`}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Project
            </Button>
          </motion.div>
        )}
      </div>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
