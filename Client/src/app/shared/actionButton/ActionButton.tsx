import "./style/actionButton.css";

type Props = {
    content: React.ReactNode;
    style: "success" | "error" | "warning";
    disabled?: boolean;
    onClick: () => void;
}

/**
 * ActionButton component displays a button with various styles.
 * @component
 * @param props The props for the ActionButton component.
 * @returns The rendered component
 */
export default function ActionButton(props: Readonly<Props>): React.ReactNode {
    const { onClick, content, style, disabled } = props;

    return (
        <button className={`action-button ${style}`} disabled={disabled} onClick={onClick}>
            {content}
        </button>
    )
}