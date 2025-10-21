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

vi.mock('../../../src/lib/utils/protos/poles/agDirek', () => ({
    AgDirekResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/poles/ogMusDirek', () => ({
    OgMusDirekResponse: {
        decode: vi.fn(),
    },
}));
vi.mock('../../../src/lib/utils/protos/poles/aydDirek', () => ({
    AydDirekResponse: {
        decode: vi.fn(),
    },
}));

// Now import the modules
import axios from 'axios';
import instance from '../../../src/lib/instance';
import { AgDirekApi, OgMusDirekApi, AydDirekApi } from '../../../src/lib/api/poles';
import { Logger } from '../../../src/lib/utils';
import { AgDirekResponse } from '../../../src/lib/utils/protos/poles/agDirek';
import { OgMusDirekResponse } from '../../../src/lib/utils/protos/poles/ogMusDirek';
import { AydDirekResponse } from '../../../src/lib/utils/protos/poles/aydDirek';

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

describe('Poles API Classes', () => {
    beforeEach(() => {
        const mockCancel = vi.fn();
        const mockToken = { cancel: mockCancel, token: {} };
        mockedAxios.CancelToken = { source: vi.fn().mockReturnValue(mockToken) } as any;

        mockedInstance.get = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // --- AgDirekApi Tests ---
    describe('AgDirekApi', () => {
        it('fetchAll should fetch AG Direk poles', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgDirekApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agDirek', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AgDirekApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AgDirek error:', error);
        });

        it('fetchTypes should fetch AG Direk types', async () => {
            const mockData = { data: ['type1', 'type2'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgDirekApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agDirek/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of AG Direk poles', async () => {
            const mockData = { data: 100, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AgDirekApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agDirek/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch AG Direk poles as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { poles: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(AgDirekResponse.decode).mockReturnValue(decodedData as any);

            const result = await AgDirekApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('agDirek/pbf', expect.any(Object));
            expect(AgDirekResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });

        it('fetchAllProto should cancel previous request', async () => {
            const mockCancel = vi.fn();
            (mockedAxios.CancelToken.source as Mock)
                .mockReturnValueOnce({ token: 'token1', cancel: mockCancel } as any)
                .mockReturnValueOnce({ token: 'token2', cancel: vi.fn() } as any);

            (mockedInstance.get as Mock).mockResolvedValue({ data: new ArrayBuffer(0) });

            // First call
            AgDirekApi.fetchAllProto();
            // Second call
            await AgDirekApi.fetchAllProto();

            expect(mockCancel).toHaveBeenCalledWith('Operation canceled due to new request.');
        });

        it('fetchAllProto should handle cancellation warning', async () => {
            const error = 'Request cancelled';
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AgDirekApi.fetchAllProto()).rejects.toThrow(error);
            expect(mockedLogger.warn).toHaveBeenCalledWith('Request was cancelled by axios');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AgDirek Proto error:', error);
        });
    });

    // --- OgMusDirekApi Tests ---
    describe('OgMusDirekApi', () => {
        it('fetchAll should fetch OG Mus Direk poles', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgMusDirekApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogMusDirek', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(OgMusDirekApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch OgMusDirek error:', error);
        });

        it('fetchTypes should fetch OG Mus Direk types', async () => {
            const mockData = { data: ['typeA', 'typeB'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgMusDirekApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogMusDirek/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of OG Mus Direk poles', async () => {
            const mockData = { data: 50, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await OgMusDirekApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogMusDirek/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch OG Mus Direk poles as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { poles: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(OgMusDirekResponse.decode).mockReturnValue(decodedData as any);

            const result = await OgMusDirekApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('ogMusDirek/pbf', expect.any(Object));
            expect(OgMusDirekResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });

    // --- AydDirekApi Tests ---
    describe('AydDirekApi', () => {
        it('fetchAll should fetch Ayd Direk poles', async () => {
            const mockData = { data: [{ id: 1 }], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AydDirekApi.fetchAll();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('aydDirek', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Network Error');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(AydDirekApi.fetchAll()).rejects.toThrow('Network Error');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch AydDirek error:', error);
        });

        it('fetchTypes should fetch Ayd Direk types', async () => {
            const mockData = { data: ['typeX', 'typeY'], success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AydDirekApi.fetchTypes();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('aydDirek/types');
            expect(result).toEqual(mockData);
        });

        it('fetchCount should fetch the count of Ayd Direk poles', async () => {
            const mockData = { data: 200, success: true, message: '' };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockData });

            const result = await AydDirekApi.fetchCount();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('aydDirek/count', expect.any(Object));
            expect(result).toEqual(mockData);
        });

        it('fetchAllProto should fetch Ayd Direk poles as protobuf', async () => {
            const mockProtoData = new ArrayBuffer(8);
            const decodedData = { poles: [] };
            (mockedInstance.get as Mock).mockResolvedValue({ data: mockProtoData });
            vi.mocked(AydDirekResponse.decode).mockReturnValue(decodedData as any);

            const result = await AydDirekApi.fetchAllProto();

            expect((mockedInstance.get as Mock)).toHaveBeenCalledWith('aydDirek/pbf', expect.any(Object));
            expect(AydDirekResponse.decode).toHaveBeenCalledWith(new Uint8Array(mockProtoData));
            expect(result).toEqual(decodedData);
        });
    });
});

describe('Poles API Parameterization', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('AgDirekApi.fetchAll should pass all parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AgDirekApi.fetchAll(100, 2, 'name', false, 'test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agDirek',
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

    it('AgDirekApi.fetchAll should use default parameters', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await AgDirekApi.fetchAll();

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agDirek',
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

    it('AgDirekApi.fetchCount should pass parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });
        const extent = { minX: 10, minY: 20, maxX: 30, maxY: 40 };

        await AgDirekApi.fetchCount('test_query', extent);

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            'agDirek/count',
            expect.objectContaining({
                params: {
                    query: 'test_query',
                    ...extent,
                },
            })
        );
    });
});