import type { Route } from "./+types/sign-in";
import { SignIn } from "@clerk/react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In | XAM" },
  ];
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
}
