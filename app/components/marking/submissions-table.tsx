import { useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { Eye, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface SubmissionsTableProps {
  projectId: Id<"projects">;
  submissions: Doc<"submissions">[];
}

export function SubmissionsTable({
  projectId,
  submissions,
}: SubmissionsTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter submissions
  const unmarkedSubmissions = submissions.filter(
    (s) => s.status === "submitted"
  );
  const markedSubmissions = submissions.filter(
    (s) => s.status === "marked" || s.status === "returned"
  );

  // Search filter
  const filterSubmissions = (subs: Doc<"submissions">[]) => {
    if (!searchQuery) return subs;
    const query = searchQuery.toLowerCase();
    return subs.filter(
      (s) =>
        s.respondentName?.toLowerCase().includes(query) ||
        s.respondentEmail?.toLowerCase().includes(query)
    );
  };

  const filteredUnmarked = filterSubmissions(unmarkedSubmissions);
  const filteredMarked = filterSubmissions(markedSubmissions);

  const renderSubmissionRow = (submission: Doc<"submissions">) => {
    const submittedDate = submission.submittedAt
      ? format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")
      : "Not submitted";

    const isMarked = submission.status === "marked" || submission.status === "returned";
    
    return (
      <TableRow key={submission._id} className="cursor-pointer hover:bg-muted/50">
        <TableCell className="font-medium">
          {submission.respondentName || "Anonymous"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {submission.respondentEmail || "—"}
        </TableCell>
        <TableCell className="text-sm">{submittedDate}</TableCell>
        <TableCell>
          {isMarked ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {submission.earnedMarks !== undefined
                  ? submission.earnedMarks.toFixed(1)
                  : "—"}
              </span>
              <span className="text-muted-foreground">
                / {submission.totalMarks || "—"}
              </span>
              {submission.percentage !== undefined && (
                <Badge variant="secondary" className="ml-2">
                  {submission.percentage.toFixed(0)}%
                </Badge>
              )}
              {submission.grade && (
                <Badge
                  variant={
                    submission.grade === "A"
                      ? "default"
                      : submission.grade === "F"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {submission.grade}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(`/projects/${projectId}/marking/${submission._id}`)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            {isMarked ? "View" : "Mark"}
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unmarked" className="w-full">
        <TabsList>
          <TabsTrigger value="unmarked">
            Unmarked ({unmarkedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="marked">
            Marked ({markedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unmarked" className="mt-4">
          {filteredUnmarked.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No submissions found matching your search"
                  : "No unmarked submissions"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnmarked.map(renderSubmissionRow)}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="marked" className="mt-4">
          {filteredMarked.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No submissions found matching your search"
                  : "No marked submissions yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{filteredMarked.map(renderSubmissionRow)}</TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

