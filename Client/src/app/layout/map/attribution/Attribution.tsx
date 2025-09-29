import { InfoIcon } from "lucide-react";
import "./style/attribution.css";

/**
 * Attribution component is responsible for displaying the map attribution information.
 * @component
 * @returns The rendered component
 */
export default function Attribution(): React.ReactNode {
    return (
        <div id="attribution">
            <span><a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></span>
            <InfoIcon />
        </div>
    )
}