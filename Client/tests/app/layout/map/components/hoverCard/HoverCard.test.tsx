import { describe, it, expect, vi, afterEach, beforeEach, Mock } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import HoverCard from "../../../../../../src/app/layout/map/components/hoverCard/HoverCard";
import { FeatureType } from "../../../../../../src/lib/enums";

// Mock hooks and components, following the template's async pattern
vi.mock("../../../../../../src/lib/hooks", async () => ({
    useAppSelector: vi.fn(),
}));

vi.mock("../../../../../../src/app/shared/infoContent/InfoContent", () => ({
    __esModule: true,
    default: (properties: object) => <div data-testid="info-content">{JSON.stringify(properties)}</div>,
}));

const mockStore = configureStore([]);

const TestWrapper = ({ store, children }: { store: ReturnType<typeof mockStore>, children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe("HoverCard Component", () => {
    let store: ReturnType<typeof mockStore>;
    let useAppSelector: Mock;
    const mockMousePos = { x: 100, y: 100 };

    beforeEach(async () => {
        vi.resetModules(); // Reset modules to ensure fresh mocks

        // Dynamically import hooks to get the mocked version for this test
        const hooks = await import("../../../../../../src/lib/hooks");
        useAppSelector = hooks.useAppSelector as any as Mock;

        vi.clearAllMocks();
        vi.spyOn(performance, 'now').mockReturnValue(0);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("should be hidden when hoveredFeature is null", () => {
        useAppSelector.mockReturnValue(true); // isHoverInfoVisible
        store = mockStore({ map: { isHoverInfoVisible: true } });

        const { container } = render(
            <TestWrapper store={store}>
                <HoverCard hoveredFeature={null} mousePos={mockMousePos} />
            </TestWrapper>
        );

        const hoverCard = container.querySelector("#hover-card");
        expect(hoverCard?.classList.contains("hidden")).toBe(true);
    });

    it("should be hidden when isHoverInfoVisible is false", () => {
        useAppSelector.mockReturnValue(false);
        store = mockStore({ map: { isHoverInfoVisible: false } });

        const mockFeature = {
            type: "Feature",
            properties: { dataType: FeatureType.BUILDING, adi: "Test Building" },
            geometry: { type: "Point", coordinates: [0, 0] },
        } as GeoJSON.Feature;

        const { container } = render(
            <TestWrapper store={store}>
                <HoverCard hoveredFeature={mockFeature} mousePos={mockMousePos} />
            </TestWrapper>
        );

        const hoverCard = container.querySelector("#hover-card");
        expect(hoverCard?.classList.contains("hidden")).toBe(true);
    });

    it("should be visible and render content when feature is hovered and info is visible", () => {
        useAppSelector.mockReturnValue(true);
        store = mockStore({ map: { isHoverInfoVisible: true } });

        const mockFeature = {
            type: "Feature",
            properties: { dataType: FeatureType.BUILDING, adi: "Test Building" },
            geometry: { type: "Point", coordinates: [0, 0] },
        } as GeoJSON.Feature;

        const { container, getByText, getByTestId } = render(
            <TestWrapper store={store}>
                <HoverCard hoveredFeature={mockFeature} mousePos={mockMousePos} />
            </TestWrapper>
        );

        const hoverCard = container.querySelector("#hover-card");
        expect(hoverCard?.classList.contains("visible")).toBe(true);

        expect(getByText(FeatureType.BUILDING)).toBeDefined();
        const infoContent = getByTestId("info-content");
        expect(infoContent.textContent).toBe(JSON.stringify(mockFeature.properties));
    });

    it("should position the card to the bottom-right of the cursor by default", () => {
        useAppSelector.mockReturnValue(true);
        store = mockStore({ map: { isHoverInfoVisible: true } });
        const mockFeature = { type: "Feature", properties: { dataType: FeatureType.BUILDING }, geometry: { type: "Point", coordinates: [0, 0] } } as GeoJSON.Feature;

        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800);
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 150, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { cb(performance.now()); return 0; });

        const { container } = render(
            <TestWrapper store={store}>
                <HoverCard hoveredFeature={mockFeature} mousePos={{ x: 100, y: 100 }} />
            </TestWrapper>
        );

        const card = container.querySelector<HTMLDivElement>("#hover-card");
        expect(card?.style.left).toBe("110px");
        expect(card?.style.top).toBe("110px");
    });

    it("should adjust position to stay within viewport", () => {
        useAppSelector.mockReturnValue(true);
        store = mockStore({ map: { isHoverInfoVisible: true } });
        const mockFeature = { type: "Feature", properties: { dataType: FeatureType.BUILDING }, geometry: { type: "Point", coordinates: [0, 0] } } as GeoJSON.Feature;

        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800);
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 150, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { cb(performance.now()); return 0; });

        const { container } = render(
            <TestWrapper store={store}>
                <HoverCard hoveredFeature={mockFeature} mousePos={{ x: 750, y: 550 }} />
            </TestWrapper>
        );

        const card = container.querySelector<HTMLDivElement>("#hover-card");
        expect(card?.style.left).toBe("540px"); // 750 - 200 - 10
        expect(card?.style.top).toBe("390px"); // 550 - 150 - 10
    });
});
