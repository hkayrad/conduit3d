import "./style/layerControl.css"
import { Building, ChevronRight, Eye, EyeClosed, Layers2, PlugZap, UtilityPole, Zap } from "lucide-react";
import { selectMapState, setFilter, setIsHoverInfoVisible, setIsLayerControlsOpen, setMapLayerVisibility, type MapState } from "../mapSlice";
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks";
import LayerControlSection from "../../../shared/layerControl/layerControlSection/LayerControlSection";
import LayerControlDropdown from "../../../shared/layerControl/layerControlDropdown/LayerControlDropdown";
import LayerControlFilter from "../../../shared/layerControl/layerControlFilter/LayerControlFilter";
import SettingToggleButton from "../../../shared/layerControl/settingToggleButton/SettingToggleButton";
import { C3D_MapLayers } from "../../../../lib/enums";

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
                        toggle={() => handleLayerToggle(C3D_MapLayers.Basemap)}
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
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.AdrBina)}
                    />
                    <LayerControlDropdown
                        icon={<Zap />}
                        name="Trafo"
                        isLayerVisible={visibility.trafoBina}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.TrafoBina)}
                    />
                </LayerControlSection>
                <LayerControlSection title="poles">
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ag Direk"
                        isLayerVisible={visibility.agDirek}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.AgDirek)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.agDirek}
                            filters={filters.agDirek.tipi}
                            filterKey={C3D_MapLayers.AgDirek}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Og Mus Direk"
                        isLayerVisible={visibility.ogMusDirek}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.OgMusDirek)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.ogMusDirek}
                            filters={filters.ogMusDirek.tipi}
                            filterKey={C3D_MapLayers.OgMusDirek}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<UtilityPole />}
                        name="Ayd Direk"
                        isLayerVisible={visibility.aydDirek}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.AydDirek)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.aydDirek}
                            filters={filters.aydDirek.tipi}
                            filterKey={C3D_MapLayers.AydDirek}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                </LayerControlSection>
                <LayerControlSection title="lines">
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Ag Hat"
                        isLayerVisible={visibility.agHat}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.AgHat)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.agHat}
                            filters={filters.agHat.tipi}
                            filterKey={C3D_MapLayers.AgHat}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Og Hat"
                        isLayerVisible={visibility.ogHat}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.OgHat)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.ogHat}
                            filters={filters.ogHat.tipi}
                            filterKey={C3D_MapLayers.OgHat}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                    <LayerControlDropdown
                        icon={<PlugZap />}
                        name="Rekortman"
                        isLayerVisible={visibility.rekortman}
                        toggleLayer={() => handleLayerToggle(C3D_MapLayers.Rekortman)}
                    >
                        <LayerControlFilter
                            label="Type"
                            typeList={types.rekortman}
                            filters={filters.rekortman.tipi}
                            filterKey={C3D_MapLayers.Rekortman}
                            setFilters={handleFilterToggle}
                        />
                    </LayerControlDropdown>
                </LayerControlSection>
            </div >
        </>
    )
}