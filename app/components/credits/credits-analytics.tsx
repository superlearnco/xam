"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "~/components/ui/chart";

interface CreditsAnalyticsProps {
  dailyUsage: { date: string; amount: number }[];
  modelUsage: { model: string; amount: number }[];
}

const chartConfig = {
  amount: {
    label: "Credits",
    // Indigo-like primary
    color: "#4f46e5",
  },
} satisfies ChartConfig;

// Helper function to get computed CSS variable value
const getComputedColor = (varName: string): string => {
  if (typeof window === "undefined") return varName;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || varName
  );
};

const CHART_COLOR_VARS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

export function CreditsAnalytics({ dailyUsage, modelUsage }: CreditsAnalyticsProps) {
  // Resolve CSS variables to actual color values
  const resolvedColors = useMemo(() => {
    return CHART_COLOR_VARS.map(varName => getComputedColor(varName));
  }, []);

  const modelChartConfig = modelUsage.reduce((acc, item, index) => {
    const color = resolvedColors[index % resolvedColors.length];
    acc[item.model] = {
      label: item.model,
      color: color,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>Daily credit consumption over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={dailyUsage}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Model</CardTitle>
          <CardDescription>Distribution of credits across different AI models</CardDescription>
        </CardHeader>
        <CardContent>
          {modelUsage.length > 0 ? (
            <ChartContainer config={modelChartConfig} className="h-[300px] w-full mx-auto">
              <PieChart>
                <Pie
                  data={modelUsage}
                  dataKey="amount"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                >
                   {modelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={resolvedColors[index % resolvedColors.length]} />
                  ))}
                </Pie>
                 <ChartTooltip content={<ChartTooltipContent nameKey="model" hideLabel />} />
                 <ChartLegend content={<ChartLegendContent nameKey="model" />} />
              </PieChart>
            </ChartContainer>
          ) : (
             <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No model usage data available
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

