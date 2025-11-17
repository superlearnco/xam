"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NewTestDialog } from "~/components/dashboard/new-test-dialog";

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "test" | "survey" | "essay"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "recency">("recency");

  const tests = useQuery(api.tests.listTests, {
    search: search.trim() || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    sortBy,
  });

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case "test":
        return "default";
      case "survey":
        return "secondary";
      case "essay":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          {/* Header with New button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your tests, surveys, and essays
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>New</Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as "all" | "test" | "survey" | "essay")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "name" | "recency")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="recency">Recency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tests List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests === undefined ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Loading...
              </div>
            ) : tests.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                {search || typeFilter !== "all"
                  ? "No tests found matching your criteria"
                  : "No tests yet. Create your first test!"}
              </div>
            ) : (
              tests.map((test) => (
                <Card key={test._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2">{test.name}</CardTitle>
                      <Badge variant={getTypeVariant(test.type)}>
                        {getTypeLabel(test.type)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {new Date(test.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button disabled variant="outline" className="w-full">
                            View
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming Soon</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <NewTestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
