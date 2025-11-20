import type { Route } from "./+types/sign-up";
import { SignUp } from "@clerk/react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up | XAM" },
  ];
}

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp />
    </div>
  );
}
