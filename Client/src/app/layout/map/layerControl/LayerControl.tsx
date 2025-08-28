import { useState } from "react";
import "./style/layerControl.css"
import { Building, ChevronRight, Layers2, PlugZap, UtilityPole, Zap } from "lucide-react";
import { selectMapState, setFilter, setMapLayerVisibility, type MapState } from "../mapSlice";
import { useAppSelector } from "../../../../lib/hooks/reduxHooks";
import { useDispatch } from "react-redux";
import LayerControlSection from "../../../shared/layerControlSection/LayerControlSection";
import LayerControlDropdown from "../../../shared/layerControlDropdown/LayerControlDropdown";
import LayerControlFilter from "../../../shared/layerControlFilter/LayerControlFilter";

export default function LayerControl() {
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const { visibility, types, filters } = useAppSelector(selectMapState);


    const handleLayerToggle = (layer: keyof MapState["visibility"]) => {
        const isVisible = visibility[layer];
        dispatch(setMapLayerVisibility({ layer, visible: !isVisible }));
    }

    const handleFilterToggle = (newFilters: string[], filterKey: keyof MapState["filters"]) => {
        dispatch(setFilter({ filter: filterKey, tipi: newFilters }))
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
                        isLayerVisible={visibility.adrBina}
                        toggleLayer={() => handleLayerToggle("adrBina")}
                    />
                    <LayerControlDropdown
                        icon={<Zap />}
                        name="Trafo"
                        isLayerVisible={visibility.trafoBina}
                        toggleLayer={() => handleLayerToggle("trafoBina")}
                    />
                </LayerControlSection>
                <LayerControlSection title="poles">
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ag Direk"
                        isLayerVisible={visibility.agDirek}
                        toggleLayer={() => handleLayerToggle("agDirek")}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.agDirek}
                            filters={filters.agDirek.tipi}
                            filterKey="agDirek"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Og Mus Direk"
                        isLayerVisible={visibility.ogMusDirek}
                        toggleLayer={() => handleLayerToggle("ogMusDirek")}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.ogMusDirek}
                            filters={filters.ogMusDirek.tipi}
                            filterKey="ogMusDirek"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ayd Direk"
                        isLayerVisible={visibility.aydDirek}
                        toggleLayer={() => handleLayerToggle("aydDirek")}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.aydDirek}
                            filters={filters.aydDirek.tipi}
                            filterKey="aydDirek"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                </LayerControlSection>
                <LayerControlSection title="lines">
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Ag Hat"
                        isLayerVisible={visibility.agHat}
                        toggleLayer={() => handleLayerToggle("agHat")}
                    />
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Og Hat"
                        isLayerVisible={visibility.ogHat}
                        toggleLayer={() => handleLayerToggle("ogHat")}
                    />
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Rekortman"
                        isLayerVisible={visibility.rekortman}
                        toggleLayer={() => handleLayerToggle("rekortman")}
                    />
                </LayerControlSection>
            </div>
        </>
    )
}