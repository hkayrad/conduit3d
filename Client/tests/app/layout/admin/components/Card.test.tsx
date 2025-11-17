import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Card from "../../../../../src/app/layout/admin/components/Card";

describe("Card Component", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    title: "Users",
    icon: <span data-testid="icon">👤</span>,
    number: 42,
    numberColor: "blue",
    info: "Active users",
  };

  it("should render the card with title, icon, number, and info", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText("Users")).toBeDefined();
    expect(screen.getByTestId("icon")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("Active users")).toBeDefined();
  });

  it("should apply the correct number color class", () => {
    render(<Card {...defaultProps} />);
    const numberElement = screen.getByText("42");
    expect(numberElement.className).toContain("blue-fg");
  });

  it("should not render info paragraph if info prop is missing", () => {
    render(<Card {...defaultProps} info={undefined} />);
    expect(screen.queryByText("Active users")).toBeNull();
  });

  it("should render the icon node", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("should render with different numberColor", () => {
    render(<Card {...defaultProps} numberColor="red" />);
    const numberElement = screen.getByText("42");
    expect(numberElement.className).toContain("red-fg");
  });

  it("should render with only required props", () => {
    render(<Card title="Posts" icon={<span data-testid="icon">📝</span>} number={100} />);
    expect(screen.getByText("Posts")).toBeDefined();
    expect(screen.getByText("100")).toBeDefined();
    expect(screen.getByTestId("icon")).toBeDefined();
  });
});
