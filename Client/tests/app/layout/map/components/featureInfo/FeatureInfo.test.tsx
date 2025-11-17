import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import FeatureInfo from "../../../../../../src/app/layout/map/components/featureInfo/FeatureInfo";
import { C3D_MapViewType } from "../../../../../../src/lib/enums";
import { useAppSelector } from "../../../../../../src/lib/hooks";

// Mock dependencies
vi.mock("lucide-react", () => ({
  LucideArrowRight: () => <div data-testid="fly-to-icon" />,
  LucideX: () => <div data-testid="close-icon" />,
}));

vi.mock("../../../../../../src/app/shared/infoContent/InfoContent", () => ({
  __esModule: true,
  default: (properties: object, coordinate: number[]) => (
    <div data-testid="info-content">
      {JSON.stringify({ properties, coordinate })}
    </div>
  ),
}));

vi.mock("../../../../../../src/lib/hooks", async () => ({
  useAppSelector: vi.fn(),
}));

vi.mock("../../../../../../src/lib/utils", async () => ({
  capitalizeFirstLetter: (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "",
}));

const mockStore = configureStore([]);

const TestWrapper = ({
  store,
  children,
}: {
  store: ReturnType<typeof mockStore>;
  children: React.ReactNode;
}) => <Provider store={store}>{children}</Provider>;

describe("FeatureInfo Component", () => {
  let store: ReturnType<typeof mockStore>;
  const mockOnClose = vi.fn();
  const mockOnFocus = vi.fn();
  const mockOnFlyTo = vi.fn();

  const mockInfo = {
    object: { properties: { dataType: "building" } },
    coordinate: [10, 20],
    x: 100,
    y: 150,
  } as any;

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("should render feature info, header, and content correctly", () => {
    (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
    store = mockStore({});

    render(
      <TestWrapper store={store}>
        <FeatureInfo
          info={mockInfo}
          zIndex={10}
          onClose={mockOnClose}
          onFocus={mockOnFocus}
          onFlyTo={mockOnFlyTo}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Building")).toBeDefined();

    const popup = screen
      .getByText("Building")
      .closest(".feature-info-popup") as HTMLElement;
    expect(popup).not.toBeNull();
    expect(popup.style.left).toBe("100px");
    expect(popup.style.top).toBe("150px");
    expect(popup.style.zIndex).toBe("10");

    expect(screen.getByTestId("info-content")).toBeDefined();
  });

  it("should show fly-to button only in Cartesian view", () => {
    (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
    store = mockStore({});

    const { rerender } = render(
      <TestWrapper store={store}>
        <FeatureInfo
          info={mockInfo}
          zIndex={10}
          onClose={mockOnClose}
          onFocus={mockOnFocus}
          onFlyTo={mockOnFlyTo}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId("fly-to-icon")).toBeDefined();

    (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.FirstPerson);
    rerender(
      <TestWrapper store={store}>
        <FeatureInfo
          info={mockInfo}
          zIndex={10}
          onClose={mockOnClose}
          onFocus={mockOnFocus}
          onFlyTo={mockOnFlyTo}
        />
      </TestWrapper>,
    );

    expect(screen.queryByTestId("fly-to-icon")).toBeNull();
  });

  it("should call callback functions on button clicks and focus", () => {
    (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
    store = mockStore({});

    render(
      <TestWrapper store={store}>
        <FeatureInfo
          info={mockInfo}
          zIndex={10}
          onClose={mockOnClose}
          onFocus={mockOnFocus}
          onFlyTo={mockOnFlyTo}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByTestId("close-icon"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("fly-to-icon"));
    expect(mockOnFlyTo).toHaveBeenCalledTimes(1);

    const header = screen.getByText("Building");
    fireEvent.mouseDown(header);
    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it("should be draggable", () => {
    (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
    store = mockStore({});

    render(
      <TestWrapper store={store}>
        <FeatureInfo
          info={mockInfo}
          zIndex={10}
          onClose={mockOnClose}
          onFocus={mockOnFocus}
          onFlyTo={mockOnFlyTo}
        />
      </TestWrapper>,
    );

    const header = screen.getByText("Building");
    const popup = header.closest(".feature-info-popup") as HTMLElement;

    expect(popup.style.left).toBe("100px");
    expect(popup.style.top).toBe("150px");

    fireEvent.mouseDown(header, { clientX: 110, clientY: 160 });

    fireEvent.mouseMove(document, { clientX: 200, clientY: 250 });

    expect(popup.style.left).toBe("190px");
    expect(popup.style.top).toBe("240px");

    fireEvent.mouseUp(document);

    fireEvent.mouseMove(document, { clientX: 300, clientY: 350 });
    expect(popup.style.left).toBe("190px");
    expect(popup.style.top).toBe("240px");
  });
});
