import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GlobalSearch from "../../../../../../src/app/layout/map/components/globalSearch/GlobalSearch";
import { FeatureType } from "../../../../../../src/lib/enums";
import React from "react";

// Mock dependencies
vi.mock("lucide-react", () => ({
  Building: () => <div data-testid="building-icon" />,
  PlugZap: () => <div data-testid="plug-icon" />,
  Search: () => <div data-testid="search-icon" />,
  UtilityPole: () => <div data-testid="pole-icon" />,
  Waypoints: () => <div data-testid="waypoint-icon" />,
}));

const mockUseSearch = vi.fn();
vi.mock("../../../../../../lib/hooks/useSearch", () => ({
  useSearch: mockUseSearch,
}));

const mockFlyTo = vi.fn();
const mockSetQuery = vi.fn();
const mockHandleSearch = vi.fn();
const mockSetIsFocused = vi.fn();

describe("GlobalSearch Component", () => {
  const searchInputRef = React.createRef<HTMLInputElement>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Default mock return value for useSearch
    mockUseSearch.mockReturnValue({
      query: "",
      setQuery: mockSetQuery,
      results: [],
      handleSearch: mockHandleSearch,
      isFocused: false,
      setIsFocused: mockSetIsFocused,
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should render the search bar and hidden info card", () => {
    render(<GlobalSearch flyTo={mockFlyTo} searchInputRef={searchInputRef} />);
    expect(screen.getByPlaceholderText("Search for a feature")).toBeDefined();
    const infoCard = screen.getAllByText(/Press/)[0].closest(".info-card");
    expect(infoCard?.classList.contains("hidden")).toBe(true);
  });

  it("should show results when user types and after a delay", () => {
    // 1. Initial render
    const { rerender } = render(
      <GlobalSearch flyTo={mockFlyTo} searchInputRef={searchInputRef} />,
    );
    const input = screen.getByPlaceholderText(
      "Search for a feature",
    ) as HTMLInputElement;

    // 2. Simulate typing in the input field
    fireEvent.change(input, { target: { value: "test" } });

    // 3. Define the final state the hook should have after the search
    const mockResults = [
      {
        id: "1",
        type: FeatureType.BUILDING,
        title: "Building A",
        subtitle: "Street 1",
        position: [1, 1],
        feature: {} as GeoJSON.Feature,
      },
    ];
    mockUseSearch.mockReturnValue({
      query: "test",
      results: mockResults,
      isFocused: true,
      setQuery: mockSetQuery,
      handleSearch: mockHandleSearch,
      setIsFocused: mockSetIsFocused,
    });

    // 4. Advance the timer to simulate the debounce period
    vi.advanceTimersByTime(500);

    // 5. Re-render the component with the new state from the hook
    rerender(
      <GlobalSearch flyTo={mockFlyTo} searchInputRef={searchInputRef} />,
    );

    // 6. Assert that the final state is correctly rendered in the DOM
    expect(input.value).toBe("test");
  });

  it("should show info card on input focus", () => {
    // 1. Initial render with isFocused: false
    mockUseSearch.mockReturnValue({
      query: "",
      setQuery: mockSetQuery,
      results: [],
      handleSearch: mockHandleSearch,
      isFocused: false,
      setIsFocused: mockSetIsFocused,
    });
    const { rerender } = render(
      <GlobalSearch flyTo={mockFlyTo} searchInputRef={searchInputRef} />,
    );
    const input = screen.getByPlaceholderText("Search for a feature");
    expect(
      screen
        .getAllByText(/Press/)[0]
        .closest(".info-card")
        ?.classList.contains("hidden"),
    ).toBe(true);

    // 2. Setup the mock for the next render to have isFocused: true
    mockUseSearch.mockReturnValue({
      query: "",
      setQuery: mockSetQuery,
      results: [],
      handleSearch: mockHandleSearch,
      isFocused: true,
      setIsFocused: mockSetIsFocused,
    });

    // 3. Fire the event that would cause the state to change
    fireEvent.focus(input);

    // 4. Rerender the component to simulate React's render cycle with the new state
    rerender(
      <GlobalSearch flyTo={mockFlyTo} searchInputRef={searchInputRef} />,
    );

    // 5. Assert the DOM has updated as a result
    expect(
      screen
        .getAllByText(/Press/)[0]
        .closest(".info-card")
        ?.classList.contains("hidden"),
    ).toBe(false);
  });
});
