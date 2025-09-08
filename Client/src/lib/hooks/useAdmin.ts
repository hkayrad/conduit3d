import { useCallback } from "react";
import { AuthApi } from "../api";
import type { AdminModalStatus, User, UserCounts, UserSortBy } from "../types";
import { AdminModalType } from "../enums";
import { setAscending, setItemsPerPage, setPageNumber, setQuery, setSortBy } from "../../app/layout/admin/adminSlice";
import { useDispatch } from "react-redux";

/**
 * Returns admin related functions and handlers.
 * @param itemsPerPage Page size of the current user fetch
 * @param pageNumber Current page number
 * @param sortBy Field to sort by
 * @param ascending Sort order
 * @param query Search query
 * @param setUsers Function to set users
 * @param setUserCounts Function to set user counts
 * @param setErrorText Function to set error text
 * @param setUserToAddModify Function to set user to add/modify
 * @param setModalStatus Function to set modal status
 * @returns Admin related functions and handlers
 */
export function useAdmin(
    itemsPerPage: number,
    pageNumber: number,
    sortBy: string,
    ascending: boolean,
    query: string,
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setUserCounts: React.Dispatch<React.SetStateAction<UserCounts>>,
    setErrorText: React.Dispatch<React.SetStateAction<string>>,
    setUserToAddModify: React.Dispatch<React.SetStateAction<User>>,
    setModalStatus: React.Dispatch<React.SetStateAction<AdminModalStatus>>,
) {
    const dispatch = useDispatch();

    /**
     * Fetch all users with the given parameters and update the users state.
     * @returns void
     */
    const handleFetchUsers = async () => {
        const response = await AuthApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query);

        if (!response.isSuccess) {
            setUsers([]);
            return;
        }

        setUsers(response.data);
    }

    /**
     * Fetch the total user count based on the current query.
     * @returns void
     */
    const handleFetchUserCount = async () => {
        const response = await AuthApi.fetchCount(query);

        if (!response.isSuccess) {
            setUserCounts({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
            return;
        }

        setUserCounts(response.data);
    }

    /**
     * Delete a user by ID.
     * @param userId ID of the user to delete
     * @returns void
     */
    const handleDeleteUser = async (userId: number) => {
        const response = await AuthApi.deleteUser(userId);

        if (!response.isSuccess) {
            setErrorText(response.message);
            return;
        }

        await handleFetchUsers();
        await handleFetchUserCount();
        handleCloseModal();
        setUserToAddModify({} as User);
        setErrorText("");
    }

    /**
     * Edit a user by ID.
     * @param updatedUser The user object with updated information.
     * @returns void
     */
    const handleEditUser = async (updatedUser: User) => {
        const response = await AuthApi.updateUser(updatedUser.id, updatedUser) as any;

        if (!response.isSuccess) {
            setErrorText(response.message)
            return;
        }

        await handleFetchUsers();
        await handleFetchUserCount();
        handleCloseModal();
        setUserToAddModify({} as User);
        setErrorText("");
    }

    /**
     * Add a new user.
     * @param newUser The new user object to add.
     * @returns void
     */
    const handleAddUser = async (newUser: User) => {
        const response = await AuthApi.createUser(newUser);

        if (!response.isSuccess) {
            setErrorText(response.message)
            return;
        }

        await handleFetchUsers();
        await handleFetchUserCount();
        handleCloseModal();
        setUserToAddModify({} as User);
        setErrorText("");
    }

    /**
     * Close any open modal and reset relevant states.
     * @returns void
     */
    const handleCloseModal = useCallback(() => {
        setErrorText("");

        setModalStatus({
            isEditModalOpen: false,
            isAddModalOpen: false,
            isDeleteModalOpen: false
        });

        setUserToAddModify({} as User);
    }, []);

    /**
     * Open a specific modal and set the user to add/modify if provided.
     * @param type The type of modal to open (Edit, Add, Delete)
     * @param user Optional user object to set for editing or deleting
     * @returns void
     */
    const handleOpenModal = useCallback((type: AdminModalType, user?: User) => {
        setErrorText("");

        setModalStatus({
            isEditModalOpen: type === AdminModalType.Edit,
            isAddModalOpen: type === AdminModalType.Add,
            isDeleteModalOpen: type === AdminModalType.Delete
        });

        if (user) {
            setUserToAddModify(user);
        }
    }, []);

    /**
     * Handle the click event for editing a user.
     * @param user The user to edit
     * @returns void
     */
    const handleEditUserButtonClick = useCallback((user: User) => {
        setUserToAddModify(user);
        handleOpenModal(AdminModalType.Edit, user);
    }, []);

    /**
     * Handle the click event for adding a new user.
     * @returns void
     */
    const handleAddUserButtonClick = useCallback(() => {
        setUserToAddModify({} as User);
        handleOpenModal(AdminModalType.Add);
    }, []);

    /**
     * Handle the click event for deleting a user.
     * @param user The user to delete
     * @returns void
     */
    const handleDeleteUserButtonClick = useCallback((user: User) => {
        setUserToAddModify(user);
        handleOpenModal(AdminModalType.Delete, user);
    }, []);

    /**
     * Handle change in items per page.
     * @param e The change event from the select element
     * @returns void
     */
    const handleChangeItemsPerPage = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newItemsPerPage = parseInt(e.target.value);
        dispatch(setItemsPerPage(newItemsPerPage));
        dispatch(setPageNumber(1)); // Reset to first page on items per page change
    }, []);

    /**
     * Handle setting page number.
     * @param newPageNumber The new page number to set
     * @returns void
     */
    const handleSetPageNumber = useCallback((newPageNumber: number): void => {
        dispatch(setPageNumber(newPageNumber));
    }, []);

    /**
     * Handle setting sort by field.
     * @param newSortBy The new field to sort by
     * @returns void
     */
    const handleSetSortBy = useCallback((newSortBy: string): void => {
        dispatch(setSortBy(newSortBy as UserSortBy));
    }, []);

    /**
     * Handle setting sort order.
     * @param newSortOrder The new sort order (true for ascending, false for descending)
     * @returns void
     */
    const handleSetAscending = useCallback((newSortOrder: boolean): void => {
        dispatch(setAscending(newSortOrder));
    }, []);

    /**
     * Handle setting query.
     * @param newQuery The new search query to set
     * @returns void
     */
    const handleSetQuery = useCallback((newQuery: string): void => {
        dispatch(setQuery(newQuery));
    }, []);

    /**
     * Refresh data by fetching users and user count again.
     * @returns void
     */
    const handleRefreshData = useCallback((): void => {
        handleFetchUsers();
        handleFetchUserCount();
    }, [handleFetchUsers, handleFetchUserCount]);

    return {
        handleFetchUsers,
        handleFetchUserCount,
        handleAddUser,
        handleDeleteUser,
        handleEditUser,
        handleOpenModal,
        handleCloseModal,
        handleEditUserButtonClick,
        handleAddUserButtonClick,
        handleDeleteUserButtonClick,
        handleChangeItemsPerPage,
        handleSetPageNumber,
        handleSetSortBy,
        handleSetAscending,
        handleSetQuery,
        handleRefreshData
    };
}
