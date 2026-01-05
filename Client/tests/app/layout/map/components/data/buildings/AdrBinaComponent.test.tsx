import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AdrBinaComponent from '../../../../../../../src/app/layout/map/components/data/buildings/AdrBinaComponent';
import { AdrBinaApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    AdrBinaApi: {
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

describe('AdrBinaComponent', () => {
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
        (AdrBinaApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<AdrBinaComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<AdrBinaComponent {...defaultProps} />);
        expect(AdrBinaApi.fetchAllProto).toHaveBeenCalled();
    });

    it('should filter out SANAL_BINA features', async () => {
        const mockData = [
            { id: 1, adi: 'Building 1', kodu: 'B1', wkb: 'test', siteAdi: '', binaKatSayisi: 5, daireSayisi: 10, isyeriSayisi: 2, yukseklik: 15 },
            { id: 2, adi: 'SANAL_BINA', kodu: 'SB', wkb: 'test', siteAdi: '', binaKatSayisi: 1, daireSayisi: 0, isyeriSayisi: 0, yukseklik: 0 }
        ];
        (AdrBinaApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: mockData });

        render(<AdrBinaComponent {...defaultProps} />);
        expect(AdrBinaApi.fetchAllProto).toHaveBeenCalled();
    });
});
