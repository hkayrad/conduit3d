import "./style/badge.css";

type Props = {
    label: string
    color: string
}

export default function Badge(props: Props) {
    const { label, color } = props;

    return (
        <div className={`badge badge-${color}`}>
            {label}
        </div>
    )
}