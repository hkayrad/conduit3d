import { BookOpenText, List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { UserApi } from "../../../../lib/api";
import { clearUser, selectUserState } from "../../../layout/auth/authSlice";
import { UserRoles } from "../../../../lib/enums";
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks";

/**
 * Actions component displays user action buttons.
 * @component
 * @returns The rendered component
 */
export default function Links(): React.ReactNode {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const user = useAppSelector(selectUserState);

    const handleLogout = async (): Promise<void> => {
        UserApi.logout();
        navigate("/login", { replace: true });
        dispatch(clearUser());
    }

    return (
        <div id="actions" className="shadow">
            <NavLink
                id="link-button"
                className={({ isActive }) => (isActive ? "active" : "")}
                to="/"
            >
                <Map /> Map
            </NavLink>
            <NavLink id="link-button" className={({ isActive }) => (isActive ? "active" : "")} to="/list"><List /> List</NavLink>
            {
                user?.userRole === UserRoles.ADMIN && (
                    <NavLink id="link-button" className={({ isActive }) => (isActive ? "active" : "")} to="/admin"><ShieldUser /> Admin</NavLink>
                )
            }
            {
                user?.userRole === UserRoles.ADMIN && import.meta.env.VITE_USER_NODE_ENV === "development" && (
                    <NavLink id="link-button" className={({ isActive }) => (isActive ? "active" : "")} to={`${import.meta.env.VITE_API_URL}/docs`}><BookOpenText /> Swagger</NavLink>
                )
            }
            <button className="error-fg" id="link-button" onClick={handleLogout}><LogOut /> Logout</button>
        </div>
    )
}