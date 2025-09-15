import { List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { AuthApi } from "../../../../lib/api";
import { clearUser, selectUserState } from "../../../layout/auth/authSlice";
import { UserRoles } from "../../../../lib/enums";
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

    const handleLogout = async (): Promise<void> => {
        AuthApi.logout();
        navigate("/login", { replace: true });
        dispatch(clearUser());
    }

    return (
        <div id="actions" className="shadow">
            <NavLink
                id="action-button"
                className={({ isActive }) => (isActive ? "active" : "")}
                to="/"
            >
                <Map /> Map
            </NavLink>
            <NavLink id="action-button" className={({ isActive }) => (isActive ? "active" : "")} to="/list"><List /> List</NavLink>
            {
                user?.userRole === UserRoles.ADMIN && (
                    <NavLink id="action-button" className={({ isActive }) => (isActive ? "active" : "")} to="/admin"><ShieldUser /> Admin</NavLink>
                )
            }
            <button className="error-fg" id="action-button" onClick={handleLogout}><LogOut /> Logout</button>
        </div>
    )
}