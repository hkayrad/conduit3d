import { Pencil, Trash2 } from "lucide-react";
import "./style/admin.css";
import { useCallback, useEffect, useState } from "react";
import type { TableData, User, UserCountsDto, UserSortBy } from "../../../lib/types";
import { AuthApi } from "../../../lib/api";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../lib/hooks";
import { selectAdminState, setItemsPerPage, setPageNumber, setSortBy, setAscending } from "./adminSlice";
import Table from "../../shared/table/Table";
import Badge from "../../shared/badge/Badge";
import { capitalizeFirstLetter } from "../../../lib/utils";
import ActionButton from "../../shared/actionButton/ActionButton";
import Stats from "./components/Stats";
import { selectUserState, setUser } from "../auth/authSlice";
import Modal from "../../shared/modal/Modal";
import UserActionModalContent from "./components/UserModalContent";
import UserDeleteModalContent from "./components/UserDeleteModalContent";

export default function Admin() {
    const dispatch = useDispatch();
    const { itemsPerPage, pageNumber, sortBy, ascending } = useAppSelector(selectAdminState)
    const currentUser = useAppSelector(selectUserState)

    const [users, setUsers] = useState<User[]>([]);
    const [tableData, setTableData] = useState<TableData>({
        headers: [],
        rows: []
    });
    const [userCounts, setUserCounts] = useState<UserCountsDto>({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });
    const [editingUser, setEditingUser] = useState<User>({} as User);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newUser, setNewUser] = useState<User>({} as User);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [iseDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User>({} as User);
    const [query, setQuery] = useState<string>("");

    const handleFetchUsers = async (pageSize: number, pageNumber: number, sortBy: string, ascending: boolean, query: string) => {
        const response = await AuthApi.fetchAll(pageSize, pageNumber, sortBy, ascending, query);

        if (response.isSuccess) {
            setUsers(response.data);
            return;
        }

        setUsers([]);
    }

    const handleFetchUserCount = async () => {
        const response = await AuthApi.fetchCount();

        if (response.isSuccess) {
            setUserCounts(response.data);
        }
    }

    const handleDeleteUser = async (userId: number) => {
        const response = await AuthApi.deleteUser(userId);

        if (response.isSuccess) {
            await handleFetchUsers(itemsPerPage, pageNumber, sortBy, ascending, query);
            await handleFetchUserCount();
            setIsDeleteModalOpen(false);
            setUserToDelete({} as User);
            setErrorText("");
            return;
        }
    }

    const handleEditUser = async (updatedUser: User) => {
        const response = await AuthApi.updateUser(updatedUser.id, updatedUser) as any;

        if (response.isSuccess) {
            await handleFetchUsers(itemsPerPage, pageNumber, sortBy, ascending, query);
            await handleFetchUserCount();
            setIsEditModalOpen(false);
            setEditingUser({} as User);
            setErrorText("");
            return;
        }

        setErrorText(response.message)


    }

    const handleAddUser = async (newUser: User) => {
        const response = await AuthApi.createUser(newUser);

        if (response.isSuccess) {
            await handleFetchUsers(itemsPerPage, pageNumber, sortBy, ascending, query);
            await handleFetchUserCount();
            setIsAddModalOpen(false);
            setNewUser({} as User);
            setErrorText("");
            return;
        }

        setErrorText(response.message)
    }

    const handleEditUserButtonClick = useCallback((user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    }, []);

    const handleAddUserButtonClick = useCallback(() => {
        setIsAddModalOpen(true);
    }, []);

    const handleDeleteUserButtonClick = useCallback((user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setErrorText("");
        setIsEditModalOpen(false);
        setEditingUser({} as User);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setErrorText("");
        setIsAddModalOpen(false);
        setNewUser({} as User);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setErrorText("");
        setIsDeleteModalOpen(false);
        setUserToDelete({} as User);
    }, []);

    const formatData = useCallback(() => {
        const headers = [
            {
                id: "id",
                label: "Id"
            },
            {
                id: "username",
                label: "Username"
            },
            {
                id: "name",
                label: "Name"
            },
            {
                id: "email",
                label: "Email"
            },
            {
                id: "userRole",
                label: "Role"
            },
            {
                id: "isActive",
                label: "Status"
            },
            {
                id: "createdAt",
                label: "Created At"
            },
            {
                id: "actions",
                label: "Actions"
            }
        ];
        const rows = users.map((user) => [
            user.id,
            user.username,
            user.name,
            user.email,
            <Badge
                color={user.userRole === "admin" ? "success" : "warning"}
                label={capitalizeFirstLetter(user.userRole)} />,
            <Badge
                color={user.isActive ? "success" : "error"}
                label={user.isActive ? "Active" : "Inactive"} />,
            <p className="created-at">{new Date(user.createdAt).toDateString()}</p>,
            <div className="action-button-wrapper">
                <ActionButton
                    content={<Pencil />}
                    style="warning"
                    onClick={() => { handleEditUserButtonClick(user) }}
                />
                <ActionButton
                    content={<Trash2 />}
                    style="error"
                    disabled={user.id === currentUser?.id}
                    onClick={() => handleDeleteUserButtonClick(user)}
                />
            </div>
        ]);
        setTableData({ headers, rows });
    }, [users]);

    const handleChangeItemsPerPage = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        dispatch(setItemsPerPage(newItemsPerPage));
    }, []);

    const handleSetPageNumber = useCallback((newPageNumber: number) => {
        dispatch(setPageNumber(newPageNumber));
    }, []);

    const handleSetSortBy = useCallback((newSortBy: string) => {
        dispatch(setSortBy(newSortBy as UserSortBy));
    }, []);

    const handleSetAscending = useCallback((newSortOrder: boolean) => {
        dispatch(setAscending(newSortOrder));
    }, []);

    const handleRefreshData = useCallback(() => {
        handleFetchUsers(itemsPerPage, pageNumber, sortBy, ascending, query);
        handleFetchUserCount();
    }, [handleFetchUsers, handleFetchUserCount]);

    useEffect(() => {
        handleRefreshData();
    }, [itemsPerPage, pageNumber, sortBy, ascending]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleRefreshData();
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    useEffect(() => {
        formatData();
    }, [users])

    return <div id="admin-page">
        <Stats userCounts={userCounts} />
        <Table
            tableName="User Management"
            pageNumber={pageNumber}
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            ascending={ascending}
            query={query}
            setQuery={setQuery}
            setPageNumber={handleSetPageNumber}
            setSortBy={handleSetSortBy}
            setAscending={handleSetAscending}
            setItemsPerPage={handleChangeItemsPerPage}
            onRefresh={handleRefreshData}
            onAddClick={handleAddUserButtonClick}
            data={tableData}
            totalDataCount={userCounts.totalUsers}
        />
        {isEditModalOpen && editingUser && (
            <Modal>
                <UserActionModalContent
                    user={editingUser}
                    setUser={setEditingUser}
                    handleSubmit={handleEditUser}
                    handleCloseModal={handleCloseEditModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}
        {isAddModalOpen && (
            <Modal>
                <UserActionModalContent
                    user={newUser}
                    setUser={setNewUser}
                    handleSubmit={handleAddUser}
                    handleCloseModal={handleCloseAddModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}
        {iseDeleteModalOpen &&
            <Modal>
                <UserDeleteModalContent
                    user={userToDelete}
                    handleDelete={handleDeleteUser}
                    handleCloseModal={handleCloseDeleteModal}
                />
            </Modal>}
    </div >
}