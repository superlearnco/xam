import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";

test("convex schema is valid", async () => {
  const t = convexTest(schema);
  
  // Test that we can query the schema
  const tables = Object.keys(schema.tables);
  
  // Verify all expected tables exist
  expect(tables).toContain("projects");
  expect(tables).toContain("fields");
  expect(tables).toContain("submissions");
  expect(tables).toContain("responses");
  expect(tables).toContain("project_options");
  expect(tables).toContain("ai_usage");
  expect(tables).toContain("ai_credits");
  expect(tables).toContain("organizations");
});

test("convex test environment works", async () => {
  const t = convexTest(schema);
  
  // This test verifies the test environment is set up correctly
  // Additional Convex function tests would require mocking Clerk authentication
  // and are better tested in integration tests with actual auth setup
  expect(t).toBeDefined();
});

