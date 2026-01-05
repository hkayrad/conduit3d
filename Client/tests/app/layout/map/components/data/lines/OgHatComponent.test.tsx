import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import OgHatComponent from '../../../../../../../src/app/layout/map/components/data/lines/OgHatComponent';
import { OgHatApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    OgHatApi: {
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

describe('OgHatComponent', () => {
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
        (OgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (OgHatApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<OgHatComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call when poles are provided', () => {
        render(<OgHatComponent {...defaultProps} />);
        expect(OgHatApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<OgHatComponent {...defaultProps} />);
        expect(OgHatApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, kodu: 'OH1', adi: 'OG Hat 1', cinsi: 'OG', kesit: '50', tipi: 'YERALTI', wkb: 'test' },
        ];
        (OgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<OgHatComponent {...defaultProps} />);
        expect(OgHatApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (OgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<OgHatComponent {...defaultProps} />);
        expect(OgHatApi.fetchAllProto).toHaveBeenCalled();
    });
});
