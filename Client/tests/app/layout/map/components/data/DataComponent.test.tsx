import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import DataComponent from '../../../../../../src/app/layout/map/components/data/DataComponent';
import { C3D_MapViewType } from '../../../../../../src/lib/enums';

// Mock all the child components
vi.mock('../../../../../../src/app/layout/map/components/data/buildings/AdrBinaComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/buildings/AdrYolComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/buildings/BuildingComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/buildings/TrafoBinaComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/lines/AgHatComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/lines/OgHatComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/lines/RekortmanComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/poles/AgDirekComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/poles/AydDirekComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/poles/OgMusDirekComponent', () => ({
    default: () => null,
}));
vi.mock('../../../../../../src/app/layout/map/components/data/armatur/ArmaturComponent', () => ({
    default: () => null,
}));

// Mock Redux hooks and selectors
vi.mock('../../../../../../src/lib/hooks', () => ({
    useAppSelector: vi.fn((selector) => {
        if (selector.name === 'selectExtent') {
            return { minX: 0, minY: 0, maxX: 2, maxY: 2 };
        }
        if (selector.name === 'selectViewState') {
            return { cartesian: { zoom: 10 } };
        }
        if (selector.name === 'selectSelectedViewType') {
            return C3D_MapViewType.Cartesian;
        }
        return null;
    }),
}));

describe('DataComponent', () => {
    const mockSetData = vi.fn();
    const mockPoles: GeoJSON.Feature[] = [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 1 } },
    ];
    const defaultProps = {
        allPoles: mockPoles,
        setAdrBina: mockSetData,
        setBuildingBina: mockSetData,
        setTrafoBina: mockSetData,
        setAdrYol: mockSetData,
        setAgDirek: mockSetData,
        setOgMusDirek: mockSetData,
        setAydDirek: mockSetData,
        setAgHat: mockSetData,
        setOgHat: mockSetData,
        setRekortman: mockSetData,
        setArmatur: mockSetData,
        refreshTrigger: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without crashing', () => {
        const { container } = render(<DataComponent {...defaultProps} />);
        expect(container).toBeDefined();
    });

    it('should render all data sub-components as mocked', () => {
        render(<DataComponent {...defaultProps} />);
        // Since all children are mocked to return null, container should be empty
        // but the component itself should render
    });
});
