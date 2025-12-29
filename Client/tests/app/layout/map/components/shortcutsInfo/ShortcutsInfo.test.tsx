import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ShortcutsInfo from "../../../../../../src/app/layout/map/components/shortcutsInfo/ShortcutsInfo";
import { useAppSelector } from "../../../../../../src/lib/hooks";

// Mock dependencies
vi.mock("lucide-react", () => ({
  Keyboard: () => <div data-testid="keyboard-icon" />,
}));

vi.mock("../../../../../../src/lib/hooks", async () => ({
  useAppSelector: vi.fn(),
}));

const mockStore = configureStore([]);

const TestWrapper = ({
  store,
  children,
}: {
  store: ReturnType<typeof mockStore>;
  children: React.ReactNode;
}) => <Provider store={store}>{children}</Provider>;

describe("ShortcutsInfo Component", () => {
  let store: ReturnType<typeof mockStore>;

  const getPanel = () =>
    screen
      .getByText("Keyboard Shortcuts")
      .closest(".shortcuts-info") as HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("should be hidden by default", () => {
    (useAppSelector as any as Mock).mockReturnValue(null); // No user
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );

    expect(getPanel().classList.contains("shortcuts-hidden")).toBe(true);
  });

  it("should become visible on hover and hidden on mouse leave", () => {
    (useAppSelector as any as Mock).mockReturnValue(null);
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );
    const iconButton = screen.getByTestId("keyboard-icon");

    fireEvent.mouseEnter(iconButton);
    expect(getPanel().classList.contains("shortcuts-hidden")).toBe(false);

    fireEvent.mouseLeave(iconButton);
    expect(getPanel().classList.contains("shortcuts-hidden")).toBe(true);
  });

  it("should toggle visibility on click", () => {
    (useAppSelector as any as Mock).mockReturnValue(null);
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );
    const iconButton = screen.getByTestId("keyboard-icon");

    fireEvent.click(iconButton);
    expect(getPanel().classList.contains("shortcuts-hidden")).toBe(false);

    fireEvent.click(iconButton);
    expect(getPanel().classList.contains("shortcuts-hidden")).toBe(true);
  });

  it("should remain visible on mouse leave if toggled on", () => {
    (useAppSelector as any as Mock).mockReturnValue(null);
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );
    const iconButton = screen.getByTestId("keyboard-icon");

    fireEvent.click(iconButton);
    expect(getPanel().classList.contains("hidden")).toBe(false);

    fireEvent.mouseEnter(iconButton);
    fireEvent.mouseLeave(iconButton);
    expect(getPanel().classList.contains("hidden")).toBe(false);
  });

  it("should not show admin shortcut for non-admin user", () => {
    (useAppSelector as any as Mock).mockReturnValue({ userRole: "user" });
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );

    const element = screen.queryAllByTestId("show-admin-settings");
    expect(element).toHaveLength(0);
  });

  it("should show admin shortcut for admin user", () => {
    (useAppSelector as any as Mock).mockReturnValue({ userRole: "admin" });
    store = mockStore({});
    render(
      <TestWrapper store={store}>
        <ShortcutsInfo />
      </TestWrapper>,
    );

    expect(screen.getByTestId("show-admin-settings")).toBeDefined();
  });
});
