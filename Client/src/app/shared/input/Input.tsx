import React, { useState } from "react";
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
    setState: React.Dispatch<React.SetStateAction<string>> | ((value: string) => void);
}

/**
 * Input component for text and password fields.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function Input(props: Readonly<Props>): React.ReactNode {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { type, id, name, label, required, placeholder, state, setState } = props;

    return (
        <div className="input-container">
            <label className="input-element">
                {label && <p>{label}{required && <span className="error-fg">*</span>}</p>}
                <input
                    type={type ? type === "password" && isPasswordVisible ? "text" : type : "text"}
                    id={id}
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={state}
                    autoComplete={name === "password" ? "current-password" : name === "username" ? "username" : "off"}
                    onChange={(e) => setState(e.target.value)}
                />
            </label>
            {type === "password" &&
                <button id="toggle-password" type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                </button>
            }
        </div>
    );
}