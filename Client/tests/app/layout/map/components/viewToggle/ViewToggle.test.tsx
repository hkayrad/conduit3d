import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ViewToggle from "../../../../../../src/app/layout/map/components/viewToggle/ViewToggle";
import { C3D_MapViewType } from "../../../../../../src/lib/enums";
import { useAppDispatch, useAppSelector } from "../../../../../../src/lib/hooks";

// Mock dependencies
vi.mock("lucide-react", () => ({
    Map: () => <div data-testid="map-icon" />,
    PersonStanding: () => <div data-testid="person-icon" />,
}));

vi.mock("../../../../../../src/lib/hooks", async () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

const mockStore = configureStore([]);

const TestWrapper = ({ store, children }: { store: ReturnType<typeof mockStore>, children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
);

describe("ViewToggle Component", () => {
    let store: ReturnType<typeof mockStore>;
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any as Mock).mockReturnValue(mockDispatch);
    });

    afterEach(cleanup);

    it("should render both view toggle buttons", () => {
        (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
        store = mockStore({});
        render(<TestWrapper store={store}><ViewToggle /></TestWrapper>);

        expect(screen.getByTestId("map-icon")).toBeDefined();
        expect(screen.getByTestId("person-icon")).toBeDefined();
    });

    it("should dispatch action to set Cartesian view on click", () => {
        (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.FirstPerson);
        store = mockStore({});
        render(<TestWrapper store={store}><ViewToggle /></TestWrapper>);

        const cartesianButton = screen.getByTitle("Cartesian View");
        fireEvent.click(cartesianButton);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "map/setSelectedViewType",
            payload: C3D_MapViewType.Cartesian,
        });
    });

    it("should dispatch action to set First Person view on click", () => {
        (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
        store = mockStore({});
        render(<TestWrapper store={store}><ViewToggle /></TestWrapper>);

        const firstPersonButton = screen.getByTitle("First Person View");
        fireEvent.click(firstPersonButton);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "map/setSelectedViewType",
            payload: C3D_MapViewType.FirstPerson,
        });
    });

    it("should show selector as active for First Person view", () => {
        (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.FirstPerson);
        store = mockStore({});
        const { container } = render(<TestWrapper store={store}><ViewToggle /></TestWrapper>);

        const selector = container.querySelector('.selector');
        expect(selector?.classList.contains("active")).toBe(true);
    });

    it("should not show selector as active for Cartesian view", () => {
        (useAppSelector as any as Mock).mockReturnValue(C3D_MapViewType.Cartesian);
        store = mockStore({});
        const { container } = render(<TestWrapper store={store}><ViewToggle /></TestWrapper>);

        const selector = container.querySelector('.selector');
        expect(selector?.classList.contains("active")).toBe(false);
    });
});
