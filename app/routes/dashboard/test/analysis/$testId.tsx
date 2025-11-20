"use client";

import type { Route } from "./+types/$testId";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Question Analysis | XAM" },
  ];
}

export default function QuestionAnalysisPage() {
  const params = useParams();
  const navigate = useNavigate();
  const testId = params.testId as Id<"tests">;

  const submissionsData = useQuery(api.tests.getTestSubmissions, testId ? { testId } : "skip");
  const test = useQuery(api.tests.getTest, testId ? { testId } : "skip");

  if (submissionsData === undefined || test === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { questionAnalytics, statistics } = submissionsData;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">Question Analysis</h2>
          </div>
          <p className="text-muted-foreground ml-12">{test.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/dashboard/test/new?testId=${testId}&tab=marking`}>
            Back to Submissions
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {questionAnalytics && questionAnalytics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {questionAnalytics.slice(0, 3).map((q, i) => (
            <Card key={q.fieldId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Most Missed #{i + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{q.averagePercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={q.label}>
                  {q.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {q.averageScore.toFixed(1)} / {q.maxScore}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance</CardTitle>
          <CardDescription>
            Average performance per question based on {statistics.marked} marked submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questionAnalytics && questionAnalytics.length > 0 ? (
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionAnalytics}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis 
                    dataKey="label" 
                    type="category" 
                    width={200} 
                    tickFormatter={(value) => value.length > 30 ? `${value.substring(0, 30)}...` : value}
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.label}</p>
                            <p className="text-sm text-muted-foreground">
                              Average: {data.averagePercentage}% ({data.averageScore.toFixed(1)}/{data.maxScore})
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Based on {data.count} marked submissions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="averagePercentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Average Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No question data available yet. Mark some submissions to see analysis.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

