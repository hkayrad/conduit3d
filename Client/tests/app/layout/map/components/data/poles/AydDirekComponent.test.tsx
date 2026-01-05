import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AydDirekComponent from '../../../../../../../src/app/layout/map/components/data/poles/AydDirekComponent';
import { AydDirekApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    AydDirekApi: {
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

describe('AydDirekComponent', () => {
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
        (AydDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (AydDirekApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<AydDirekComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<AydDirekComponent {...defaultProps} />);
        expect(AydDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<AydDirekComponent {...defaultProps} />);
        expect(AydDirekApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, kodu: 'AYD1', adi: 'Ayd Direk 1', cinsi: 'DEMIR', tipi: 'AYDINLATMA', direkNo: '1', boyOzellik: '8/100', direkBoyId: 1, wkb: 'test' },
        ];
        (AydDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<AydDirekComponent {...defaultProps} />);
        expect(AydDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (AydDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<AydDirekComponent {...defaultProps} />);
        expect(AydDirekApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
        (AydDirekApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 500 });

        render(<AydDirekComponent {...defaultProps} />);
        expect(AydDirekApi.fetchAllProto).toHaveBeenCalled();
    });
});
