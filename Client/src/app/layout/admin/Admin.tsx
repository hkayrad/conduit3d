import "./style/admin.css";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminModalStatus, TableData, User, UserCounts } from "../../../lib/types";
import { useAdmin, useAppSelector } from "../../../lib/hooks";
import { selectAdminState } from "./adminSlice";
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
    // Redux state
    const { itemsPerPage, pageNumber, sortBy, ascending, query } = useAppSelector(selectAdminState)
    const currentUser = useAppSelector(selectUserState)

    // Local state
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
    const [userToAddModify, setUserToAddModify] = useState<User>({} as User);
    const [modalStatus, setModalStatus] = useState<AdminModalStatus>({
        isEditModalOpen: false,
        isAddModalOpen: false,
        isDeleteModalOpen: false
    });

    // Admin hook
    const {
        handleAddUser,
        handleDeleteUser,
        handleEditUser,
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

    // Mamoized table headers
    const headers = useMemo(() => [
        { id: 'index', label: '#' },
        { id: "id", label: "Id" },
        { id: "username", label: "Username" },
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "userRole", label: "Role" },
        { id: "isActive", label: "Status" },
        { id: "createdAt", label: "Created At" },
        { id: "actions", label: "Actions" }
    ], []);

    // Mamoized table rows
    const rows = useMemo(() => users.map((user, index) => [
        index + 1,
        user.id,
        user.username,
        user.name,
        user.email,
        <Badge
            key={`role-${user.id}`}
            color={user.userRole === "admin" ? "success" : "warning"}
            label={capitalizeFirstLetter(user.userRole)} />,
        <Badge
            key={`status-${user.id}`}
            color={user.isActive ? "success" : "error"}
            label={user.isActive ? "Active" : "Inactive"} />,
        <p key={`created-at-${user.id}`} className="created-at">{new Date(user.createdAt).toLocaleString()}</p>,
        <div key={`actions-${user.id}`} className="action-button-wrapper">
            <ActionButton
                key={`edit-${user.id}`}
                content={<Pencil />}
                style="warning"
                onClick={() => { handleEditUserButtonClick(user) }}
            />
            <ActionButton
                key={`delete-${user.id}`}
                content={<Trash2 />}
                style="error"
                disabled={user.id === currentUser?.id}
                onClick={() => handleDeleteUserButtonClick(user)}
            />
        </div>
    ]), [users, currentUser]);

    // Effects
    useEffect(() => {
        handleRefreshData();
    }, [itemsPerPage, pageNumber, sortBy, ascending]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSetPageNumber(1);
            handleRefreshData();
        }, 250)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    useEffect(() => {
        setTableData({ headers, rows });
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
            setQuery={handleSetQuery}
            setPageNumber={handleSetPageNumber}
            setSortBy={handleSetSortBy}
            setAscending={handleSetAscending}
            setItemsPerPage={handleChangeItemsPerPage}
            onRefresh={handleRefreshData}
            onAddClick={handleAddUserButtonClick}
            data={tableData}
            totalDataCount={userCounts.totalUsers}
        />

        {/* Edit User Modal */}
        {modalStatus.isEditModalOpen && userToAddModify && (
            <Modal>
                <UserActionModalContent
                    title="Edit User"
                    user={userToAddModify}
                    setUser={setUserToAddModify}
                    handleSubmit={handleEditUser}
                    handleCloseModal={handleCloseModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}

        {/* Add User Modal */}
        {modalStatus.isAddModalOpen && (
            <Modal>
                <UserActionModalContent
                    title="Add User"
                    user={userToAddModify}
                    setUser={setUserToAddModify}
                    handleSubmit={handleAddUser}
                    handleCloseModal={handleCloseModal}
                    errorText={errorText}
                    isPasswordRequired
                />
            </Modal>
        )}

        {/* Delete User Modal */}
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