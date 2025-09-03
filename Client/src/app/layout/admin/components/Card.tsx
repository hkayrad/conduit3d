type Props = {
    title: string,
    icon: React.ReactNode,
    number: number
    numberColor?: string,
    info?: string
}

/**
 * Card component for displaying a statistic with an icon.
 * @component
 * @param props - The properties for the card component.
 * @returns The rendered card component.
 */
export default function Card(props: Props) {
    const { title, icon, number, info, numberColor } = props;

    return (
        <div className="card">
            <div className="upper">
                <p>{title}</p>
                <div className="icon">{icon}</div>
            </div>
            <div className="lower">
                <p className={`content ${numberColor}`}>{number}</p>
                {info && <p className="info">{info}</p>}
            </div>
        </div>
    )
}