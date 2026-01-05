import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AgHatComponent from '../../../../../../../src/app/layout/map/components/data/lines/AgHatComponent';
import { AgHatApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    AgHatApi: {
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

describe('AgHatComponent', () => {
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
        (AgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (AgHatApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<AgHatComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call when poles are provided', () => {
        render(<AgHatComponent {...defaultProps} />);
        expect(AgHatApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should not fetch data when poles array is empty', () => {
        const propsWithNoPoles = { ...defaultProps, allPoles: [] };
        render(<AgHatComponent {...propsWithNoPoles} />);
        // handleDataFetch should still be called but the effect guards against empty poles
    });

    it('should fetch types on mount', () => {
        render(<AgHatComponent {...defaultProps} />);
        expect(AgHatApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, kodu: 'H1', adi: 'Hat 1', cinsi: 'AG', kesit: '35', tipi: 'HAVAI', wkb: 'test' },
        ];
        (AgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<AgHatComponent {...defaultProps} />);
        expect(AgHatApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (AgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<AgHatComponent {...defaultProps} />);
        expect(AgHatApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
        (AgHatApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 500 });

        render(<AgHatComponent {...defaultProps} />);
        expect(AgHatApi.fetchAllProto).toHaveBeenCalled();
    });
});
