import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";
import type { Route } from "./+types/layout";
import { Outlet, useLocation } from "react-router";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { cn } from "~/lib/utils";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  return {};
}

export default function DashboardLayout() {
  const location = useLocation();
  const isTestEditor = location.pathname.includes("/test/new");

  return (
    <div className={cn("flex flex-col", isTestEditor ? "h-screen overflow-hidden" : "min-h-screen")}>
      {!isTestEditor && <DashboardNav />}
      <Outlet />
    </div>
  );
}
