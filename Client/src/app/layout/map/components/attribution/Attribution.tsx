import { InfoIcon } from "lucide-react";
import "./style/attribution.css";
import { useAppSelector } from "../../../../../lib/hooks";
import { selectCustomLayers } from "../../mapSlice";

/**
 * Attribution component is responsible for displaying the map attribution information.
 * @component
 * @returns The rendered component
 */
export default function Attribution(): React.ReactNode {
  const customLayers = useAppSelector(selectCustomLayers);

  const activeAttributions = customLayers
    .filter((layer) => layer.visible && layer.attribution)
    .map((layer) => layer.attribution);

  return (
    <div id="attribution">
      <span>
        <a
          href="https://maplibre.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MapLibre
        </a>{" "}
        |{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          © OpenStreetMap contributors
        </a>
        {activeAttributions.map((attr, index) => (
          <span key={index}>
            {" | "}
            <span dangerouslySetInnerHTML={{ __html: attr! }} />
          </span>
        ))}
      </span>
      <InfoIcon />
    </div>
  );
}
