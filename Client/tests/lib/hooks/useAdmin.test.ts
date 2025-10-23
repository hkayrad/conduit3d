const mockDispatch = vi.fn();

vi.mock('../../../src/lib/hooks/reduxHooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(() => mockDispatch),
}));
vi.mock('../../../src/app/layout/admin/adminSlice', () => ({
    adminSlice: {
        name: 'admin',
        initialState: {
            itemsPerPage: 10,
            pageNumber: 1,
            sortBy: 'id',
            ascending: true,
            query: '',
        },
        reducers: {}
    },
    selectAdminState: vi.fn(() => ({
        itemsPerPage: 10,
        pageNumber: 1,
        sortBy: 'id',
        ascending: true,
        query: '',
    }),),
    setItemsPerPage: vi.fn((payload) => ({ type: 'admin/setItemsPerPage', payload })),
    setPageNumber: vi.fn((payload) => ({ type: 'admin/setPageNumber', payload })),
    setSortBy: vi.fn((payload) => ({ type: 'admin/setSortBy', payload })),
    setAscending: vi.fn((payload) => ({ type: 'admin/setAscending', payload })),
    setQuery: vi.fn((payload) => ({ type: 'admin/setQuery', payload })),
}));

// Mock API calls
vi.mock('../../../src/lib/api/user', () => ({
    UserApi: {
        fetchAll: vi.fn() as Mock,
        fetchCount: vi.fn() as Mock,
        deleteUser: vi.fn() as Mock,
        updateUser: vi.fn() as Mock,
        createUser: vi.fn() as Mock,
    },
}));

// Mock utility functions
vi.mock('../../../src/lib/utils', () => ({
    Logger: {
        error: vi.fn(),
    },
    InputSanitizer: {
        sanitizeSearchQuery: vi.fn((query) => query), // Simple pass-through for tests
    },
}));

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdmin } from '../../../src/lib/hooks/useAdmin';
import * as reduxHooks from '../../../src/lib/hooks/reduxHooks';
import * as UserApi from '../../../src/lib/api/user';
import * as adminSlice from '../../../src/app/layout/admin/adminSlice';
import * as utils from '../../../src/lib/utils';
import { AdminModalType } from '../../../src/lib/enums';
import { User } from '../../../src/lib/types';

// Mock Redux hooks and selectors
const mockAdminState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: 'id',
    ascending: true,
    query: '',
};

describe('useAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set default mock return values for useAppSelector
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === adminSlice.selectAdminState) {
                return mockAdminState;
            }
            return undefined;
        });

        // Default successful API responses
        vi.mocked(UserApi.UserApi.fetchAll).mockResolvedValue({
            isSuccess: true,
            data: [],
            message: '',
            statusCode: 200,
        });
        vi.mocked(UserApi.UserApi.fetchCount).mockResolvedValue({
            isSuccess: true,
            data: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
            message: '',
            statusCode: 200,
        });
        vi.mocked(UserApi.UserApi.deleteUser).mockResolvedValue({
            isSuccess: true,
            data: null!,
            message: '',
            statusCode: 200,
        });
        vi.mocked(UserApi.UserApi.updateUser).mockResolvedValue({
            isSuccess: true,
            data: null!,
            message: '',
            statusCode: 200,
        });
        vi.mocked(UserApi.UserApi.createUser).mockResolvedValue({
            isSuccess: true,
            data: null!,
            message: '',
            statusCode: 200,
        });
    });

    it('should return initial state and functions', () => {
        const { result } = renderHook(() => useAdmin());

        expect(result.current.users).toEqual([]);
        expect(result.current.tableData).toEqual({ headers: [], rows: [] });
        expect(result.current.userCounts).toEqual({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
        expect(result.current.errorText).toBe('');
        expect(result.current.userToAddModify).toEqual({});
        expect(result.current.modalStatus).toEqual({
            isEditModalOpen: false,
            isAddModalOpen: false,
            isDeleteModalOpen: false,
        });
        expect(typeof result.current.handleFetchUsers).toBe('function');
        // ... check other functions
    });

    it('should sanitize query using InputSanitizer', () => {
        vi.mocked(reduxHooks.useAppSelector).mockReturnValue({ ...mockAdminState, query: 'test query' });
        renderHook(() => useAdmin());
        expect(utils.InputSanitizer.sanitizeSearchQuery).toHaveBeenCalledWith('test query');
    });

    describe('handleFetchUsers', () => {
        it('should fetch users and counts successfully', async () => {
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            const mockUsers: User[] = [{ id: 1, username: 'test', email: 'test@example.com' } as User];
            const mockCounts = { totalUsers: 1, activeUsers: 1, inactiveUsers: 0 };
            (UserApi.UserApi.fetchAll as Mock).mockResolvedValue({ isSuccess: true, data: mockUsers, message: '' });
            (UserApi.UserApi.fetchCount as Mock).mockResolvedValue({ isSuccess: true, data: mockCounts, message: '' });

            const { result } = renderHook(() => useAdmin());

            await act(async () => {
                await result.current.handleFetchUsers();
            });

            expect(result.current.users).toEqual(mockUsers);
            expect(result.current.userCounts).toEqual(mockCounts);
            expect(UserApi.UserApi.fetchAll).toHaveBeenCalledWith(
                mockAdminState.itemsPerPage,
                mockAdminState.pageNumber,
                mockAdminState.sortBy,
                mockAdminState.ascending,
                mockAdminState.query
            );
            expect(UserApi.UserApi.fetchCount).toHaveBeenCalledWith(mockAdminState.query);
        });

        it('should handle API fetchAll failure', async () => {
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            (UserApi.UserApi.fetchAll as Mock).mockResolvedValue({ isSuccess: false, data: [], message: 'Error fetching' });

            const { result } = renderHook(() => useAdmin());

            await act(async () => {
                await result.current.handleFetchUsers();
            });

            expect(result.current.users).toEqual([]);
            expect(result.current.userCounts).toEqual({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
            expect(result.current.errorText).toBe(''); // Error text is not set for fetch failures, only network errors
        });

        it('should handle network errors during fetch', async () => {
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            const error = new Error('Network Error');
            (UserApi.UserApi.fetchAll as Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useAdmin());

            await act(async () => {
                await result.current.handleFetchUsers();
            });

            expect(result.current.users).toEqual([]);
            expect(result.current.userCounts).toEqual({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
            expect(result.current.errorText).toBe('An error occurred while fetching users.');
            expect(utils.Logger.error).toHaveBeenCalledWith('Error fetching users:', error);
        });
    });

    describe('CRUD operations', () => {
        const mockUser: User = { id: 1, username: 'test', email: 'test@example.com' } as User;

        it('handleDeleteUser should delete user and refresh data on success', async () => {
            const { result } = renderHook(() => useAdmin());
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            await act(async () => {
                await result.current.handleDeleteUser(mockUser.id);
            });

            expect(UserApi.UserApi.deleteUser).toHaveBeenCalledWith(mockUser.id);
            // Check that data is refreshed
            expect(UserApi.UserApi.fetchAll).toHaveBeenCalledTimes(1);
            expect(UserApi.UserApi.fetchCount).toHaveBeenCalledTimes(1);
            expect(result.current.errorText).toBe('');
            expect(result.current.userToAddModify).toEqual({});
        });

        it('handleDeleteUser should set error text on API failure', async () => {
            (UserApi.UserApi.deleteUser as Mock).mockResolvedValue({ isSuccess: false, data: { error: ['User not found'] }, message: 'Failed' });

            const { result } = renderHook(() => useAdmin());

            await act(async () => {
                await result.current.handleDeleteUser(mockUser.id);
            });

            expect(result.current.errorText).toBe('User not found');
            expect(result.current.userToAddModify).toEqual({});
        });

        it('handleEditUser should update user and refresh data on success', async () => {
            const { result } = renderHook(() => useAdmin());
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            await act(async () => {
                await result.current.handleEditUser(mockUser);
            });

            expect(UserApi.UserApi.updateUser).toHaveBeenCalledWith(mockUser.id, mockUser); // Corrected to use mockUser.id
            // Check that data is refreshed
            expect(UserApi.UserApi.fetchAll).toHaveBeenCalledTimes(1);
            expect(UserApi.UserApi.fetchCount).toHaveBeenCalledTimes(1);
            expect(result.current.errorText).toBe('');
            expect(result.current.userToAddModify).toEqual({});
        });

        it('handleAddUser should create user and refresh data on success', async () => {
            const { result } = renderHook(() => useAdmin());
            // Clear initial fetch from useEffect
            vi.clearAllMocks();

            await act(async () => {
                await result.current.handleAddUser(mockUser);
            });

            expect(UserApi.UserApi.createUser).toHaveBeenCalledWith(mockUser);
            // Check that data is refreshed
            expect(UserApi.UserApi.fetchAll).toHaveBeenCalledTimes(1);
            expect(UserApi.UserApi.fetchCount).toHaveBeenCalledTimes(1);
            expect(result.current.errorText).toBe('');
            expect(result.current.userToAddModify).toEqual({});
        });
    });

    describe('Modal handlers', () => {
        const mockUser: User = { id: 1, username: 'test', email: 'test@example.com' } as User;

        it('handleOpenModal should open the correct modal and set userToAddModify', () => {
            const { result } = renderHook(() => useAdmin());

            act(() => {
                result.current.handleOpenModal(AdminModalType.Edit, mockUser);
            });
            expect(result.current.modalStatus).toEqual({
                isEditModalOpen: true,
                isAddModalOpen: false,
                isDeleteModalOpen: false,
            });
            expect(result.current.userToAddModify).toEqual(mockUser);

            act(() => {
                result.current.handleOpenModal(AdminModalType.Add);
            });
            expect(result.current.modalStatus).toEqual({
                isEditModalOpen: false,
                isAddModalOpen: true,
                isDeleteModalOpen: false,
            });
            expect(result.current.userToAddModify).toEqual(mockUser); // userToAddModify is not reset if not provided
            expect(result.current.userToAddModify).toEqual(mockUser); // userToAddModify is not reset on open if not provided
        });

        it('handleCloseModal should close all modals and reset userToAddModify and errorText', () => {
            const { result } = renderHook(() => useAdmin());

            act(() => {
                result.current.handleOpenModal(AdminModalType.Edit, mockUser);
            });
            expect(result.current.modalStatus.isEditModalOpen).toBe(true);
            expect(result.current.userToAddModify).toEqual(mockUser);

            act(() => {
                result.current.handleCloseModal();
            });
            expect(result.current.modalStatus).toEqual({
                isEditModalOpen: false,
                isAddModalOpen: false,
                isDeleteModalOpen: false,
            });
            expect(result.current.userToAddModify).toEqual({});
            expect(result.current.errorText).toBe('');
        });

        it('handleEditUserButtonClick should open edit modal and set user', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleEditUserButtonClick(mockUser);
            });
            expect(result.current.modalStatus.isEditModalOpen).toBe(true);
            expect(result.current.modalStatus.isEditModalOpen).toBe(true); // handleEditUserButtonClick now calls handleOpenModal
            expect(result.current.userToAddModify).toEqual(mockUser);
        });

        it('handleAddUserButtonClick should open add modal and clear user', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleAddUserButtonClick();
            });
            expect(result.current.modalStatus.isAddModalOpen).toBe(true);
            expect(result.current.userToAddModify).toEqual({});
        });

        it('handleDeleteUserButtonClick should open delete modal and set user', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleDeleteUserButtonClick(mockUser);
            });
            expect(result.current.modalStatus.isDeleteModalOpen).toBe(true);
            expect(result.current.modalStatus.isDeleteModalOpen).toBe(true); // handleDeleteUserButtonClick now calls handleOpenModal
            expect(result.current.userToAddModify).toEqual(mockUser);
        });
    });

    describe('Redux dispatch handlers', () => {
        it('handleChangeItemsPerPage should dispatch setItemsPerPage and setPageNumber', () => {
            const { result } = renderHook(() => useAdmin());
            const mockEvent = { target: { value: '20' } } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleChangeItemsPerPage(mockEvent);
            });

            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setItemsPerPage(20));
            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setPageNumber(1)); // Resets page to 1
        });

        it('handleSetPageNumber should dispatch setPageNumber', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleSetPageNumber(5);
            });
            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setPageNumber(5));
        });

        it('handleSetSortBy should dispatch setSortBy', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleSetSortBy('username');
            });
            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setSortBy('username'));
        });

        it('handleSetAscending should dispatch setAscending', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleSetAscending(false);
            });
            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setAscending(false));
        });

        it('handleSetQuery should dispatch setQuery', () => {
            const { result } = renderHook(() => useAdmin());
            act(() => {
                result.current.handleSetQuery('new query');
            });
            expect(mockDispatch).toHaveBeenCalledWith(adminSlice.setQuery('new query'));
        });
    });

    it('handleRefreshData should call handleFetchUsers', async () => {
        const { result } = renderHook(() => useAdmin());
        vi.clearAllMocks();

        await act(async () => {
            result.current.handleRefreshData();
        });

        expect(UserApi.UserApi.fetchAll).toHaveBeenCalledTimes(1);
        expect(UserApi.UserApi.fetchCount).toHaveBeenCalledTimes(1);
    });
});