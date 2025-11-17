import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest"

// Mock Card to isolate Stats logic and allow prop inspection
vi.mock("../../../../../src/app/layout/admin/components/Card", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid={`card-${props.title.replace(/\s/g, "-").toLowerCase()}`}>
      <span>{props.title}</span>
      <span data-testid="icon">{props.icon ? "icon" : ""}</span>
      <span>{props.number}</span>
      {props.numberColor && <span>{props.numberColor}</span>}
      {props.info && <span>{props.info}</span>}
    </div>
  ),
}));

import Stats from "../../../../../src/app/layout/admin/components/Stats";

describe("Stats Component", () => {
  afterEach(() => {
    cleanup();
  });

  const userCounts = {
    totalUsers: 100,
    activeUsers: 80,
    inactiveUsers: 20,
  };

  it("should render three Card components", () => {
    render(<Stats userCounts={userCounts} />);
    expect(screen.getByTestId("card-total-users")).toBeDefined();
    expect(screen.getByTestId("card-active-users")).toBeDefined();
    expect(screen.getByTestId("card-inactive-users")).toBeDefined();
  });

  it("should pass correct props to Total Users Card", () => {
    render(<Stats userCounts={userCounts} />);
    const card = screen.getByTestId("card-total-users");
    expect(card).toHaveTextContent("Total Users");
    expect(card).toHaveTextContent("100");
  });

  it("should pass correct props to Active Users Card", () => {
    render(<Stats userCounts={userCounts} />);
    const card = screen.getByTestId("card-active-users");
    expect(card).toHaveTextContent("Active Users");
    expect(card).toHaveTextContent("80");
    expect(card).toHaveTextContent("success");
    expect(card).toHaveTextContent("80% of users");
  });

  it("should pass correct props to Inactive Users Card", () => {
    render(<Stats userCounts={userCounts} />);
    const card = screen.getByTestId("card-inactive-users");
    expect(card).toHaveTextContent("Inactive Users");
    expect(card).toHaveTextContent("20");
    expect(card).toHaveTextContent("error");
    expect(card).toHaveTextContent("20% of users");
  });

  it("should calculate percentages correctly", () => {
    render(<Stats userCounts={userCounts} />);
    expect(screen.getByTestId("card-active-users")).toHaveTextContent(
      "80% of users",
    );
    expect(screen.getByTestId("card-inactive-users")).toHaveTextContent(
      "20% of users",
    );
  });
});
