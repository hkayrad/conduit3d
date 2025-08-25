import { useNavigate } from "react-router";
import Auth from "../lib/api/auth";

export default function App() {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            Auth.logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return <>
        <button onClick={handleLogout}>Logout</button>
    </>
}