import { InfoIcon } from "lucide-react";
import "./style/attribution.css";
import type { JSX } from "react";

/**
 * Attribution component is responsible for displaying the map attribution information.
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function Attribution(): JSX.Element {
    return (
        <div id="attribution">
            <span>MapLibre | © CARTO, © OpenStreetMap contributors</span>
            <InfoIcon />
        </div>
    )
}