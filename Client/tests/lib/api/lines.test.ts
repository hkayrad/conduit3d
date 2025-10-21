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
            isCancel: vi.fn(thrown => thrown?.message?.includes('cancel')),
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

vi.mock('../../../src/lib/utils/protos/lines/agHat', () => ({
    AgHatResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/lines/ogHat', () => ({
    OgHatResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/lines/rekortman', () => ({
    RekortmanResponse: {
        decode: vi.fn(),
    },
}));

// Now import the modules
import axios from 'axios';
import instance from '../../../src/lib/instance';
import { AgHatApi, OgHatApi, RekortmanApi } from '../../../src/lib/api/lines';
import { Logger } from '../../../src/lib/utils';
import { AgHatResponse } from '../../../src/lib/utils/protos/lines/agHat';
import { OgHatResponse } from '../../../src/lib/utils/protos/lines/ogHat';
import { RekortmanResponse } from '../../../src/lib/utils/protos/lines/rekortman';

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

describe('Lines API Classes', () => {
    beforeEach(() => {
        const mockCancel = vi.fn();
        const mockToken = { cancel: mockCancel, token: {} };
        mockedAxios.CancelToken = { source: vi.fn().mockReturnValue(mockToken) } as any;

        mockedInstance.get = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // --- AgHatApi Tests ---
    describe('AgHatApi', () => {
        it('fetchAll should fetch AG Hat lines', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgHatApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agHat', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AgHatApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AgHat error:', error);
        });

        it('fetchTypes should fetch AG Hat types', async () => {
            const mockData = { data: ['type1', 'type2'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgHatApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agHat/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of AG Hat lines', async () => {
            const mockData = { data: 100, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgHatApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agHat/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch AG Hat lines as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { lines: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(AgHatResponse.decode).mockReturnValue(decodedData as any);

            const result = await AgHatApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agHat/pbf', expect.any(Object));
            expect(AgHatResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });

        it('fetchAllProto should cancel previous request', async () => {
            const mockCancel = vi.fn();
            (mockedAxios.CancelToken.source as Mock)
                .mockReturnValueOnce({ token: 'token1', cancel: mockCancel } as any)
                .mockReturnValueOnce({ token: 'token2', cancel: vi.fn() } as any);

            (mockedInstance.get as Mock).mockResolvedValue({ data: new ArrayBuffer(0) });

            // First call
            AgHatApi.fetchAllProto();
            // Second call
            await AgHatApi.fetchAllProto();

            expect(mockCancel).toHaveBeenCalledWith('Operation canceled due to new request.');
        });

        it('fetchAllProto should handle cancellation warning', async () => {
            const error = 'Request cancelled';
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AgHatApi.fetchAllProto()).rejects.toThrow(error);
            expect(mockedLogger.warn).toHaveBeenCalledWith('Request was cancelled by axios');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AgHat Proto error:', error);
        });
    });

    // --- OgHatApi Tests ---
    describe('OgHatApi', () => {
        it('fetchAll should fetch OG Hat lines', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgHatApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogHat', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(OgHatApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch OgHat error:', error);
        });

        it('fetchTypes should fetch OG Hat types', async () => {
            const mockData = { data: ['typeA', 'typeB'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgHatApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogHat/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of OG Hat lines', async () => {
            const mockData = { data: 50, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgHatApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogHat/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch OG Hat lines as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { lines: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(OgHatResponse.decode).mockReturnValue(decodedData as any);

            const result = await OgHatApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogHat/pbf', expect.any(Object));
            expect(OgHatResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });

    // --- RekortmanApi Tests ---
    describe('RekortmanApi', () => {
        it('fetchAll should fetch Rekortman lines', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await RekortmanApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('rekortman', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(RekortmanApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch Rekortman error:', error);
        });

        it('fetchTypes should fetch Rekortman types', async () => {
            const mockData = { data: ['typeX', 'typeY'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await RekortmanApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('rekortman/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of Rekortman lines', async () => {
            const mockData = { data: 200, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await RekortmanApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('rekortman/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch Rekortman lines as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { lines: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(RekortmanResponse.decode).mockReturnValue(decodedData as any);

            const result = await RekortmanApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('rekortman/pbf', expect.any(Object));
            expect(RekortmanResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });
});

describe('Lines API Parameterization', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('AgHatApi.fetchAll should pass all parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AgHatApi.fetchAll(100, 2, 'name', false, 'test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agHat',
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

    it('AgHatApi.fetchAll should use default parameters', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await AgHatApi.fetchAll();

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agHat',
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

    it('AgHatApi.fetchCount should pass parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AgHatApi.fetchCount('test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agHat/count',
            expect.objectContaining({
                params: {
                    query: 'test_query',
                    ...extent,
                },
            })
        );
    });
});