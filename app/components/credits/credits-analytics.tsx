"use client";

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
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function CreditsAnalytics({ dailyUsage, modelUsage }: CreditsAnalyticsProps) {
  const modelChartConfig = modelUsage.reduce((acc, item, index) => {
    acc[item.model] = {
      label: item.model,
      color: COLORS[index % COLORS.length],
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

