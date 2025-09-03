import { Pencil, Trash2, UserCheck2Icon, Users2, UserX2Icon } from "lucide-react";
import Card from "./components/Card";
import "./style/admin.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TableData, User, UserCountsDto } from "../../../lib/types";
import { AuthApi } from "../../../lib/api";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../lib/hooks";
import { selectAdminState, setItemsPerPage, setPageNumber } from "./adminSlice";
import Table from "../../shared/table/Table";
import Badge from "../../shared/badge/Badge";
import { capitalizeFirstLetter } from "../../../lib/utils";
import ActionButton from "../../shared/actionButton/ActionButton";
import Stats from "./components/Stats";
import UserModal from "../../shared/userModal/UserModal";
import { selectUserState } from "../auth/authSlice";

export default function Admin() {
    const dispatch = useDispatch();
    const { itemsPerPage, pageNumber } = useAppSelector(selectAdminState)
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
    // const [editingUser, setEditingUser] = useState<User | null>(null);
    // const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleFetchUsers = async (pageSize: number, pageNumber: number) => {
        const response = await AuthApi.fetchAll(pageSize, pageNumber);

        if (response.isSuccess) {
            setUsers(response.data);
        }
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
            await handleFetchUsers(itemsPerPage, pageNumber);
            await handleFetchUserCount();
        }
    }

    // const handleEditUser = async (updatedUser: User) => {
    //     console.log(updatedUser);

    //     // const response = await AuthApi.updateUser(updatedUser.id, updatedUser);

    //     // if (response.isSuccess) {
    //     //     await handleFetchUsers(itemsPerPage, pageNumber);
    //     //     await handleFetchUserCount();
    //     setIsEditModalOpen(false);
    //     setEditingUser(null);
    //     // }
    // }

    // const handleEditUserButtonClick = useCallback((user: User) => {
    //     setEditingUser(user);
    //     setIsEditModalOpen(true);
    // }, []);

    // const handleCloseEditModal = useCallback(() => {
    //     setIsEditModalOpen(false);
    //     setEditingUser(null);
    // }, []);

    const formatData = useCallback(() => {
        const headers = ["Index", "Username", "Name", "Email", "Role", "Status", "Created At", "Actions"];
        const rows = users.map((user, index) => [
            index + 1,
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
                    onClick={() => {/* handleEditUserButtonClick(user) */ }}
                />
                <ActionButton
                    content={<Trash2 />}
                    style="error"
                    disabled={user.id === currentUser?.id}
                    onClick={() => handleDeleteUserButtonClick(user.id)}
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

    const handleDeleteUserButtonClick = useCallback((userId: number) => {
        handleDeleteUser(userId);
    }, [handleDeleteUser]);

    useEffect(() => {
        handleFetchUsers(itemsPerPage, pageNumber);
        handleFetchUserCount();
    }, [itemsPerPage, pageNumber])

    useEffect(() => {
        formatData();
    }, [users])

    return <div id="admin-page">
        <Stats userCounts={userCounts} />
        <Table
            tableName="User Management"
            pageNumber={pageNumber}
            itemsPerPage={itemsPerPage}
            setPageNumber={handleSetPageNumber}
            setItemsPerPage={handleChangeItemsPerPage}
            data={tableData}
            totalDataCount={userCounts.totalUsers}
        />
        {/* {isEditModalOpen && editingUser && (
            <UserModal
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                handleEditUser={handleEditUser}
                handleCloseEditModal={handleCloseEditModal}
            />
        )} */}
    </div >
}