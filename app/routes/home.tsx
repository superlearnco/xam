import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    {
      name: "description",
      content: "Log in to access your dashboard",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button asChild size="lg">
        <Link to="/dashboard">Log In</Link>
      </Button>
    </div>
  );
}
