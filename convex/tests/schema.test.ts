import { describe, test, expect } from "vitest";
import schema from "../schema";

describe("Database Schema", () => {
  test("should have all required tables", () => {
    const tables = Object.keys(schema.tables);

    expect(tables).toContain("users");
    expect(tables).toContain("subscriptions");
    expect(tables).toContain("webhookEvents");
    expect(tables).toContain("projects");
    expect(tables).toContain("fields");
    expect(tables).toContain("projectOptions");
    expect(tables).toContain("submissions");
    expect(tables).toContain("responses");
    expect(tables).toContain("aiUsage");
    expect(tables).toContain("aiCredits");
    expect(tables).toContain("organizations");
  });

  test("should have correct number of tables", () => {
    const tables = Object.keys(schema.tables);
    expect(tables).toHaveLength(11);
  });

  test("projects table should exist", () => {
    const projectsTable = schema.tables.projects;
    expect(projectsTable).toBeDefined();
  });

  test("fields table should exist", () => {
    const fieldsTable = schema.tables.fields;
    expect(fieldsTable).toBeDefined();
  });

  test("submissions table should exist", () => {
    const submissionsTable = schema.tables.submissions;
    expect(submissionsTable).toBeDefined();
  });

  test("responses table should exist", () => {
    const responsesTable = schema.tables.responses;
    expect(responsesTable).toBeDefined();
  });

  test("aiUsage table should exist", () => {
    const aiUsageTable = schema.tables.aiUsage;
    expect(aiUsageTable).toBeDefined();
  });

  test("aiCredits table should exist", () => {
    const aiCreditsTable = schema.tables.aiCredits;
    expect(aiCreditsTable).toBeDefined();
  });

  test("organizations table should exist", () => {
    const organizationsTable = schema.tables.organizations;
    expect(organizationsTable).toBeDefined();
  });

  test("projectOptions table should exist", () => {
    const projectOptionsTable = schema.tables.projectOptions;
    expect(projectOptionsTable).toBeDefined();
  });

  test("users table should exist", () => {
    const usersTable = schema.tables.users;
    expect(usersTable).toBeDefined();
  });
});
