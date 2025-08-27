import "./style/mousePosition.css";

type Props = {
    mouseLonLat: number[];
}

export default function MousePosition(props: Props) {
    const { mouseLonLat } = props;
    return (
        <div id="mouse-position">
            <span id="number">{mouseLonLat[0].toFixed(5)}</span>
            <span>,</span>
            <span id="number">{mouseLonLat[1].toFixed(5)}</span>
        </div>
    )
}