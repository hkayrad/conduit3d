import "./style/badge.css";

type Props = {
    label: string
    color: string
}

/**
 * Badge component displays a colored label.
 * @component
 * @param props The props for the Badge component.
 * @returns The rendered component
 */
export default function Badge(props: Props): React.ReactNode {
    const { label, color } = props;

    return (
        <div className={`badge badge-${color}`}>
            {label}
        </div>
    )
}