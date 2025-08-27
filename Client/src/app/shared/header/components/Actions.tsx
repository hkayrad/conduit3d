import { List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import AuthApi from "../../../../lib/api/auth";
import { useDispatch, useSelector } from "react-redux";
import { selectUserState } from "../../../layout/auth/authSlice";
import { UserRoles } from "../../../../lib/enums";

export default function Actions() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectUserState);

    const handleLogout = async () => {
        try {
            AuthApi.logout();
            dispatch({ type: 'auth/clearUser' });
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <div id="actions" className="shadow">
            <NavLink id="action-button" className={({ isActive }) => (isActive ? "active" : "")} to="/"><Map /> Map</NavLink>
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