import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AdrYolComponent from '../../../../../../../src/app/layout/map/components/data/buildings/AdrYolComponent';
import { AdrYolApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    AdrYolApi: {
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
    Logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));

describe('AdrYolComponent', () => {
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
        (AdrYolApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
        (AdrYolApi.fetchTypes as any).mockResolvedValue({ isSuccess: true, data: ['Type1', 'Type2'] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<AdrYolComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<AdrYolComponent {...defaultProps} />);
        expect(AdrYolApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should fetch types on mount', () => {
        render(<AdrYolComponent {...defaultProps} />);
        expect(AdrYolApi.fetchTypes).toHaveBeenCalled();
    });

    it('should handle successful data fetch', async () => {
        const mockData = [
            { id: 1, adi: 'Road 1', kodu: 'R1', wkb: 'test', genislik: 10, seritSayisi: 2, yapisi: 'ASFALT', tipi: 'CADDE' },
        ];
        (AdrYolApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<AdrYolComponent {...defaultProps} />);
        expect(AdrYolApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle 404 response gracefully', async () => {
        (AdrYolApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 404 });

        render(<AdrYolComponent {...defaultProps} />);
        expect(AdrYolApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
        (AdrYolApi.fetchAllProto as any).mockResolvedValue({ isSuccess: false, statusCode: 500 });

        render(<AdrYolComponent {...defaultProps} />);
        expect(AdrYolApi.fetchAllProto).toHaveBeenCalled();
    });
});
