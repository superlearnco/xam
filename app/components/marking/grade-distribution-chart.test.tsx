import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GradeDistributionChart } from "./grade-distribution-chart";

describe("GradeDistributionChart", () => {
  it("should show empty state when no grades", () => {
    render(<GradeDistributionChart gradeDistribution={{}} />);
    expect(screen.getByText("No graded submissions yet")).toBeDefined();
  });

  it("should show empty state when all grades are zero", () => {
    const gradeDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };
    render(<GradeDistributionChart gradeDistribution={gradeDistribution} />);
    expect(screen.getByText("No graded submissions yet")).toBeDefined();
  });

  it("should render chart with grade distribution", () => {
    const gradeDistribution = {
      A: 5,
      B: 3,
      C: 2,
      D: 1,
      F: 0,
    };
    render(<GradeDistributionChart gradeDistribution={gradeDistribution} />);
    // Chart should render (no empty state)
    expect(screen.queryByText("No graded submissions yet")).toBeNull();
  });

  it("should handle partial grade distribution", () => {
    const gradeDistribution = {
      A: 10,
      B: 5,
    };
    render(<GradeDistributionChart gradeDistribution={gradeDistribution} />);
    // Should render chart even with partial data
    expect(screen.queryByText("No graded submissions yet")).toBeNull();
  });

  it("should handle single grade", () => {
    const gradeDistribution = {
      A: 1,
    };
    render(<GradeDistributionChart gradeDistribution={gradeDistribution} />);
    expect(screen.queryByText("No graded submissions yet")).toBeNull();
  });
});

