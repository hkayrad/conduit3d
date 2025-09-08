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
            <span>MapLibre | © CARTO, © OpenStreetMap contributors</span>
            <InfoIcon />
        </div>
    )
}