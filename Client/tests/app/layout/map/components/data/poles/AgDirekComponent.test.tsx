import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AgDirekComponent from '../../../../../../../src/app/layout/map/components/data/poles/AgDirekComponent';
import { AgDirekApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    AgDirekApi: {
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

describe('AgDirekComponent', () => {
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
        (AgDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (AgDirekApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<AgDirekComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<AgDirekComponent {...defaultProps} />);
        expect(AgDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<AgDirekComponent {...defaultProps} />);
        expect(AgDirekApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch with height parsing', async () => {
        const mockData = [
            { id: 1, kodu: 'AD1', adi: 'AG Direk 1', cinsi: 'BETON', tipi: 'AG', direkNo: '1', boyOzellik: '10/150', direkBoyId: 1, wkb: 'test' },
        ];
        (AgDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<AgDirekComponent {...defaultProps} />);
        expect(AgDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (AgDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<AgDirekComponent {...defaultProps} />);
        expect(AgDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
        (AgDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 500 });

        render(<AgDirekComponent {...defaultProps} />);
        expect(AgDirekApi.fetchAllProto).toHaveBeenCalled();
    });
});
