import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import OgMusDirekComponent from '../../../../../../../src/app/layout/map/components/data/poles/OgMusDirekComponent';
import { OgMusDirekApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    OgMusDirekApi: {
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
    wkbToGeometry: vi.fn(() => ({ type: 'Point', coordinates: [0, 0] })),
    Logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));

describe('OgMusDirekComponent', () => {
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
        (OgMusDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (OgMusDirekApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<OgMusDirekComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<OgMusDirekComponent {...defaultProps} />);
        expect(OgMusDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<OgMusDirekComponent {...defaultProps} />);
        expect(OgMusDirekApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, kodu: 'OGM1', adi: 'OG Mus Direk 1', cinsi: 'BETON', tipi: 'OG', direkNo: '1', boyOzellik: '12/200', direkBoyId: 1, wkb: 'test' },
        ];
        (OgMusDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<OgMusDirekComponent {...defaultProps} />);
        expect(OgMusDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (OgMusDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<OgMusDirekComponent {...defaultProps} />);
        expect(OgMusDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
        (OgMusDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 500 });

        render(<OgMusDirekComponent {...defaultProps} />);
        expect(OgMusDirekApi.fetchAllProto).toHaveBeenCalled();
    });
});
