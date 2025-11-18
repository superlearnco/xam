import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  route("test/:id", "routes/test/$id.tsx"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
    route("dashboard/credits", "routes/dashboard/credits.tsx"),
    route("dashboard/test/new", "routes/dashboard/test/new.tsx"),
    route("dashboard/test/mark/:submissionId", "routes/dashboard/test/mark/$submissionId.tsx"),
  ]),
] satisfies RouteConfig;
