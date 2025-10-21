import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { DEFAULT_EXTENT } from '../../../src/lib/constants';

// Mock axios BEFORE importing anything that uses it

vi.mock('axios', () => {
    const mockCancelToken = {
        source: vi.fn()
    };

    const mockInterceptorManager = {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn()
    };

    return {
        default: {
            interceptors: {
                request: mockInterceptorManager,
                response: mockInterceptorManager,
            },
            CancelToken: mockCancelToken,
            create: vi.fn(() => ({
                interceptors: {
                    request: mockInterceptorManager,
                    response: mockInterceptorManager,
                },
            })),
        },
    };
});

vi.mock('../../../src/lib/instance');
vi.mock('../../../src/lib/utils', () => ({
    Logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
    capitalizeFirstLetter: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
}));

vi.mock('../../../src/lib/utils/protos/buildings/adrBina', () => ({
    AdrBinaResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/buildings/trafoBina', () => ({
    TrafoBinaResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/buildings/buildings', () => ({
    BuildingsResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/buildings/adrYol', () => ({
    AdrYolResponse: {
        decode: vi.fn(),
    },
}));

// Now import the modules
import axios from 'axios';
import instance from '../../../src/lib/instance';
import { AdrBinaApi, TrafoBinaApi, BuildingsApi, AdrYolApi } from '../../../src/lib/api/buildings';
import { Logger } from '../../../src/lib/utils';
import { AdrBinaResponse } from '../../../src/lib/utils/protos/buildings/adrBina';
import { TrafoBinaResponse } from '../../../src/lib/utils/protos/buildings/trafoBina';
import { BuildingsResponse } from '../../../src/lib/utils/protos/buildings/buildings';
import { AdrYolResponse } from '../../../src/lib/utils/protos/buildings/adrYol';

const mockInterceptorManager = {
    use: vi.fn(),
    eject: vi.fn(),
    clear: vi.fn()
};

const mockedAxios = vi.mocked(axios);
const mockedInstance = vi.mocked(instance);
mockedInstance.interceptors = {
    request: mockInterceptorManager,
    response: mockInterceptorManager,
};
const mockedLogger = vi.mocked(Logger);

describe('API Classes', () => {
    beforeEach(() => {
        const mockCancel = vi.fn();
        const mockToken = { cancel: mockCancel, token: {} };
        mockedAxios.CancelToken = { source: vi.fn().mockReturnValue(mockToken) } as any;

        mockedInstance.get = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // --- AdrBinaApi Tests ---
    describe('AdrBinaApi', () => {
        it('fetchAll should fetch ADR buildings', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({data: mockData});

            const result = await AdrBinaApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrBina', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AdrBinaApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AdrBina error:', error);
        });

        it('fetchCount should fetch the count of ADR buildings', async () => {
            const mockData = { data: 100, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AdrBinaApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrBina/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch ADR buildings as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { buildings: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(AdrBinaResponse.decode).mockReturnValue(decodedData as any);

            const result = await AdrBinaApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrBina/pbf', expect.any(Object));
            expect(AdrBinaResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });

        it('should cancel previous fetchAll request', async () => {
            const mockCancel = vi.fn();
            (mockedAxios.CancelToken.source as Mock)
                .mockReturnValueOnce({ token: 'token1', cancel: mockCancel } as any)
                .mockReturnValueOnce({ token: 'token2', cancel: vi.fn() } as any);

            (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

            // First call
            AdrBinaApi.fetchAll();
            // Second call
            await AdrBinaApi.fetchAll();

            expect(mockCancel).toHaveBeenCalledWith('Operation canceled due to new request.');
        });
    });

    // --- TrafoBinaApi Tests ---
    describe('TrafoBinaApi', () => {
        it('fetchAll should fetch trafo buildings', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await TrafoBinaApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('trafoBina', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(TrafoBinaApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch TrafoBina error:', error);
        });

        it('fetchCount should fetch the count of trafo buildings', async () => {
            const mockData = { data: 50, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await TrafoBinaApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('trafoBina/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch trafo buildings as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { buildings: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(TrafoBinaResponse.decode).mockReturnValue(decodedData as any);

            const result = await TrafoBinaApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('trafoBina/pbf', expect.any(Object));
            expect(TrafoBinaResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });

    // --- BuildingsApi Tests ---
    describe('BuildingsApi', () => {
        it('fetchAll should fetch buildings', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await BuildingsApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('buildings', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(BuildingsApi.fetchAll()).rejects.toThrow('Network Error');
            // Note: The log message in the original code is "Fetch AdrBina error:"
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AdrBina error:', error);
        });

        it('fetchCount should fetch the count of buildings', async () => {
            const mockData = { data: 200, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await BuildingsApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('buildings/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch buildings as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { buildings: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(BuildingsResponse.decode).mockReturnValue(decodedData as any);

            const result = await BuildingsApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('buildings/pbf', expect.any(Object));
            expect(BuildingsResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });

    // --- AdrYolApi Tests ---
    describe('AdrYolApi', () => {
        it('fetchAll should fetch AdrYol data', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AdrYolApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrYol', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AdrYolApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AdrYol error:', error);
        });

        it('fetchTypes should fetch AdrYol types', async () => {
            const mockData = { data: ['type1', 'type2'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AdrYolApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrYol/types');
            expect(result).toEqual(mockData);
        });

        it('fetchTypes should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AdrYolApi.fetchTypes()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AdrYol types error:', error);
        });

        it('fetchCount should fetch the count of AdrYol', async () => {
            const mockData = { data: 150, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AdrYolApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrYol/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch AdrYol as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { yollar: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(AdrYolResponse.decode).mockReturnValue(decodedData as any);

            const result = await AdrYolApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('adrYol/pbf', expect.any(Object));
            expect(AdrYolResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });

        it('fetchAllProto should handle cancellation warning', async () => {
            const error = 'Request cancelled';
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AdrYolApi.fetchAllProto()).rejects.toThrow(error);
            expect(mockedLogger.warn).toHaveBeenCalledWith('Request was cancelled by axios');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AdrBina Proto error:', error);
        });
    });
});

describe('API Parameterization', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('AdrBinaApi.fetchAll should pass all parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AdrBinaApi.fetchAll(100, 2, 'name', false, 'test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'adrBina',
            expect.objectContaining({
                params: {
                    pageSize: 100,
                    pageNumber: 2,
                    sortBy: 'Name',
                    ascending: false,
                    query: 'test_query',
                    ...extent,
                },
            })
        );
    });

    it('AdrBinaApi.fetchAll should use default parameters', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await AdrBinaApi.fetchAll();

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'adrBina',
            expect.objectContaining({
                params: {
                    pageSize: 200000,
                    pageNumber: 1,
                    sortBy: 'Id',
                    ascending: true,
                    query: null,
                    ...DEFAULT_EXTENT,
                },
            })
        );
    });

    it('AdrBinaApi.fetchCount should pass parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AdrBinaApi.fetchCount('test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'adrBina/count',
            expect.objectContaining({
                params: {
                    query: 'test_query',
                    ...extent,
                },
            })
        );
    });
});