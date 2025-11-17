import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MousePosition from "../../../../../../src/app/layout/map/components/mousePosition/MousePosition";

describe("MousePosition Component", () => {
    it("should render formatted longitude and latitude with rounding", () => {
        const mockLonLat = [34.1234567, 42.9876543];
        render(<MousePosition mouseLonLat={mockLonLat} />);

        // .toFixed(5) will round the numbers
        expect(screen.getByText("34.12346")).toBeDefined();
        expect(screen.getByText("42.98765")).toBeDefined();
        expect(screen.getByText(",")).toBeDefined();
    });

    it("should pad coordinates with zeros to 5 decimal places", () => {
        const mockLonLat = [34.1, 42.9];
        render(<MousePosition mouseLonLat={mockLonLat} />);

        expect(screen.getByText("34.10000")).toBeDefined();
        expect(screen.getByText("42.90000")).toBeDefined();
    });

    it("should correctly render negative coordinates", () => {
        const mockLonLat = [-118.12345, -34.98765];
        render(<MousePosition mouseLonLat={mockLonLat} />);

        expect(screen.getByText("-118.12345")).toBeDefined();
        expect(screen.getByText("-34.98765")).toBeDefined();
    });

    it("should render the main container with the correct ID", () => {
        const mockLonLat = [0, 0];
        const { container } = render(<MousePosition mouseLonLat={mockLonLat} />);

        const divElement = container.querySelector('#mouse-position');
        expect(divElement).not.toBeNull();
    });
});
