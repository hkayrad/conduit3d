import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../../../src/lib/hooks/useSearch';
import * as Utils from '../../../src/lib/utils';
import { FeatureType, QueryKeywords } from '../../../src/lib/enums';
import { MAX_SEARCH_RESULTS } from '../../../src/lib/constants';

vi.mock('../../../src/lib/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('../../../src/lib/api')>();
    return {
        ...original,
        AdrBinaApi: { fetchAll: vi.fn() },
        TrafoBinaApi: { fetchAll: vi.fn() },
        AdrYolApi: { fetchAll: vi.fn() },
        AgDirekApi: { fetchAll: vi.fn() },
        OgMusDirekApi: { fetchAll: vi.fn() },
        AydDirekApi: { fetchAll: vi.fn() },
        AgHatApi: { fetchAll: vi.fn() },
        OgHatApi: { fetchAll: vi.fn() },
        RekortmanApi: { fetchAll: vi.fn() },
    };
});

vi.mock('../../../src/lib/utils', async (importOriginal) => {
    const original = await importOriginal<typeof Utils>();
    return {
        ...original,
        Logger: {
            error: vi.fn(),
        },
        InputSanitizer: {
            sanitizeSearchQuery: vi.fn((query) => query),
        },
        wkbToGeometry: vi.fn((wkb) => ({ type: 'Point', coordinates: [0, 0] })),
        findAverageLonLat: vi.fn(() => '0.00, 0.00'),
    };
});

const mockSuccess = (data: any[]) => ({ isSuccess: true, data, message: '', statusCode: 200 });
const mockFailure = (message: string) => ({ isSuccess: false, message, data: null!, statusCode: 500 });

const mockBinaData = [{ id: 'b1', adi: 'Test Bina', wkb: 'wkb1' }];
const mockTrafoData = [{ id: 't1', adi: 'Test Trafo', kodu: 'T-01', wkb: 'wkb2' }];
const mockAgDirekData = [{ id: 'ag1', cinsi: 'AG', tipi: 'Beton', boyOzellik: '10m', direkNo: 'D-01', wkb: 'wkb3' }];
const mockYolData = [{ id: 'y1', adi: 'Test Yol', kodu: 'Y-01', wkb: 'wkb4' }];
const mockOgMusDirekData = [{ id: 'ogm1', cinsi: 'OG', tipi: 'Demir', boyOzellik: '12m', direkNo: 'D-02', wkb: 'wkb5' }];
const mockAydDirekData = [{ id: 'ayd1', cinsi: 'AYD', tipi: 'Kompozit', boyOzellik: '8m', direkNo: 'D-03', wkb: 'wkb6' }];
const mockAgHatData = [{ id: 'agh1', tipi: 'AG Hat', cinsi: 'Alüminyum', kesit: '3x70', wkb: 'wkb7' }];
const mockOgHatData = [{ id: 'ogh1', tipi: 'OG Hat', cinsi: 'Bakır', kesit: '3x95', wkb: 'wkb8' }];
const mockRekortmanData = [{ id: 'r1', tipi: 'Tip A', kesit: '3x50', wkb: 'wkb9' }];

import { AdrBinaApi, AdrYolApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from '../../../src/lib/api';

describe('useSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to successful, empty responses
        (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (TrafoBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (AdrYolApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (OgMusDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (AydDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (AgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (OgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
        (RekortmanApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
    });

    describe('Mock isolation', () => {
        it('should create independent fetchAll mocks for each API', () => {
            expect(AdrBinaApi.fetchAll).not.toBe(TrafoBinaApi.fetchAll);
            expect(AdrBinaApi.fetchAll).not.toBe(AgDirekApi.fetchAll);
            expect(AgDirekApi.fetchAll).not.toBe(OgMusDirekApi.fetchAll);
            expect(OgMusDirekApi.fetchAll).not.toBe(AgHatApi.fetchAll);
            expect(AgHatApi.fetchAll).not.toBe(RekortmanApi.fetchAll);
        });

        it('should keep mocked responses isolated per API', async () => {
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockBinaData));
            (TrafoBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockTrafoData));
            (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (AdrYolApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (OgMusDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (AydDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (AgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (OgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (RekortmanApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('isolated'));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(result.current.results).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: 'bina-b1' }),
                    expect.objectContaining({ id: 'trafo-t1' }),
                ])
            );
            expect(result.current.results).toHaveLength(2);
        });
    });

    it('should return initial state and functions', () => {
        const { result } = renderHook(() => useSearch());

        expect(result.current.query).toBe('');
        expect(result.current.results).toEqual([]);
        expect(result.current.isFocused).toBe(false);
        expect(typeof result.current.setQuery).toBe('function');
        expect(typeof result.current.handleSearch).toBe('function');
        expect(typeof result.current.setIsFocused).toBe('function');
    });

    it('should update query state via setQuery', () => {
        const { result } = renderHook(() => useSearch());

        act(() => {
            result.current.setQuery('new query');
        });

        expect(result.current.query).toBe('new query');
    });

    it('should not perform search if query is empty', async () => {
        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch();
        });

        expect(AdrBinaApi.fetchAll).not.toHaveBeenCalled();
        expect(result.current.results).toEqual([]);
    });

    describe('General Search (no keyword)', () => {
        it('should call all relevant APIs and aggregate results', async () => {
            // Only mock the APIs we want to return data
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockBinaData));
            (TrafoBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockTrafoData));
            (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAgDirekData));

            // Explicitly ensure other APIs return empty results
            (AdrYolApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (OgMusDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (AydDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (AgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (OgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));
            (RekortmanApi.fetchAll as Mock).mockResolvedValue(mockSuccess([]));

            const { result } = renderHook(() => useSearch());

            act(() => {
                result.current.setQuery('test');
            });

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AdrBinaApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(TrafoBinaApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(AgDirekApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(OgMusDirekApi.fetchAll).toHaveBeenCalled(); // Called for direk search
            expect(AgHatApi.fetchAll).toHaveBeenCalled(); // Called for hat search

            expect(result.current.results).toHaveLength(3);
            expect(result.current.results[0].id).toBe('bina-b1');
            expect(result.current.results[1].id).toBe('trafo-t1');
            expect(result.current.results[2].id).toBe('direk-ag-ag1');
        });

        it('should limit results to MAX_SEARCH_RESULTS', async () => {
            const manyBinas = new Array(10).fill(0).map((_, i) => ({ id: `b${i}`, adi: 'Bina', wkb: 'wkb' }));
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(manyBinas));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('many'));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(result.current.results).toHaveLength(MAX_SEARCH_RESULTS);
        });

        it('should handle API failures gracefully', async () => {
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockBinaData));
            (TrafoBinaApi.fetchAll as Mock).mockResolvedValue(mockFailure('Trafo API Error'));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('test'));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(Utils.Logger.error).toHaveBeenCalledWith('Trafo API error:', 'Trafo API Error');
        });
    });

    describe('Keyword Search', () => {
        it('should search only for AdrBina with "bina:" keyword', async () => {
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockBinaData));
            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery(`${QueryKeywords.BINA}:test`));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AdrBinaApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(result.current.results).toHaveLength(1);
            expect(result.current.results[0].type).toBe(FeatureType.BUILDING);
        });

        it('should search for all direk types with "direk:" keyword', async () => {
            (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAgDirekData));
            (OgMusDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([{ id: 'og1', wkb: 'wkb' }]));
            (AydDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess([{ id: 'ayd1', wkb: 'wkb' }]));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery(`${QueryKeywords.DIREK}:test`));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AgDirekApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(OgMusDirekApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(AydDirekApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(result.current.results).toHaveLength(3);
            expect(result.current.results.every(r => r.type === FeatureType.POLE)).toBe(true);
        });

        it('should search for a specific direk type with "ag_direk:" keyword', async () => {
            (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAgDirekData));
            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery(`${QueryKeywords.AG_DIREK}:test`));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AgDirekApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(result.current.results).toHaveLength(1);
            expect(result.current.results[0].id).toBe('direk-ag-ag1');
        });

        it('should search for all hat types with "hat:" keyword', async () => {
            (AgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([{ id: 'agh1', wkb: 'wkb' }]));
            (OgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess([{ id: 'ogh1', wkb: 'wkb' }]));
            (RekortmanApi.fetchAll as Mock).mockResolvedValue(mockSuccess([{ id: 'r1', wkb: 'wkb' }]));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery(`${QueryKeywords.HAT}:test`));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AgHatApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(OgHatApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(RekortmanApi.fetchAll).toHaveBeenCalledWith(MAX_SEARCH_RESULTS, 1, 'id', true, 'test');
            expect(result.current.results).toHaveLength(3);
        });

        it('should return empty results for an unknown keyword', async () => {
            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('unknown_keyword:test'));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(AdrBinaApi.fetchAll).not.toHaveBeenCalled();
            expect(result.current.results).toEqual([]);
        });
    });

    describe('Error and Edge Case Handling', () => {
        it('should handle a top-level network error during search', async () => {
            const error = new Error('Network Failure');
            (AdrBinaApi.fetchAll as Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('test'));

            await act(async () => {
                await result.current.handleSearch();
            });

            expect(Utils.Logger.error).toHaveBeenCalledWith('Search error:', error);
            expect(result.current.results).toEqual([]);
        });

        it('should correctly format various feature types', async () => {
            vi.clearAllMocks();

            // Set up mocks explicitly
            (AdrBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockBinaData));
            (TrafoBinaApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockTrafoData));
            (AgDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAgDirekData));
            (AdrYolApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockYolData));
            (OgMusDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockOgMusDirekData));
            (AydDirekApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAydDirekData));
            (AgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockAgHatData));
            (OgHatApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockOgHatData));
            (RekortmanApi.fetchAll as Mock).mockResolvedValue(mockSuccess(mockRekortmanData));

            const { result } = renderHook(() => useSearch());
            act(() => result.current.setQuery('test'));

            await act(async () => {
                await result.current.handleSearch();
            });


            const binaResult = result.current.results.find(r => r.type === FeatureType.BUILDING);
            const trafoResult = result.current.results.find(r => r.type === FeatureType.TRAFO);
            const poleResult = result.current.results.find(r => r.type === FeatureType.POLE);
            const yolResult = result.current.results.find(r => r.type === FeatureType.YOL);
            const agHatResult = result.current.results.find(r => r.id === 'hat-agh1');
            const ogHatResult = result.current.results.find(r => r.id === 'hat-ogh1');
            const rekortmanResult = result.current.results.find(r => r.type === FeatureType.REKORTMAN);

            // AdrBina
            expect(binaResult).toBeDefined();
            expect(binaResult?.title).toBe('Test Bina');
            expect(binaResult?.subtitle).toBe('b1');

            expect(trafoResult).toBeDefined();
            expect(trafoResult?.title).toBe('Test Trafo');
            expect(trafoResult?.subtitle).toBe('Kodu: T-01 | Id: t1');

            // AdrYol
            expect(yolResult).toBeDefined();
            expect(yolResult?.title).toBe('Test Yol');
            expect(yolResult?.subtitle).toBe('Kodu: Y-01 | Id: y1');

            // AgDirek (part of Pole type)
            expect(poleResult).toBeDefined();
            expect(poleResult?.title).toBe('AG Beton (10m)');
            expect(poleResult?.subtitle).toBe('No: D-01 | Id: ag1');

            // OgMusDirek (part of Pole type) - need to find it specifically
            const ogMusDirekResult = result.current.results.find(r => r.id === 'direk-og-ogm1');
            expect(ogMusDirekResult).toBeDefined();
            expect(ogMusDirekResult?.title).toBe('OG Demir (12m)');
            expect(ogMusDirekResult?.subtitle).toBe('No: D-02 | Id: ogm1');

            // AgHat
            expect(agHatResult).toBeDefined();
            expect(agHatResult?.title).toBe('AG Hat Alüminyum');
            expect(agHatResult?.subtitle).toBe('Kesit: 3x70 | Id: agh1');

            // OgHat
            expect(ogHatResult).toBeDefined();
            expect(ogHatResult?.title).toBe('OG Hat Bakır');
            expect(ogHatResult?.subtitle).toBe('Kesit: 3x95 | Id: ogh1');

            // Rekortman
            expect(rekortmanResult).toBeDefined();
            expect(rekortmanResult?.title).toBe('Rekortman Tip A');
            expect(rekortmanResult?.subtitle).toBe('Kesit: 3x50 | Id: r1');
        });
    });
});