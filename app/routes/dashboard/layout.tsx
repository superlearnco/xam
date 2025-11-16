import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";
import type { Route } from "./+types/layout";
import { Outlet } from "react-router";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  return {};
}

export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNav />
      <Outlet />
    </div>
  );
}
