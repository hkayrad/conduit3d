import "./style/userModal.css";
import type { User } from "../../../lib/types";

type Props = {
    editingUser: User;
    setEditingUser: (user: User | null) => void;
    handleEditUser: (user: User) => void;
    handleCloseEditModal: () => void;
}

export default function UserModal(props: Props) {
    const { editingUser, setEditingUser, handleEditUser, handleCloseEditModal } = props;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit User</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleEditUser(editingUser);
                }}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            id="username"
                            type="text"
                            value={editingUser.username}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={editingUser.password || ""}
                            placeholder="Unchanged"
                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            value={editingUser.userRole}
                            onChange={(e) => setEditingUser({ ...editingUser, userRole: e.target.value as 'admin' | 'user' })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            value={editingUser.isActive ? 'active' : 'inactive'}
                            onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleCloseEditModal}>Cancel</button>
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )
}