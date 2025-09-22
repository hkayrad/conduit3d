import "./style/layerControl.css"
import { Building, ChevronRight, Eye, EyeClosed, Layers2, PlugZap, UtilityPole, Zap } from "lucide-react";
import { selectMapState, setFilter, setIsHoverInfoVisible, setIsLayerControlsOpen, setMapLayerVisibility, type MapState } from "../mapSlice";
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks";
import LayerControlSection from "../../../shared/layerControl/layerControlSection/LayerControlSection";
import LayerControlDropdown from "../../../shared/layerControl/layerControlDropdown/LayerControlDropdown";
import LayerControlFilter from "../../../shared/layerControl/layerControlFilter/LayerControlFilter";
import SettingToggleButton from "../../../shared/layerControl/settingToggleButton/SettingToggleButton";

/**
 * LayerControl component manages the visibility and settings of map layers.
 * @component
 * @returns The rendered component
 */
export default function LayerControl({
    debugBinaVisible,
    setDebugBinaVisible
}: {
    debugBinaVisible: boolean;
    setDebugBinaVisible: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactNode {

    const dispatch = useAppDispatch();
    const { isLayerControlsOpen, isHoverInfoVisible, visibility, types, filters } = useAppSelector(selectMapState);

    const handleControlsToggle = () => {
        dispatch(setIsLayerControlsOpen(!isLayerControlsOpen));
    }

    const handleHoverInfoToggle = () => {
        dispatch(setIsHoverInfoVisible(!isHoverInfoVisible));
    }

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
                className={`shadow ${isLayerControlsOpen ? "open" : "closed"}`}
                onClick={handleControlsToggle}
                title={isLayerControlsOpen ? "Close Layer Controls" : "Open Layer Controls"}
            >
                {isLayerControlsOpen ? <ChevronRight /> : <Layers2 />}
            </button>
            <div className={`layer-control-content ${isLayerControlsOpen ? "open" : "closed"}`}>
                <LayerControlSection title="hover info">
                    <SettingToggleButton
                        active={isHoverInfoVisible}
                        toggle={handleHoverInfoToggle}
                        hideLabel={<><EyeClosed /> Hide</>}
                        showLabel={<><Eye /> Show</>}
                        hideTitle="Hide Hover Info"
                        showTitle="Show Hover Info"
                    />
                </LayerControlSection>
                <LayerControlSection title="basemap">
                    <SettingToggleButton
                        active={visibility.basemap}
                        toggle={() => handleLayerToggle("basemap")}
                        hideLabel={<><EyeClosed /> Hide</>}
                        showLabel={<><Eye /> Show</>}
                        hideTitle="Hide Basemap"
                        showTitle="Show Basemap"
                    />
                </LayerControlSection>
                <LayerControlSection title="buildings">
                    <LayerControlDropdown
                        icon={<Building />}
                        name="Debug Buildings"
                        isLayerVisible={debugBinaVisible}
                        toggleLayer={() => setDebugBinaVisible(!debugBinaVisible)}
                    />
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
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.agHat}
                            filters={filters.agHat.tipi}
                            filterKey="agHat"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Og Hat"
                        isLayerVisible={visibility.ogHat}
                        toggleLayer={() => handleLayerToggle("ogHat")}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.ogHat}
                            filters={filters.ogHat.tipi}
                            filterKey="ogHat"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Rekortman"
                        isLayerVisible={visibility.rekortman}
                        toggleLayer={() => handleLayerToggle("rekortman")}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.rekortman}
                            filters={filters.rekortman.tipi}
                            filterKey="rekortman"
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                </LayerControlSection>
            </div >
        </>
    )
}