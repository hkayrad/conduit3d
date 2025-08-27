import { useState } from "react";
import "./style/layerControl.css"
import { Building, ChevronRight, Layers2, PlugZap, UtilityPole, Zap } from "lucide-react";
import { selectMapState, setMapLayerVisibility, type MapState } from "../mapSlice";
import { useAppSelector } from "../../../../lib/hooks/reduxHooks";
import { useDispatch } from "react-redux";
import LayerControlSection from "../../../shared/layerControlSection/LayerControlSection";
import LayerControlDropdown from "../../../shared/layerControlDropdown/LayerControlDropdown";

export default function LayerControl() {
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const mapState = useAppSelector(selectMapState);

    const handleLayerToggle = (layer: keyof MapState["visibility"]) => {
        const isVisible = mapState.visibility[layer];
        dispatch(setMapLayerVisibility({ layer, visible: !isVisible }));
    }

    return (
        <>
            <button
                id="layer-control-toggle"
                className={`shadow ${isControlsOpen ? "open" : "closed"}`}
                onClick={() => setIsControlsOpen(!isControlsOpen)}>
                {isControlsOpen ? <ChevronRight /> : <Layers2 />}
            </button>
            <div className={`layer-control-content shadow ${isControlsOpen ? "open" : "closed"}`}>
                <LayerControlSection title="buildings">
                    <LayerControlDropdown
                        icon={<Building />}
                        name="Adr Bina"
                        isLayerVisible={mapState.visibility.adrBina}
                        toggleLayer={() => handleLayerToggle("adrBina")}
                    />
                    <LayerControlDropdown
                        icon={<Zap />}
                        name="Trafo"
                        isLayerVisible={mapState.visibility.trafoBina}
                        toggleLayer={() => handleLayerToggle("trafoBina")}
                    />
                </LayerControlSection>
                <LayerControlSection title="poles">
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ag Direk"
                        isLayerVisible={mapState.visibility.agDirek}
                        toggleLayer={() => handleLayerToggle("agDirek")}
                    />
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Og Mus Direk"
                        isLayerVisible={mapState.visibility.ogMusDirek}
                        toggleLayer={() => handleLayerToggle("ogMusDirek")}
                    />
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ayd Direk"
                        isLayerVisible={mapState.visibility.aydDirek}
                        toggleLayer={() => handleLayerToggle("aydDirek")}
                    />
                </LayerControlSection>
                <LayerControlSection title="lines">
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Ag Hat"
                        isLayerVisible={mapState.visibility.agHat}
                        toggleLayer={() => handleLayerToggle("agHat")}
                    />
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Og Hat"
                        isLayerVisible={mapState.visibility.ogHat}
                        toggleLayer={() => handleLayerToggle("ogHat")}
                    />
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Rekortman"
                        isLayerVisible={mapState.visibility.rekortman}
                        toggleLayer={() => handleLayerToggle("rekortman")}
                    />
                </LayerControlSection>
            </div>
        </>
    )
}