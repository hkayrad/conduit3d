import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import TrafoBinaComponent from '../../../../../../../src/app/layout/map/components/data/buildings/TrafoBinaComponent';
import { TrafoBinaApi } from '../../../../../../../src/lib/api';
import { C3D_MapViewType } from '../../../../../../../src/lib/enums';

vi.mock('../../../../../../../src/lib/api', () => ({
    TrafoBinaApi: {
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

describe('TrafoBinaComponent', () => {
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
        (TrafoBinaApi.fetchAllProto as any).mockResolvedValue({ isSuccess: true, data: [] });
    });

    it('should render nothing (returns null)', () => {
        const { container } = render(<TrafoBinaComponent {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should trigger API call on mount', () => {
        render(<TrafoBinaComponent {...defaultProps} />);
        expect(TrafoBinaApi.fetchAllProto).toHaveBeenCalled();
    });
});
