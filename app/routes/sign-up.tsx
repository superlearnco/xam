import type { Route } from "./+types/sign-up";
import { SignUp } from "@clerk/react-router";
import { useSearchParams } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up | XAM" },
  ];
}

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp redirectUrl={redirectUrl} />
    </div>
  );
}
