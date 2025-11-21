import type { Route } from "./+types/sign-in";
import { SignIn } from "@clerk/react-router";
import { useSearchParams } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In | XAM" },
  ];
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn redirectUrl={redirectUrl} />
    </div>
  );
}
