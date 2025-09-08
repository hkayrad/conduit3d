import { CircleAlert } from "lucide-react";
import type { User } from "../../../../lib/types";

type Props = {
    user: User,
    handleDelete: (userId: number) => void,
    handleCloseModal: () => void;
    errorText?: string;
}

/**
 * UserDeleteModalContent component for deleting a user.
 * @param props - Props for the UserDeleteModalContent component
 * @returns The rendered component
 */
export default function UserDeleteModalContent(props: Props): React.ReactNode {
    const { user, handleDelete, handleCloseModal, errorText } = props;

    return (
        <div>
            <h2>Delete User</h2>
            <p>Are you sure you want to delete user {user.username}?</p>
            <div className="modal-actions">
                <button className="success-bg white-fg" onClick={handleCloseModal}>Cancel</button>
                <button className="error-bg white-fg" onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
            {errorText && <div className="error-text">
                <CircleAlert />
                <p>{errorText}</p>
            </div>}
        </div>
    );
}