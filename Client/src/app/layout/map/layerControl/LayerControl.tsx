import { useState } from "react";
import "./style/layerControl.css"
import { ChevronRight, Layers2 } from "lucide-react";
import { selectMapState, type MapState } from "../mapSlice";
import { useAppSelector } from "../../../../lib/hooks";
import { useDispatch } from "react-redux";

export default function LayerControl() {
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const mapState = useAppSelector(selectMapState);

    const handleLayerToggle = (layer: keyof MapState["visibility"]) => {
        const isVisible = mapState.visibility[layer];
        dispatch({ type: "map/setMapLayerVisibility", payload: { layer, visible: !isVisible } });
    }

    return (
        <>
            <button
                id="layer-control-toggle"
                className={isControlsOpen ? "open" : "closed"}
                onClick={() => setIsControlsOpen(!isControlsOpen)}>
                {isControlsOpen ? <ChevronRight /> : <Layers2 />}
            </button>
            <div className={`layer-control-content ${isControlsOpen ? "open" : "closed"}`}>
                {
                    Object.keys(mapState.visibility).map((layer) => (
                        <div key={layer} className="layer-control-item">
                            <button
                                onClick={() => handleLayerToggle(layer as keyof MapState["visibility"])}
                            >
                                {mapState.visibility[layer as keyof MapState["visibility"]] ? "Hide" : "Show"} {layer}
                            </button>
                        </div>
                    ))
                }
            </div>
        </>
    )
}