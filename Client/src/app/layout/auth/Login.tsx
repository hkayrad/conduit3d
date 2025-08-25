import { useNavigate } from "react-router";
import Auth from "../../../lib/api/auth";

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        const user = {
            username: 'test',
            password: 'Test1234'
        };
        try {
            await Auth.login(user);
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    return <>
        <button onClick={handleLogin}>Login</button>
    </>
}