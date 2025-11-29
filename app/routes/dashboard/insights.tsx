import type { Route } from "./+types/insights";

export function meta(_: Route.MetaArgs) {
  return [
    {
      title: "Insights | Xam Dashboard",
    },
  ];
}

export default function DashboardInsights() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">
          High-level analytics and insights about your tests will appear here.
        </p>
      </section>
    </main>
  );
}


