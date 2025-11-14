import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface GradeDistributionChartProps {
  gradeDistribution: Record<string, number>;
}

// Helper function to calculate grade from percentage
function getGrade(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

export function GradeDistributionChart({
  gradeDistribution,
}: GradeDistributionChartProps) {
  // Transform grade distribution into chart data
  const grades = ["A", "B", "C", "D", "F"];
  const colors = {
    A: "hsl(142, 71%, 45%)", // Success green
    B: "hsl(142, 71%, 55%)", // Lighter green
    C: "hsl(48, 96%, 53%)", // Warning yellow
    D: "hsl(25, 95%, 53%)", // Orange
    F: "hsl(0, 84%, 60%)", // Destructive red
  };

  const chartData = grades.map((grade) => ({
    grade,
    count: gradeDistribution[grade] || 0,
    color: colors[grade as keyof typeof colors],
  }));

  const hasData = Object.values(gradeDistribution).some((count) => count > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Grade Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No graded submissions yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="grade"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

