import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock dependencies BEFORE importing anything that uses them
vi.mock('axios', () => {
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
            create: vi.fn(() => ({
                interceptors: {
                    request: mockInterceptorManager,
                    response: mockInterceptorManager,
                },
            })),
        },
    };
});

vi.mock('js-cookie', () => ({
    default: {
        remove: vi.fn(),
    },
}));

vi.mock('../../../src/lib/instance');
vi.mock('../../../src/lib/utils', () => ({
    Logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
    capitalizeFirstLetter: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
}));

// Now import the modules
import instance from '../../../src/lib/instance';
import { UserApi, ConfigApi } from '../../../src/lib/api/user';
import { Logger } from '../../../src/lib/utils';
import Cookies from 'js-cookie';
import type { User } from '../../../src/lib/types';

const mockInterceptorManager = {
    use: vi.fn(),
    eject: vi.fn(),
    clear: vi.fn()
};

const mockedInstance = vi.mocked(instance);
mockedInstance.interceptors = {
    request: mockInterceptorManager,
    response: mockInterceptorManager,
};
const mockedLogger = vi.mocked(Logger);
const mockedCookies = vi.mocked(Cookies);

describe('User and Config API Classes', () => {
    beforeEach(() => {
        mockedInstance.get = vi.fn();
        mockedInstance.post = vi.fn();
        mockedInstance.put = vi.fn();
        mockedInstance.delete = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // --- UserApi Tests ---
    describe('UserApi', () => {
        const mockUser: User = { id: 1, username: 'test', userRole: 'user', email: 'test@example.com', password: 'password', name: 'Test User', createdAt: new Date(), isActive: true };
        const mockApiResponse = (data: any) => ({ data: { data, success: true, message: '' } });

        it('login should authenticate a user', async () => {
            (mockedInstance.post as Mock).mockResolvedValue(mockApiResponse(mockUser));
            const credentials = { username: 'test', password: 'password' };

            const result = await UserApi.login(credentials);

            expect(mockedInstance.post).toHaveBeenCalledWith('/user/login', credentials);
            expect(result).toEqual({ data: mockUser, success: true, message: '' });
        });

        it('login should handle errors', async () => {
            const error = new Error('Login failed');
            (mockedInstance.post as Mock).mockRejectedValue(error);

            await expect(UserApi.login({ username: 'test', password: 'password' })).rejects.toThrow('Login failed');
            expect(mockedLogger.error).toHaveBeenCalledWith('Login error:', error);
        });

        it('logout should remove the user session cookie', () => {
            UserApi.logout();
            expect(mockedCookies.remove).toHaveBeenCalledWith('user_session');
        });

        it('fetchAll should fetch all users with parameters', async () => {
            (mockedInstance.get as Mock).mockResolvedValue(mockApiResponse([mockUser]));

            await UserApi.fetchAll(50, 2, 'username', false, 'query');

            expect(mockedInstance.get).toHaveBeenCalledWith('/user', {
                params: {
                    pageSize: 50,
                    pageNumber: 2,
                    sortBy: 'Username',
                    ascending: false,
                    query: 'query'
                }
            });
        });

        it('fetchAll should handle errors', async () => {
            const error = new Error('Fetch failed');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(UserApi.fetchAll()).rejects.toThrow('Fetch failed');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch users error:', error);
        });

        it('fetchCount should fetch the count of users', async () => {
            (mockedInstance.get as Mock).mockResolvedValue(mockApiResponse({ total: 1 }));

            await UserApi.fetchCount('query');

            expect(mockedInstance.get).toHaveBeenCalledWith('/user/count', { params: { query: 'query' } });
        });

        it('deleteUser should delete a user by ID', async () => {
            (mockedInstance.delete as Mock).mockResolvedValue(mockApiResponse(null));

            await UserApi.deleteUser(1);

            expect(mockedInstance.delete).toHaveBeenCalledWith('/user/1');
        });

        it('updateUser should update a user by ID', async () => {
            (mockedInstance.put as Mock).mockResolvedValue(mockApiResponse(mockUser));

            await UserApi.updateUser(1, mockUser);

            expect(mockedInstance.put).toHaveBeenCalledWith('/user/1', mockUser);
        });

        it('createUser should create a new user', async () => {
            (mockedInstance.post as Mock).mockResolvedValue(mockApiResponse(mockUser));

            await UserApi.createUser(mockUser);

            expect(mockedInstance.post).toHaveBeenCalledWith('/user', mockUser);
        });
    });

    // --- ConfigApi Tests ---
    describe('ConfigApi', () => {
        const mockConfig = { key: 'testKey', value: 'testValue' };
        const mockApiResponse = (data: any) => ({ data: { data, success: true, message: '' } });

        it('fetchConfig should fetch all configurations', async () => {
            (mockedInstance.get as Mock).mockResolvedValue(mockApiResponse([mockConfig]));

            const result = await ConfigApi.fetchConfig();

            expect(mockedInstance.get).toHaveBeenCalledWith('/config');
            expect(result).toEqual({ data: [mockConfig], success: true, message: '' });
        });

        it('fetchConfig should handle errors', async () => {
            const error = new Error('Fetch config failed');
            (mockedInstance.get as Mock).mockRejectedValue(error);

            await expect(ConfigApi.fetchConfig()).rejects.toThrow('Fetch config failed');
            expect(mockedLogger.error).toHaveBeenCalledWith('Fetch config error:', error);
        });

        it('updateConfig should update a configuration', async () => {
            (mockedInstance.post as Mock).mockResolvedValue(mockApiResponse('Success'));

            await ConfigApi.updateConfig(mockConfig);

            expect(mockedInstance.post).toHaveBeenCalledWith('/config', mockConfig);
        });

        it('updateConfig should handle errors', async () => {
            const error = new Error('Update config failed');
            (mockedInstance.post as Mock).mockRejectedValue(error);

            await expect(ConfigApi.updateConfig(mockConfig)).rejects.toThrow('Update config failed');
            expect(mockedLogger.error).toHaveBeenCalledWith('Update config error:', error);
        });

        it('fetchConfigByKey should fetch a configuration by key', async () => {
            (mockedInstance.get as Mock).mockResolvedValue(mockApiResponse('testValue'));

            await ConfigApi.fetchConfigByKey('testKey');

            expect(mockedInstance.get).toHaveBeenCalledWith('/config/testKey');
        });

        it('deleteConfigByKey should delete a configuration by key', async () => {
            (mockedInstance.delete as Mock).mockResolvedValue(mockApiResponse('Success'));

            await ConfigApi.deleteConfigByKey('testKey');

            expect(mockedInstance.delete).toHaveBeenCalledWith('/config/testKey');
        });
    });
});

describe('UserApi Parameterization', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('fetchAll should pass all parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await UserApi.fetchAll(100, 2, 'username', false, 'test_query');

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            '/user',
            expect.objectContaining({
                params: {
                    pageSize: 100,
                    pageNumber: 2,
                    sortBy: 'Username',
                    ascending: false,
                    query: 'test_query',
                },
            })
        );
    });

    it('fetchAll should use default parameters', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await UserApi.fetchAll();

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            '/user',
            expect.objectContaining({
                params: {
                    pageSize: 10,
                    pageNumber: 1,
                    sortBy: 'Id',
                    ascending: true,
                    query: null,
                },
            })
        );
    });

    it('fetchCount should pass parameters correctly', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await UserApi.fetchCount('test_query');

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            '/user/count',
            expect.objectContaining({
                params: {
                    query: 'test_query',
                },
            })
        );
    });

    it('fetchCount should handle null query', async () => {
        (mockedInstance.get as Mock).mockResolvedValue({ data: {} });

        await UserApi.fetchCount();

        expect((mockedInstance.get as Mock)).toHaveBeenCalledWith(
            '/user/count',
            expect.objectContaining({
                params: {
                    query: null,
                },
            })
        );
    });
});