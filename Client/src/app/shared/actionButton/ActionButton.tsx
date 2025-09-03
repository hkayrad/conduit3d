import "./style/actionButton.css";

type Props = {
    content: React.ReactNode;
    style: "success" | "error" | "warning";
    disabled?: boolean;
    onClick: () => void;
}

export default function ActionButton(props: Props) {
    const { onClick, content, style, disabled } = props;

    return (
        <button className={`action-button ${style}`} disabled={disabled} onClick={onClick}>
            {content}
        </button>
    )
}