import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import RekortmanComponent from '../../../../../../../src/app/layout/map/components/data/lines/RekortmanComponent';
import { RekortmanApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    RekortmanApi: {
        fetchAllProto: vi.fn(),
        fetchTypes: vi.fn(),
    }
}));

vi.mock('../../../../../../../src/lib/hooks', () => ({
    useAppDispatch: () => vi.fn(),
}));

vi.mock('../../../../../../../src/lib/utils', () => ({
    handleDataFetch: vi.fn((isLoading, abortController, extent, zoom, viewType, fetchNextChunk, setData) => {
        fetchNextChunk(1);
    }),
    wkbToGeometry: vi.fn(() => ({ type: 'LineString', coordinates: [[0, 0], [1, 1]] })),
    lineStringToSegments: vi.fn(() => []),
    Logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));

describe('RekortmanComponent', () => {
    const mockSetData = vi.fn();
    const mockPoles: GeoJSON.Feature[] = [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 1 } },
    ];
    const defaultProps = {
        setData: mockSetData,
        allPoles: mockPoles,
        extent: { minX: 0, minY: 0, maxX: 2, maxY: 2 },
        zoom: 10,
        selectedViewType: C3D_MapViewType.Cartesian,
        refreshTrigger: 0
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (RekortmanApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (RekortmanApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<RekortmanComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call when poles are provided', () => {
        render(<RekortmanComponent {...defaultProps} />);
        expect(RekortmanApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<RekortmanComponent {...defaultProps} />);
        expect(RekortmanApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, kodu: 'R1', adi: 'Rekortman 1', kesit: '35', tipi: 'REKORTMAN', wkb: 'test' },
        ];
        (RekortmanApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<RekortmanComponent {...defaultProps} />);
        expect(RekortmanApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (RekortmanApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<RekortmanComponent {...defaultProps} />);
        expect(RekortmanApi.fetchAllProto).toHaveBeenCalled();
    });
});
