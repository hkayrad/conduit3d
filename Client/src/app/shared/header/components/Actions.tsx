import { List, LogOut, Map, ShieldUser } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import AuthApi from "../../../../lib/api/auth";

export default function Actions() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            AuthApi.logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }
    return (
        <div id="actions">
            <NavLink id="action-button" to="/"><Map /> Map</NavLink>
            <NavLink id="action-button" to="/list"><List /> List</NavLink>
            <NavLink id="action-button" to="/admin"><ShieldUser /> Admin</NavLink>
            <button className="error" id="action-button" onClick={handleLogout}><LogOut /> Logout</button>
        </div>
    )
}