import { List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { AuthApi } from "../../../../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, selectUserState } from "../../../layout/auth/authSlice";
import { UserRoles } from "../../../../lib/enums";
import { selectViewState } from "../../../layout/map/mapSlice";

/**
 * Actions component displays user action buttons.
 * @component
 * @returns The rendered component
 */
export default function Actions(): React.ReactNode {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectUserState);
    const { lon, lat, z, p, b } = useSelector(selectViewState);

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
                to={`/?lon=${lon}&lat=${lat}&z=${z}&p=${p}&b=${b}`}
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