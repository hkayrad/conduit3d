import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import BuildingComponent from '../../../../../../../src/app/layout/map/components/data/buildings/BuildingComponent';
import { BuildingsApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    BuildingsApi: {
        fetchAllProto: vi.fn()
    }
}));

vi.mock('../../../../../../../src/lib/utils', () => ({
    handleDataFetch: vi.fn((isLoading, abortController, extent, zoom, viewType, fetchNextChunk, setData) => {
        fetchNextChunk(1);
    }),
    wkbToGeometry: vi.fn(() => ({ type: 'Point', coordinates: [0, 0] })),
    Logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));

describe('BuildingComponent', () => {
    const mockSetData = vi.fn();
    const defaultProps = {
        setData: mockSetData,
        extent: { minX: 0, minY: 0, maxX: 2, maxY: 2 },
        zoom: 10,
        selectedViewType: C3D_MapViewType.Cartesian,
        refreshTrigger: 0
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (BuildingsApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<BuildingComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<BuildingComponent {...defaultProps} />);
        expect(BuildingsApi.fetchAllProto).toHaveBeenCalled();
    });
});
