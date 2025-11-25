import './style/modal.css';

type Props = {
    children: React.ReactNode;
    className?: string;
}

/**
 * Modal component for displaying content in a dialog.
 * @component
 * @param props Props for the Modal component.
 * @returns The rendered Modal component.
 */
export default function Modal(props: Readonly<Props>): React.ReactNode {
    const { children, className = "" } = props;

    return (
        <div className="modal-overlay">
            <div className={`modal ${className}`}>
                {children}
            </div>
        </div>
    )
}