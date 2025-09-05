import type { User } from "../../../../lib/types";

type Props = {
    user: User,
    handleDelete: (userId: number) => void,
    handleCloseModal: () => void;
}

export default function UserDeleteModalContent(props: Props) {
    const { user, handleDelete, handleCloseModal } = props;

    return (
        <div>
            <h2>Delete User</h2>
            <p>Are you sure you want to delete user {user.username}?</p>
            <div className="modal-actions">
                <button className="success-bg white-fg" onClick={handleCloseModal}>Cancel</button>
                <button className="error-bg white-fg" onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
        </div>
    );
}