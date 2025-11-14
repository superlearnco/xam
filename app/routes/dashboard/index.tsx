import { useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "react-router";
import { FileCheck, PenTool, ClipboardList, Plus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { StatCard } from "~/components/shared/stat-card";
import { EmptyState } from "~/components/shared/empty-state";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ProjectCard } from "~/components/dashboard/project-card";
import { CreateProjectDialog } from "~/components/dashboard/create-project-dialog";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);
  const stats = useQuery(api.projects.getStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter and sort projects
  const filteredProjects = projects
    ?.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || project.type === filterType;
      const matchesStatus = filterStatus === "all" || project.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "type":
          return a.type.localeCompare(b.type);
        case "recent":
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Stats Overview */}
          <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
            <StatCard
              title="Tests"
              value={stats?.testCount ?? 0}
              icon={FileCheck}
              description="Multiple choice & graded"
            />
            <StatCard
              title="Essays"
              value={stats?.essayCount ?? 0}
              icon={PenTool}
              description="Long-form responses"
            />
            <StatCard
              title="Surveys"
              value={stats?.surveyCount ?? 0}
              icon={ClipboardList}
              description="Feedback collection"
            />
            <StatCard
              title="Submissions"
              value={stats?.totalSubmissions ?? 0}
              icon={FileCheck}
              description="Total responses"
            />
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">My Projects</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="essay">Essays</SelectItem>
                  <SelectItem value="survey">Surveys</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="px-4 lg:px-6">
            {filteredProjects === undefined ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg border bg-muted" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                icon={projects?.length === 0 ? Plus : FileCheck}
                title={projects?.length === 0 ? "No projects yet" : "No projects found"}
                description={
                  projects?.length === 0
                    ? "Create your first project to get started"
                    : "Try adjusting your search or filters"
                }
                action={
                  projects?.length === 0 ? (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
