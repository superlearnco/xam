import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./project-card";

// Mock React Router
vi.mock("react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

// Mock the useMutation hook from Convex
vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  FileCheck: () => <span>FileCheck</span>,
  PenTool: () => <span>PenTool</span>,
  ClipboardList: () => <span>ClipboardList</span>,
  MoreVertical: () => <span>MoreVertical</span>,
}));

describe("ProjectCard", () => {
  const mockProject = {
    _id: "test-id" as any,
    _creationTime: Date.now(),
    name: "Test Project",
    description: "Test Description",
    type: "test" as const,
    status: "draft" as const,
    userId: "user-1",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };

  it("should render project name", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Test Project")).toBeDefined();
  });

  it("should render project description", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Test Description")).toBeDefined();
  });

  it("should show type badge for test", () => {
    render(<ProjectCard project={{ ...mockProject, type: "test" }} />);
    expect(screen.getByText("Test")).toBeDefined();
  });

  it("should show type badge for essay", () => {
    render(<ProjectCard project={{ ...mockProject, type: "essay" }} />);
    expect(screen.getByText("Essay")).toBeDefined();
  });

  it("should show type badge for survey", () => {
    render(<ProjectCard project={{ ...mockProject, type: "survey" }} />);
    expect(screen.getByText("Survey")).toBeDefined();
  });

  it("should show draft status", () => {
    render(<ProjectCard project={{ ...mockProject, status: "draft" }} />);
    expect(screen.getByText("Draft")).toBeDefined();
  });

  it("should show published status", () => {
    render(<ProjectCard project={{ ...mockProject, status: "published" }} />);
    expect(screen.getByText("Published")).toBeDefined();
  });

  it("should handle project without description", () => {
    const projectWithoutDesc = { ...mockProject, description: undefined };
    render(<ProjectCard project={projectWithoutDesc} />);
    expect(screen.getByText("Test Project")).toBeDefined();
  });
});

