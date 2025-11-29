import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import DashboardInsights from "~/routes/dashboard/insights";

describe("DashboardInsights route", () => {
  it("renders Coming Soon content", () => {
    render(
      <MemoryRouter>
        <DashboardInsights />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Insights are coming soon")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/rich analytics experience/i)
    ).toBeInTheDocument();
  });
});


