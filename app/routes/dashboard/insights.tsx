import type { Route } from "./+types/insights";

export function meta(_: Route.MetaArgs) {
  return [
    {
      title: "Insights | XAM",
    },
  ];
}

export default function DashboardInsights() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="flex flex-1 flex-col items-center justify-center text-center space-y-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Insights are coming soon
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          We&apos;re building a rich analytics experience so you can understand
          how your tests perform over time. Check back soon for detailed
          insights and trends.
        </p>
      </section>
    </main>
  );
}
