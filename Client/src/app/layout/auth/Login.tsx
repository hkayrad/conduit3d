import "./style/login.css"

import { useNavigate } from "react-router";
import { AuthApi } from "../../../lib/api";
import Logo from "../../shared/logo/Logo";
import Input from "../../shared/input/Input";
import { useState, type JSX } from "react";
import type { LoginUserDto } from "../../../lib/types";
import { Info, Loader, LogIn, ShieldX } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./authSlice";

/**
 * Login component is responsible for rendering the login form and handling user authentication.
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function Login(): JSX.Element {

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loginError, setLoginError] = useState<string | null>("");
    const [isInfoHovered, setIsInfoHovered] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        const user: LoginUserDto = { username, password };

        setTimeout(async () => {
            if (!user.username || !user.password) {
                setLoginError("Please fill in all fields");
                setLoading(false);
                return;
            }

            if (user.password.length < 8) {
                setLoginError("Password must be at least 8 characters long");
                setLoading(false);
                return;
            }

            try {
                const response = await AuthApi.login(user);
                if (response.isSuccess) {
                    dispatch(setUser(response.data));
                    setLoading(false);
                    navigate("/", { replace: true });
                } else {
                    dispatch(clearUser());
                    setLoading(false);
                    setLoginError("Invalid username or password");
                }
            } catch (error) {
                dispatch(clearUser());
                setLoading(false);
                setLoginError("An error occurred while trying to log in");
            }
        }, 500);
    }

    return <div id="login">
        <div id="left">
            <Logo color="White" size="Big" />
            <img id="bg" src="/login/bg.png" alt="Conduit3D Logo" />
        </div>
        <div id="right">
            <div id="info-box">
                <p id="info-hover" onMouseEnter={() => setIsInfoHovered(true)} onMouseLeave={() => setIsInfoHovered(false)}><Info /></p>
                <p className={`${isInfoHovered ? "visible" : ""}`} id="info-text">If you forgot your password, please contact the system administrator.</p>
            </div>
            <h2 id="welcome">Welcome</h2>
            <p id="instructions">Use credentials given by your system administrator</p>
            <form onSubmit={handleLogin} id="login-form">
                <Input
                    id="username"
                    label="Username"
                    placeholder="john_doe"
                    name="username"
                    state={username}
                    setState={setUsername}
                    required />
                <Input
                    id="password"
                    label="Password"
                    placeholder="your_password"
                    type="password"
                    name="password"
                    state={password}
                    setState={setPassword}
                    required />
                <button className="shadow" id="login-button" type="submit" disabled={loading}>
                    {loading ? <Loader id="loader" /> : <LogIn />}
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>
            <p className={`shadow ${loginError ? "visible" : ""}`} id="login-error">
                <ShieldX />
                {loginError}
            </p>
        </div>
    </div>
}