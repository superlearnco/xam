import { describe, it, expect } from "vitest";
import {
  canAccessProject,
  isProjectOwner,
  isProjectPublic,
  canViewSubmissions,
  canMarkSubmissions,
  hasOrganization,
  isOrganizationMember,
  isOrganizationCreator,
  getRedirectUrl,
} from "./auth-helpers";

// Mock Id type for testing
type Id<T extends string> = string & { __tableName: T };

describe("Auth Helpers", () => {
  const userId1 = "user1" as Id<"users">;
  const userId2 = "user2" as Id<"users">;
  const orgId1 = "org1" as Id<"organizations">;
  const orgId2 = "org2" as Id<"organizations">;

  describe("canAccessProject", () => {
    it("should allow access to project owner", () => {
      const project = {
        userId: userId1,
      };
      expect(canAccessProject(project, userId1)).toBe(true);
    });

    it("should deny access to non-owner without organization", () => {
      const project = {
        userId: userId1,
      };
      expect(canAccessProject(project, userId2)).toBe(false);
    });

    it("should allow access to organization member", () => {
      const project = {
        userId: userId1,
        organizationId: orgId1,
      };
      expect(canAccessProject(project, userId2, orgId1)).toBe(true);
    });

    it("should deny access to member of different organization", () => {
      const project = {
        userId: userId1,
        organizationId: orgId1,
      };
      expect(canAccessProject(project, userId2, orgId2)).toBe(false);
    });
  });

  describe("isProjectOwner", () => {
    it("should return true for project owner", () => {
      const project = {
        userId: userId1,
      };
      expect(isProjectOwner(project, userId1)).toBe(true);
    });

    it("should return false for non-owner", () => {
      const project = {
        userId: userId1,
      };
      expect(isProjectOwner(project, userId2)).toBe(false);
    });
  });

  describe("isProjectPublic", () => {
    it("should return true for published projects", () => {
      const project = { status: "published" as const };
      expect(isProjectPublic(project)).toBe(true);
    });

    it("should return false for draft projects", () => {
      const project = { status: "draft" as const };
      expect(isProjectPublic(project)).toBe(false);
    });

    it("should return false for archived projects", () => {
      const project = { status: "archived" as const };
      expect(isProjectPublic(project)).toBe(false);
    });
  });

  describe("canViewSubmissions", () => {
    it("should allow owner to view submissions", () => {
      const project = {
        userId: userId1,
      };
      expect(canViewSubmissions(project, userId1)).toBe(true);
    });

    it("should allow organization member to view submissions", () => {
      const project = {
        userId: userId1,
        organizationId: orgId1,
      };
      expect(canViewSubmissions(project, userId2, orgId1)).toBe(true);
    });

    it("should deny non-member to view submissions", () => {
      const project = {
        userId: userId1,
      };
      expect(canViewSubmissions(project, userId2)).toBe(false);
    });
  });

  describe("canMarkSubmissions", () => {
    it("should allow owner to mark submissions", () => {
      const project = {
        userId: userId1,
      };
      expect(canMarkSubmissions(project, userId1)).toBe(true);
    });

    it("should allow organization member to mark submissions", () => {
      const project = {
        userId: userId1,
        organizationId: orgId1,
      };
      expect(canMarkSubmissions(project, userId2, orgId1)).toBe(true);
    });

    it("should deny non-member to mark submissions", () => {
      const project = {
        userId: userId1,
      };
      expect(canMarkSubmissions(project, userId2)).toBe(false);
    });
  });

  describe("hasOrganization", () => {
    it("should return true if organization ID is provided", () => {
      expect(hasOrganization(orgId1)).toBe(true);
    });

    it("should return false if organization ID is undefined", () => {
      expect(hasOrganization(undefined)).toBe(false);
    });
  });

  describe("isOrganizationMember", () => {
    it("should return true if user is in members array", () => {
      const organization = {
        members: [userId1, userId2],
      };
      expect(isOrganizationMember(organization, userId1)).toBe(true);
      expect(isOrganizationMember(organization, userId2)).toBe(true);
    });

    it("should return false if user is not in members array", () => {
      const organization = {
        members: [userId1],
      };
      expect(isOrganizationMember(organization, userId2)).toBe(false);
    });

    it("should return false for empty members array", () => {
      const organization = {
        members: [],
      };
      expect(isOrganizationMember(organization, userId1)).toBe(false);
    });
  });

  describe("isOrganizationCreator", () => {
    it("should return true if user is the creator", () => {
      const organization = {
        createdBy: userId1,
      };
      expect(isOrganizationCreator(organization, userId1)).toBe(true);
    });

    it("should return false if user is not the creator", () => {
      const organization = {
        createdBy: userId1,
      };
      expect(isOrganizationCreator(organization, userId2)).toBe(false);
    });
  });

  describe("getRedirectUrl", () => {
    it("should return redirect_url from search params", () => {
      const request = new Request(
        "https://example.com/sign-in?redirect_url=/dashboard"
      );
      expect(getRedirectUrl(request)).toBe("/dashboard");
    });

    it("should return default path when no redirect_url", () => {
      const request = new Request("https://example.com/sign-in");
      expect(getRedirectUrl(request)).toBe("/dashboard");
    });

    it("should return custom default path", () => {
      const request = new Request("https://example.com/sign-in");
      expect(getRedirectUrl(request, "/home")).toBe("/home");
    });

    it("should decode URL-encoded redirect_url", () => {
      const request = new Request(
        "https://example.com/sign-in?redirect_url=%2Fprojects%2F123%2Feditor"
      );
      expect(getRedirectUrl(request)).toBe("/projects/123/editor");
    });
  });
});
