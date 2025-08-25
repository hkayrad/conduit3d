import "./style/login.css"

import { useNavigate } from "react-router";
import AuthApi from "../../../lib/api/auth";
import Logo from "../../shared/header/components/Logo";
import Input from "../../shared/input/Input";
import { useState } from "react";
import type { LoginUserDto } from "../../../lib/types";
import { Info, LogIn, ShieldX } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loginError, setLoginError] = useState<string | null>("");
    const [isInfoHovered, setIsInfoHovered] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        const user: LoginUserDto = { username, password };
        if (!user.username || !user.password) {
            console.error("Username and password are required");
            return;
        }

        try {
            await AuthApi.login(user);
            navigate("/", { replace: true });
        } catch (error) {
            setLoginError("Invalid username or password");
        }
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
                <button className="shadow" id="login-button" onClick={handleLogin}>
                    <LogIn />
                    Login
                </button>
                {
                    loginError && <p className="shadow" id="login-error">
                        <ShieldX />
                        {loginError}
                    </p>
                }
            </div>
        </div>
    </div>
}