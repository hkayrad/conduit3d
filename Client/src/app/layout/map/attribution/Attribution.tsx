import { InfoIcon } from "lucide-react";
import "./style/attribution.css";

export default function Attribution() {
    return (
        <div id="attribution">
            <span>MapLibre | © CARTO, © OpenStreetMap contributors</span>
            <InfoIcon />
        </div>
    )
}