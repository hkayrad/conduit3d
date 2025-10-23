type Props = {
    color?: "Dark" | "White",
    type?: "Long" | "Short",
    size?: "Small" | "Big"
}

/**
 * Logo component displays a logo image with customizable properties.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function Logo(props: Readonly<Props>): React.ReactNode {
    const { color = "Dark", type = "Long", size = "Small" } = props;
    return (
        <img
            id="logo"
            data-testid="logo"
            fetchPriority="high"
            src={`logo/Color=${color}, Type=${type}, Size=${size}.svg`}
            alt={`${color} ${type} ${size} logo`}
        />
    );
}