import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Attribution from "../../../../../../src/app/layout/map/components/attribution/Attribution";

const mockStore = configureStore([]);

// Mock the InfoIcon component from lucide-react
vi.mock("lucide-react", () => ({
    InfoIcon: () => <div data-testid="info-icon" />,
}));

describe("Attribution Component", () => {
    const store = mockStore({
        map: {
            customLayers: []
        }
    });

    it("should render the attribution links and info icon", () => {
        render(
            <Provider store={store}>
                <Attribution />
            </Provider>
        );

        // Check for the MapLibre link
        const mapLibreLink = screen.getByText("MapLibre");
        expect(mapLibreLink).toBeDefined();
        expect(mapLibreLink.closest('a')).toHaveProperty('href', 'https://maplibre.org/');

        // Check for the OpenStreetMap link
        const osmLink = screen.getByText("© OpenStreetMap contributors");
        expect(osmLink).toBeDefined();
        expect(osmLink.closest('a')).toHaveProperty('href', 'https://www.openstreetmap.org/copyright');

        // Check for the mocked InfoIcon
        const infoIcon = screen.getByTestId("info-icon");
        expect(infoIcon).toBeDefined();
    });

    it("links should have correct target and rel attributes", () => {
        render(
            <Provider store={store}>
                <Attribution />
            </Provider>
        );

        const links = screen.getAllByRole('link');
        links.forEach(link => {
            expect(link).toHaveProperty('target', '_blank');
            expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        });
    });
});
