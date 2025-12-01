import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";

describe("DashboardNav", () => {
  it("renders Home and Insights tabs in the header", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardNav />
      </MemoryRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getAllByText("Insights")[0]).toBeInTheDocument();
  });
});







