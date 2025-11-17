import { useCallback, useState } from "react";
import { UserApi } from "../api";
import type { AdminModalStatus, ApiResponse, TableData, User, UserCounts, UserSortBy } from "../types";
import { AdminModalType } from "../enums";
import {
	selectAdminState,
	setAscending,
	setItemsPerPage,
	setPageNumber,
	setQuery,
	setSortBy,
} from "../../app/layout/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { Logger, InputSanitizer } from "../utils";

/**
 * Returns admin related functions and handlers.
 * @returns Admin related functions and handlers
 */
export function useAdmin() {
	const dispatch = useAppDispatch();
	const { itemsPerPage, pageNumber, sortBy, ascending, query } = useAppSelector(selectAdminState);
	const sanitizedQuery = InputSanitizer.sanitizeSearchQuery(query);

	const [users, setUsers] = useState<User[]>([]);
	const [tableData, setTableData] = useState<TableData>({
		headers: [],
		rows: [],
	});
	const [userCounts, setUserCounts] = useState<UserCounts>({
		totalUsers: 0,
		activeUsers: 0,
		inactiveUsers: 0,
	});
	const [errorText, setErrorText] = useState("");
	const [userToAddModify, setUserToAddModify] = useState<User>({} as User);
	const [modalStatus, setModalStatus] = useState<AdminModalStatus>({
		isEditModalOpen: false,
		isAddModalOpen: false,
		isDeleteModalOpen: false,
	});

	/**
	 * Fetch all users with the given parameters and update the users state.
	 * @returns void
	 */
	const handleFetchUsers = useCallback(async () => {
		try {
			const [dataResponse, countResponse] = await Promise.all([
				UserApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, sanitizedQuery),
				UserApi.fetchCount(sanitizedQuery),
			]);

			if (!dataResponse.isSuccess || !countResponse.isSuccess) {
				setUsers([]);
				setUserCounts({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
				return;
			}

			setUsers(dataResponse.data);
			setUserCounts(countResponse.data);
		} catch (error) {
			Logger.error("Error fetching users:", error);
			setUsers([]);
			setUserCounts({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
			setErrorText("An error occurred while fetching users.");
		}
	}, [itemsPerPage, pageNumber, sortBy, ascending, sanitizedQuery]);

	/**
	 * Close any open modal and reset relevant states.
	 * @returns void
	 */
	const handleCloseModal = useCallback(() => {
		setErrorText("");

		setModalStatus({
			isEditModalOpen: false,
			isAddModalOpen: false,
			isDeleteModalOpen: false,
		});

		setUserToAddModify({} as User);
	}, []);

	/**
	 * Delete a user by ID.
	 * @param userId ID of the user to delete
	 * @returns void
	 */
	const handleDeleteUser = useCallback(
		async (userId: number) => {
			try {
				const response = (await UserApi.deleteUser(userId)) as ApiResponse<any>;

				if (!response.isSuccess) {
					// Parse and display the first error message
					const errors = Object.values(response.data || {}).flat();
					setErrorText((errors[0] as string) || response.message);
					return;
				}

				await handleFetchUsers();
				handleCloseModal();
				setUserToAddModify({} as User);
				setErrorText("");
			} catch (error) {
				Logger.error("Error deleting user:", error);
				setErrorText("An error occurred while deleting the user.");
			}
		},
		[handleFetchUsers, handleCloseModal, setUserToAddModify, setErrorText],
	);

	/**
	 * Edit a user by ID.
	 * @param updatedUser The user object with updated information.
	 * @returns void
	 */
	const handleEditUser = useCallback(
		async (updatedUser: User) => {
			try {
				const response = (await UserApi.updateUser(updatedUser.id, updatedUser)) as ApiResponse<any>;

				if (!response.isSuccess) {
					// Parse and display the first error message
					const errors = Object.values(response.data || {}).flat();
					setErrorText((errors[0] as string) || response.message);
					return;
				}

				await handleFetchUsers();
				handleCloseModal();
				setUserToAddModify({} as User);
				setErrorText("");
			} catch (error) {
				Logger.error("Error editing user:", error);
				setErrorText("An error occurred while editing the user.");
			}
		},
		[handleFetchUsers, handleCloseModal, setUserToAddModify, setErrorText],
	);

	/**
	 * Add a new user.
	 * @param newUser The new user object to add.
	 * @returns void
	 */
	const handleAddUser = useCallback(
		async (newUser: User) => {
			try {
				const response = (await UserApi.createUser(newUser)) as ApiResponse<any>;

				if (!response.isSuccess) {
					// Parse and display the first error message
					const errors = Object.values(response.data || {}).flat();
					setErrorText((errors[0] as string) || response.message);
					return;
				}

				await handleFetchUsers();
				handleCloseModal();
				setUserToAddModify({} as User);
				setErrorText("");
			} catch (error) {
				Logger.error("Error adding user:", error);
				setErrorText("An error occurred while adding the user.");
			}
		},
		[handleFetchUsers, handleCloseModal, setUserToAddModify, setErrorText],
	);

	/**
	 * Open a specific modal and set the user to add/modify if provided.
	 * @param type The type of modal to open (Edit, Add, Delete)
	 * @param user Optional user object to set for editing or deleting
	 * @returns void
	 */
	const handleOpenModal = useCallback((type: AdminModalType, user?: User) => {
		if (user) {
			setUserToAddModify(user);
		}

		setModalStatus({
			isEditModalOpen: type === AdminModalType.Edit,
			isAddModalOpen: type === AdminModalType.Add,
			isDeleteModalOpen: type === AdminModalType.Delete,
		});
	}, []);

	/**
	 * Handle the click event for editing a user.
	 * @param user The user to edit
	 * @returns void
	 */
	const handleEditUserButtonClick = useCallback(
		(user: User) => {
			setUserToAddModify(user);
			handleOpenModal(AdminModalType.Edit, user);
		},
		[handleOpenModal],
	);

	/**
	 * Handle the click event for adding a new user.
	 * @returns void
	 */
	const handleAddUserButtonClick = useCallback(() => {
		setUserToAddModify({} as User);
		handleOpenModal(AdminModalType.Add);
	}, [handleOpenModal]);

	/**
	 * Handle the click event for deleting a user.
	 * @param user The user to delete
	 * @returns void
	 */
	const handleDeleteUserButtonClick = useCallback(
		(user: User) => {
			setUserToAddModify(user);
			handleOpenModal(AdminModalType.Delete, user);
		},
		[handleOpenModal],
	);

	/**
	 * Handle setting page number.
	 * @param newPageNumber The new page number to set
	 * @returns void
	 */
	const handleSetPageNumber = useCallback(
		(newPageNumber: number): void => {
			dispatch(setPageNumber(newPageNumber));
		},
		[dispatch],
	);

	/**
	 * Handle change in items per page.
	 * @param e The change event from the select element
	 * @returns void
	 */
	const handleChangeItemsPerPage = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>): void => {
			const newItemsPerPage = Number.parseInt(e.target.value);
			dispatch(setItemsPerPage(newItemsPerPage));
			handleSetPageNumber(1); // Reset to first page on items per page change
		},
		[handleSetPageNumber, dispatch],
	);

	/**
	 * Handle setting sort by field.
	 * @param newSortBy The new field to sort by
	 * @returns void
	 */
	const handleSetSortBy = useCallback(
		(newSortBy: string): void => {
			dispatch(setSortBy(newSortBy as UserSortBy));
		},
		[dispatch],
	);

	/**
	 * Handle setting sort order.
	 * @param newSortOrder The new sort order (true for ascending, false for descending)
	 * @returns void
	 */
	const handleSetAscending = useCallback(
		(newSortOrder: boolean): void => {
			dispatch(setAscending(newSortOrder));
		},
		[dispatch],
	);

	/**
	 * Handle setting query.
	 * @param newQuery The new search query to set
	 * @returns void
	 */
	const handleSetQuery = useCallback(
		(newQuery: string): void => {
			dispatch(setQuery(newQuery));
		},
		[dispatch],
	);

	/**
	 * Refresh data by fetching users and user count again.
	 * @returns void
	 */
	const handleRefreshData = useCallback((): void => {
		handleFetchUsers();
	}, [handleFetchUsers]);

	return {
		users,
		tableData,
		setTableData,
		userCounts,
		errorText,
		userToAddModify,
		setUserToAddModify,
		modalStatus,
		setModalStatus,
		handleFetchUsers,
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
		handleRefreshData,
	};
}
