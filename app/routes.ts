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

  // Dashboard Routes (Protected)
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),

  // Project Routes (Protected)
  route("projects/:projectId/editor", "routes/projects/editor.tsx"),
  route("projects/:projectId/options", "routes/projects/options.tsx"),
  route("projects/:projectId/marking", "routes/projects/marking.tsx"),
  route(
    "projects/:projectId/marking/:submissionId",
    "routes/projects/marking-submission.tsx"
  ),

  // Test Taking Routes (Public)
  route("take/:projectId", "routes/take/start.tsx"),
  route("take/:projectId/:submissionId", "routes/take/test.tsx"),
  route("take/:projectId/:submissionId/success", "routes/take/success.tsx"),
] satisfies RouteConfig;
