type Props = {
    color?: "Dark" | "White",
    type?: "Long" | "Short",
    size?: "Small" | "Big"
}

export default function Logo({ color = "Dark", type = "Long", size = "Small" }: Props) {
    return (
        <img
            id="logo"
            src={`logo/Color=${color}, Type=${type}, Size=${size}.svg`}
            alt={`${color} ${type} ${size} logo`}
        />
    );
}