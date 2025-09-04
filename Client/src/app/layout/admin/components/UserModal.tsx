import type { User } from "../../../../lib/types";
import { useEffect, useState } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import Input from "../../../shared/input/Input";

type Props = {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    handleSubmit: (user: User) => void;
    handleCloseModal: () => void;
    isPasswordRequired?: boolean;
    errorText?: string;
}

export default function UserModal(props: Props) {
    const { user, setUser, handleSubmit, handleCloseModal, isPasswordRequired = false, errorText } = props;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (user.isActive === undefined || user.isActive === null) {
            setUser({ ...user, isActive: true });
        }
    }, [])

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit User</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(user);
                }}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            id="username"
                            type="text"
                            value={user.username || ""}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group password-group">
                        <div className="input-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                id="password"
                                type={isPasswordVisible ? "text" : "password"}
                                value={user.password || ""}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                required={isPasswordRequired}
                            />
                        </div>
                        <button
                            type="button"
                            className="toggle-password-visibility"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            {isPasswordVisible ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            type="text"
                            value={user.name || ""}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={user.email || ""}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userRole">Role:</label>
                        <select
                            id="userRole"
                            value={user.userRole || ""}
                            onChange={(e) => setUser({ ...user, userRole: e.target.value as 'admin' | 'user' })}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            value={user.isActive ? "true" : "false"}
                            onChange={(e) => setUser({ ...user, isActive: e.target.value === 'true' })}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
                {errorText && <div className="error-text">
                    <CircleAlert />
                    <p>{errorText}</p>
                </div>}
            </div>
        </div>
    )
}