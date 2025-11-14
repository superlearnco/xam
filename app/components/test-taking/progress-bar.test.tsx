import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("should render with 0% progress", () => {
    render(<ProgressBar current={0} total={10} />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("should render with 50% progress", () => {
    render(<ProgressBar current={5} total={10} />);
    expect(screen.getByText("50%")).toBeDefined();
  });

  it("should render with 100% progress", () => {
    render(<ProgressBar current={10} total={10} />);
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("should calculate percentage correctly", () => {
    render(<ProgressBar current={3} total={4} />);
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("should handle single question", () => {
    render(<ProgressBar current={1} total={1} />);
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("should handle zero total gracefully", () => {
    render(<ProgressBar current={0} total={0} />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("should round percentage to nearest integer", () => {
    render(<ProgressBar current={1} total={3} />);
    expect(screen.getByText("33%")).toBeDefined();
  });

  it("should show correct percentage for large numbers", () => {
    render(<ProgressBar current={25} total={100} />);
    expect(screen.getByText("25%")).toBeDefined();
  });
});

