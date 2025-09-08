import "./style/admin.css";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminModalStatus, TableData, User, UserCounts, UserSortBy } from "../../../lib/types";
import { useDispatch } from "react-redux";
import { useAdmin, useAppSelector } from "../../../lib/hooks";
import { selectAdminState, setItemsPerPage, setPageNumber, setSortBy, setAscending } from "./adminSlice";
import Table from "../../shared/table/Table";
import Badge from "../../shared/badge/Badge";
import { capitalizeFirstLetter } from "../../../lib/utils";
import ActionButton from "../../shared/actionButton/ActionButton";
import Stats from "./components/Stats";
import { selectUserState } from "../auth/authSlice";
import Modal from "../../shared/modal/Modal";
import UserActionModalContent from "./components/UserAddEditModalContent";
import UserDeleteModalContent from "./components/UserDeleteModalContent";

/**
 * Admin component for user management.
 * @returns The Admin component for user management.
 */
export default function Admin() {
    const dispatch = useDispatch();
    const { itemsPerPage, pageNumber, sortBy, ascending } = useAppSelector(selectAdminState)
    const currentUser = useAppSelector(selectUserState)

    const [users, setUsers] = useState<User[]>([]);
    const [tableData, setTableData] = useState<TableData>({
        headers: [],
        rows: []
    });
    const [userCounts, setUserCounts] = useState<UserCounts>({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });

    const [errorText, setErrorText] = useState("");
    const [query, setQuery] = useState<string>("");

    const [userToAddModify, setUserToAddModify] = useState<User>({} as User);
    const [modalStatus, setModalStatus] = useState<AdminModalStatus>({
        isEditModalOpen: false,
        isAddModalOpen: false,
        isDeleteModalOpen: false
    });

    const {
        handleFetchUsers,
        handleFetchUserCount,
        handleAddUser,
        handleDeleteUser,
        handleEditUser,
        handleCloseModal,
        handleEditUserButtonClick,
        handleAddUserButtonClick,
        handleDeleteUserButtonClick
    } = useAdmin(
        itemsPerPage,
        pageNumber,
        sortBy,
        ascending,
        query,
        setUsers,
        setUserCounts,
        setErrorText,
        setUserToAddModify,
        setModalStatus
    );

    const formatData = useCallback((): void => {
        const headers = [
            { id: 'index', label: '#' },
            { id: "id", label: "Id" },
            { id: "username", label: "Username" },
            { id: "name", label: "Name" },
            { id: "email", label: "Email" },
            { id: "userRole", label: "Role" },
            { id: "isActive", label: "Status" },
            { id: "createdAt", label: "Created At" },
            { id: "actions", label: "Actions" }
        ];
        const rows = users.map((user, index) => [
            index + 1,
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
            <p className="created-at">{new Date(user.createdAt).toLocaleString()}</p>,
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

    const handleChangeItemsPerPage = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newItemsPerPage = parseInt(e.target.value);
        dispatch(setItemsPerPage(newItemsPerPage));
    }, []);

    const handleSetPageNumber = useCallback((newPageNumber: number): void => {
        dispatch(setPageNumber(newPageNumber));
    }, []);

    const handleSetSortBy = useCallback((newSortBy: string): void => {
        dispatch(setSortBy(newSortBy as UserSortBy));
    }, []);

    const handleSetAscending = useCallback((newSortOrder: boolean): void => {
        dispatch(setAscending(newSortOrder));
    }, []);

    const handleRefreshData = useCallback((): void => {
        handleFetchUsers();
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
        {modalStatus.isEditModalOpen && userToAddModify && (
            <Modal>
                <UserActionModalContent
                    user={userToAddModify}
                    setUser={setUserToAddModify}
                    handleSubmit={handleEditUser}
                    handleCloseModal={handleCloseModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}
        {modalStatus.isAddModalOpen && (
            <Modal>
                <UserActionModalContent
                    user={userToAddModify}
                    setUser={setUserToAddModify}
                    handleSubmit={handleAddUser}
                    handleCloseModal={handleCloseModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}
        {modalStatus.isDeleteModalOpen && userToAddModify &&
            <Modal>
                <UserDeleteModalContent
                    user={userToAddModify}
                    handleDelete={handleDeleteUser}
                    handleCloseModal={handleCloseModal}
                />
            </Modal>}
    </div >
}