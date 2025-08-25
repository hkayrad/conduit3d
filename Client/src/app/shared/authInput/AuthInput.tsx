import { useState } from "react";
import "./style/input.css"
import { Eye, EyeOff } from "lucide-react";

type Props = {
    type?: "text" | "password",
    id?: string
    name?: string,
    label?: string,
    required?: boolean,
    placeholder?: string,
    state: string,
    setState: React.Dispatch<React.SetStateAction<string>>
}

export default function AuthInput(props: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { type, id, name, label, required, placeholder, state, setState } = props;

    return (
        <div className="auth-input-container">
            <label className="auth-input">
                <p>{label}{required && <span className="error">*</span>}</p>
                <input
                    type={type ? type === "password" && isPasswordVisible ? "text" : type : "text"}
                    id={id}
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                />
            </label>
            {type === "password" &&
                <button id="toggle-password" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                </button>
            }
        </div>
    );
}