import "./style/layerControl.scss";
import {
  Building,
  ChevronRight,
  Circle,
  CircleDashed,
  Eye,
  EyeClosed,
  Layers2,
  Pencil,
  PenOff,
  PlugZap,
  Plus,
  Trash2,
  UtilityPole,
  Waypoints,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  removeCustomLayer,
  selectCustomLayers,
  selectMapState,
  setFilter,
  setIsHoverInfoVisible,
  setIsLayerControlsOpen,
  setMapLayerVisibility,
  toggleBasemapOpacity,
  toggleCustomLayerVisibility,
  reorderCustomLayers,
  type MapState,
} from "../../mapSlice";
import { useAppDispatch, useAppSelector } from "../../../../../lib/hooks";
import LayerControlSection from "../../../../shared/layerControl/layerControlSection/LayerControlSection";
import LayerControlDropdown from "../../../../shared/layerControl/layerControlDropdown/LayerControlDropdown";
import LayerControlFilter from "../../../../shared/layerControl/layerControlFilter/LayerControlFilter";
import SettingToggleButton from "../../../../shared/layerControl/settingToggleButton/SettingToggleButton";
import { C3D_MapLayers, C3D_MapViewType } from "../../../../../lib/enums";
import { useCallback, useState } from "react";
import AddLayerModal from "../modals/AddLayerModal";

type Props = {
  isDrawOpen: boolean;
  onDrawClick: () => void;
};

/**
 * LayerControl component manages the visibility and settings of map layers.
 * @component
 * @returns The rendered component
 */
export default function LayerControl(props: Props): React.ReactNode {
  const { isDrawOpen, onDrawClick } = props;
  const dispatch = useAppDispatch();
  const {
    isLayerControlsOpen,
    isHoverInfoVisible,
    visibility,
    types,
    filters,
    selectedViewType,
    isStreetViewVisible,
    isStreetViewPinned,
    basemapOpacity,
  } = useAppSelector(selectMapState);
  const customLayers = useAppSelector(selectCustomLayers);

  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);

  const handleControlsToggle = useCallback(() => {
    dispatch(setIsLayerControlsOpen(!isLayerControlsOpen));
  }, [dispatch, isLayerControlsOpen]);

  const handleHoverInfoToggle = useCallback(() => {
    dispatch(setIsHoverInfoVisible(!isHoverInfoVisible));
  }, [dispatch, isHoverInfoVisible]);

  const handleLayerToggle = useCallback(
    (layer: keyof MapState["visibility"]) => {
      const isVisible = visibility[layer];
      dispatch(setMapLayerVisibility({ layer, visible: !isVisible }));
    },
    [dispatch, visibility],
  );

  const handleFilterToggle = useCallback(
    (newFilters: string[], filterKey: keyof MapState["filters"]) => {
      dispatch(setFilter({ filter: filterKey, tipi: newFilters }));
    },
    [dispatch],
  );

  return (
    <>
      <AddLayerModal
        isOpen={isAddLayerModalOpen}
        onClose={() => setIsAddLayerModalOpen(false)}
      />
      <button
        id="layer-control-toggle"
        className={`shadow ${isLayerControlsOpen ? "open" : "closed"}`}
        onClick={handleControlsToggle}
        title={
          isLayerControlsOpen ? "Close Layer Controls" : "Open Layer Controls"
        }
      >
        {isLayerControlsOpen ? <ChevronRight /> : <Layers2 />}
      </button>
      <button
        id="toggleDraw"
        className={`shadow ${isLayerControlsOpen ? "open" : "closed"}`}
        onClick={onDrawClick}
      >
        {isDrawOpen ? <PenOff /> : <Pencil />}
      </button>
      <div
        className={`layer-control-content
                    ${isLayerControlsOpen ? "open" : "closed"}
                    ${selectedViewType === C3D_MapViewType.FirstPerson && isStreetViewVisible ? "short" : ""}
                    ${selectedViewType === C3D_MapViewType.FirstPerson && isStreetViewPinned && isStreetViewVisible ? "pinned" : ""}
                    `}
      >
        <LayerControlSection title="hover info">
          <SettingToggleButton
            active={isHoverInfoVisible}
            toggle={handleHoverInfoToggle}
            hideLabel={
              <>
                <EyeClosed /> Hide
              </>
            }
            showLabel={
              <>
                <Eye /> Show
              </>
            }
            hideTitle="Hide Hover Info"
            showTitle="Show Hover Info"
          />
        </LayerControlSection>
        <LayerControlSection title="basemap">
          <SettingToggleButton
            active={visibility.basemap}
            toggle={() => handleLayerToggle(C3D_MapLayers.Basemap)}
            hideLabel={
              <>
                <EyeClosed /> Hide
              </>
            }
            showLabel={
              <>
                <Eye /> Show
              </>
            }
            hideTitle="Hide Basemap"
            showTitle="Show Basemap"
          />
          <SettingToggleButton
            active={basemapOpacity === 1}
            toggle={() => dispatch(toggleBasemapOpacity())}
            hideLabel={
              <>
                <CircleDashed />
                <span style={{ fontSize: 14 }}>Transparent</span>
              </>
            }
            showLabel={
              <>
                <Circle />
                <span style={{ fontSize: 14 }}>Opaque</span>
              </>
            }
            hideTitle="Transparent"
            showTitle="Opaque"
          />
        </LayerControlSection>
        <LayerControlSection title="custom layers">
          {customLayers.map((layer, index) => (
            <div
              key={layer.id}
              className="customLayers"
            >
              <SettingToggleButton
                active={layer.visible}
                toggle={() => dispatch(toggleCustomLayerVisibility(layer.id))}
                hideLabel={
                  <>
                    <EyeClosed /> {layer.name}
                  </>
                }
                showLabel={
                  <>
                    <Eye /> {layer.name}
                  </>
                }
                hideTitle={`Hide ${layer.name}`}
                showTitle={`Show ${layer.name}`}
              />
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => {
                    if (index > 0) {
                      dispatch(reorderCustomLayers({ startIndex: index, endIndex: index - 1 }));
                    }
                  }}
                  className="reorderCustomLayer"
                  title="Move Up"
                  disabled={index === 0}
                  style={{ opacity: index === 0 ? 0.5 : 1, cursor: index === 0 ? "default" : "pointer" }}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => {
                    if (index < customLayers.length - 1) {
                      dispatch(reorderCustomLayers({ startIndex: index, endIndex: index + 1 }));
                    }
                  }}
                  className="reorderCustomLayer"
                  title="Move Down"
                  disabled={index === customLayers.length - 1}
                  style={{ opacity: index === customLayers.length - 1 ? 0.5 : 1, cursor: index === customLayers.length - 1 ? "default" : "pointer" }}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => dispatch(removeCustomLayer(layer.id))}
                  className="removeCustomLayer"
                  title="Remove Layer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setIsAddLayerModalOpen(true)}
            style={{
              width: "100%",
              padding: "12px",
              background: "#3B3E5A",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Plus size={16} /> Add Layer
          </button>
        </LayerControlSection>
        <LayerControlSection title="buildings">
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
        <LayerControlSection title="roads">
          <LayerControlDropdown
            icon={<Waypoints />}
            name="Adr Yol"
            isLayerVisible={visibility.adrYol}
            toggleLayer={() => handleLayerToggle(C3D_MapLayers.AdrYol)}
          >
            <LayerControlFilter
              label="Type"
              typeList={types.adrYol}
              filters={filters.adrYol.tipi}
              filterKey={C3D_MapLayers.AdrYol}
              setFilters={handleFilterToggle}
            />
          </LayerControlDropdown>
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
          <LayerControlDropdown
            icon={<UtilityPole />}
            name="Armatur"
            isLayerVisible={visibility.armatur}
            toggleLayer={() => handleLayerToggle(C3D_MapLayers.Armatur)}
          ></LayerControlDropdown>
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
      </div>
    </>
  );
}
