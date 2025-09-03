import "./style/actionButton.css";

type Props = {
    content: React.ReactNode;
    style: "success" | "error" | "warning";
    onClick: () => void;
}

export default function ActionButton(props: Props) {
    const { onClick, content, style } = props;

    return (
        <button className={`action-button ${style}`} onClick={onClick}>
            {content}
        </button>
    )
}