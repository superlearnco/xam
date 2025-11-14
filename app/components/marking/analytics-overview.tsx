import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AnimatedNumber } from "~/components/shared";
import type { Doc } from "../../../convex/_generated/dataModel";

interface AnalyticsOverviewProps {
  statistics: {
    total: number;
    submitted: number;
    marked: number;
    inProgress: number;
    averageScore: number;
    gradeDistribution: Record<string, number>;
  };
}

export function AnalyticsOverview({ statistics }: AnalyticsOverviewProps) {
  const unmarkedCount = statistics.submitted - statistics.marked;
  const markedPercentage =
    statistics.submitted > 0
      ? (statistics.marked / statistics.submitted) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Class Average */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold">
                <AnimatedNumber
                  value={Math.round(statistics.averageScore)}
                  duration={800}
                />
                <span className="text-2xl text-muted-foreground">%</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {statistics.marked} submission{statistics.marked !== 1 ? "s" : ""}{" "}
              graded
            </p>
          </CardContent>
        </Card>

        {/* Unmarked Submissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unmarked Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold">
                <AnimatedNumber value={unmarkedCount} duration={800} />
              </div>
              <span className="text-2xl text-muted-foreground">
                / {statistics.submitted}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {markedPercentage.toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Total Submissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-bold">
                <AnimatedNumber value={statistics.total} duration={800} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    {statistics.submitted}
                  </span>{" "}
                  submitted
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    {statistics.inProgress}
                  </span>{" "}
                  in progress
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

