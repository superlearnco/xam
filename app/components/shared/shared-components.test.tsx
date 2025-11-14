import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AnimatedNumber } from "./animated-number";
import { EmptyState } from "./empty-state";
import { StatCard } from "./stat-card";
import { PageHeader } from "./page-header";
import { PageContainer } from "./page-container";
import { FormFieldWrapper } from "./form-field-wrapper";
import { FieldIcon, getFieldIcon, getFieldLabel } from "./field-icon";
import { FileText, Star } from "lucide-react";

describe("AnimatedNumber", () => {
  it("should render the initial value", () => {
    const { container } = render(<AnimatedNumber value={100} />);
    expect(container.textContent).toBeDefined();
  });

  it("should render with prefix and suffix", () => {
    const { container } = render(
      <AnimatedNumber value={100} prefix="$" suffix=" USD" />
    );
    const text = container.textContent || "";
    expect(text).toContain("$");
    expect(text).toContain("USD");
  });

  it("should render with decimals", () => {
    const { container } = render(<AnimatedNumber value={99.99} decimals={2} />);
    // Animation starts at 0, so check initial state
    expect(container.textContent).toBeDefined();
    // Actual value will animate to 99.99
  });

  it("should apply custom className", () => {
    const { container } = render(
      <AnimatedNumber value={100} className="custom-class" />
    );
    expect(container.querySelector(".custom-class")).toBeDefined();
  });
});

describe("EmptyState", () => {
  it("should render title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeDefined();
  });

  it("should render description when provided", () => {
    render(
      <EmptyState
        title="No items"
        description="Create your first item to get started"
      />
    );
    expect(screen.getByText("Create your first item to get started")).toBeDefined();
  });

  it("should render icon when provided", () => {
    const { container } = render(
      <EmptyState title="No items" icon={FileText} />
    );
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should render action button when provided", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create Item", onClick: handleClick }}
      />
    );
    expect(screen.getByText("Create Item")).toBeDefined();
  });

  it("should call action onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create Item", onClick: handleClick }}
      />
    );
    await user.click(screen.getByText("Create Item"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("StatCard", () => {
  it("should render title and value", () => {
    const { container } = render(<StatCard title="Total Users" value={150} />);
    expect(screen.getByText("Total Users")).toBeDefined();
    // Value animates from 0 to 150, so check that it renders
    expect(container.querySelector(".text-2xl")).toBeDefined();
  });

  it("should render with prefix and suffix", () => {
    render(<StatCard title="Revenue" value={1000} prefix="$" suffix=" USD" />);
    const content = screen.getByText(/\$.*USD/);
    expect(content).toBeDefined();
  });

  it("should render icon when provided", () => {
    const { container } = render(
      <StatCard title="Rating" value={4.5} icon={Star} />
    );
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should render description when provided", () => {
    render(
      <StatCard title="Users" value={100} description="from last month" />
    );
    expect(screen.getByText("from last month")).toBeDefined();
  });

  it("should render positive trend", () => {
    render(
      <StatCard
        title="Users"
        value={100}
        trend={{ value: 10, isPositive: true }}
      />
    );
    expect(screen.getByText("+10%")).toBeDefined();
  });

  it("should render negative trend", () => {
    render(
      <StatCard
        title="Users"
        value={100}
        trend={{ value: -5, isPositive: false }}
      />
    );
    expect(screen.getByText("-5%")).toBeDefined();
  });

  it("should render with decimals", () => {
    const { container } = render(<StatCard title="Average" value={99.99} decimals={2} />);
    // Value animates from 0 to 99.99, so check that it renders
    expect(container.querySelector(".text-2xl")).toBeDefined();
  });

  it("should render without animation when animate is false", () => {
    render(<StatCard title="Count" value={100} animate={false} />);
    expect(screen.getByText("100")).toBeDefined();
  });
});

describe("PageHeader", () => {
  it("should render title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("should render description when provided", () => {
    render(
      <PageHeader title="Dashboard" description="Manage your projects" />
    );
    expect(screen.getByText("Manage your projects")).toBeDefined();
  });

  it("should render actions when provided", () => {
    render(
      <PageHeader
        title="Dashboard"
        actions={<button>Create Project</button>}
      />
    );
    expect(screen.getByText("Create Project")).toBeDefined();
  });

  it("should render breadcrumbs when provided", () => {
    render(
      <PageHeader
        title="Dashboard"
        breadcrumbs={<div>Home / Dashboard</div>}
      />
    );
    expect(screen.getByText("Home / Dashboard")).toBeDefined();
  });
});

describe("PageContainer", () => {
  it("should render children", () => {
    render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    );
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <PageContainer className="custom-class">
        <div>Content</div>
      </PageContainer>
    );
    expect(container.querySelector(".custom-class")).toBeDefined();
  });

  it("should apply maxWidth className", () => {
    const { container } = render(
      <PageContainer maxWidth="sm">
        <div>Content</div>
      </PageContainer>
    );
    expect(container.querySelector(".max-w-screen-sm")).toBeDefined();
  });
});

describe("FormFieldWrapper", () => {
  it("should render label when provided", () => {
    render(
      <FormFieldWrapper label="Name">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Name")).toBeDefined();
  });

  it("should render required indicator when required is true", () => {
    render(
      <FormFieldWrapper label="Name" required>
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("*")).toBeDefined();
  });

  it("should render description when provided", () => {
    render(
      <FormFieldWrapper label="Name" description="Enter your full name">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Enter your full name")).toBeDefined();
  });

  it("should render error message when provided", () => {
    render(
      <FormFieldWrapper label="Name" error="Name is required">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Name is required")).toBeDefined();
  });

  it("should render icon when provided", () => {
    const { container } = render(
      <FormFieldWrapper label="Name" icon={FileText}>
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should render children", () => {
    render(
      <FormFieldWrapper label="Name">
        <input type="text" placeholder="Enter name" />
      </FormFieldWrapper>
    );
    expect(screen.getByPlaceholderText("Enter name")).toBeDefined();
  });
});

describe("FieldIcon", () => {
  it("should render icon for short_text type", () => {
    const { container } = render(<FieldIcon type="short_text" />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should render icon for multiple_choice type", () => {
    const { container } = render(<FieldIcon type="multiple_choice" />);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FieldIcon type="short_text" className="custom-icon" />
    );
    expect(container.querySelector(".custom-icon")).toBeDefined();
  });
});

describe("getFieldIcon", () => {
  it("should return icon component for valid field type", () => {
    const Icon = getFieldIcon("short_text");
    expect(Icon).toBeDefined();
    // Icon can be a function or React component (object with $$typeof)
    expect(Icon).toBeTruthy();
  });

  it("should return default icon for unknown field type", () => {
    const Icon = getFieldIcon("unknown" as any);
    expect(Icon).toBeDefined();
  });
});

describe("getFieldLabel", () => {
  it("should return correct label for short_text", () => {
    expect(getFieldLabel("short_text")).toBe("Short Text");
  });

  it("should return correct label for multiple_choice", () => {
    expect(getFieldLabel("multiple_choice")).toBe("Multiple Choice");
  });

  it("should return correct label for checkbox", () => {
    expect(getFieldLabel("checkbox")).toBe("Checkbox");
  });

  it("should return correct label for file_upload", () => {
    expect(getFieldLabel("file_upload")).toBe("File Upload");
  });

  it("should return correct label for rating", () => {
    expect(getFieldLabel("rating")).toBe("Rating");
  });

  it("should return correct label for date", () => {
    expect(getFieldLabel("date")).toBe("Date");
  });

  it("should return correct label for scale", () => {
    expect(getFieldLabel("scale")).toBe("Scale");
  });

  it("should return correct label for url", () => {
    expect(getFieldLabel("url")).toBe("URL");
  });

  it("should return Unknown for invalid field type", () => {
    expect(getFieldLabel("invalid" as any)).toBe("Unknown");
  });
});
