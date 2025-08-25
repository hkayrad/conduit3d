import "./style/login.css"

import { useNavigate } from "react-router";
import AuthApi from "../../../lib/api/auth";
import Logo from "../../shared/header/components/Logo";
import Input from "../../shared/input/Input";
import { useState } from "react";
import type { LoginUserDto } from "../../../lib/types";
import { Info, Loader, LogIn, ShieldX } from "lucide-react";
import { useDispatch } from "react-redux";

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loginError, setLoginError] = useState<string | null>("");
    const [isInfoHovered, setIsInfoHovered] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async () => {
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
                    // dispatch({ type: 'user/setUser', payload: response.data });
                    setLoading(false);
                    navigate("/", { replace: true });
                } else {
                    setLoading(false);
                    setLoginError("Invalid username or password");
                }
            } catch (error) {
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
            <div id="login-form">
                <Input
                    id="username"
                    label="Username"
                    placeholder="john_doe"
                    state={username}
                    setState={setUsername}
                    required />
                <Input
                    id="password"
                    label="Password"
                    placeholder="your_password"
                    type="password"
                    state={password}
                    setState={setPassword}
                    required />
                <button className="shadow" id="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? <Loader id="loader" /> : <LogIn />}
                    {loading ? "Loading..." : "Login"}
                </button>
            </div>
            <p className={`shadow ${loginError ? "visible" : ""}`} id="login-error">
                <ShieldX />
                {loginError}
            </p>
        </div>
    </div>
}