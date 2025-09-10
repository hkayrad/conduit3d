import { List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { AuthApi } from "../../../../lib/api";
import { clearUser, selectUserState } from "../../../layout/auth/authSlice";
import { C3D_MapViewType, UserRoles } from "../../../../lib/enums";
import { selectSelectedViewType } from "../../../layout/map/mapSlice";
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks";

/**
 * Actions component displays user action buttons.
 * @component
 * @returns The rendered component
 */
export default function Actions(): React.ReactNode {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const user = useAppSelector(selectUserState);
    const selectedViewType = useAppSelector(selectSelectedViewType);

    const handleLogout = async (): Promise<void> => {
        try {
            AuthApi.logout();
            dispatch(clearUser());
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <div id="actions" className="shadow">
            <NavLink
                id="action-button"
                className={({ isActive }) => (isActive ? "active" : "")}
                to={selectedViewType === C3D_MapViewType.Cartesian ?
                    `/?viewType=${C3D_MapViewType.Cartesian}` :
                    `/?viewType=${C3D_MapViewType.FirstPerson}`
                }
            >
                <Map /> Map
            </NavLink>
            <NavLink id="action-button" className={({ isActive }) => (isActive ? "active" : "")} to="/list"><List /> List</NavLink>
            {
                user?.userRole === UserRoles.ADMIN && (
                    <NavLink id="action-button" className={({ isActive }) => (isActive ? "active" : "")} to="/admin"><ShieldUser /> Admin</NavLink>
                )
            }
            <button className="error" id="action-button" onClick={handleLogout}><LogOut /> Logout</button>
        </div>
    )
}