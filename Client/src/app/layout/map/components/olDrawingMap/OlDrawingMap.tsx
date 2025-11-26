import "./style/olDrawingMap.scss";
import { useRef, useState } from "react";

import { AdrBinaApi } from "../../../../../lib/api/buildings";
import { geometryToWkb } from "../../../../../lib/utils/geometry/geometryToWkb";
import type { AdrBina } from "../../../../../lib/types";
import InfoContent from "../../../../shared/infoContent/InfoContent";
import SaveFeatureModal from "./components/SaveFeatureModal";
import type { C3D_LayerViewState, Config } from "../../../../../lib/types";
import { useOlDrawingMap } from "./hooks/useOlDrawingMap";
import DrawingControls from "./components/DrawingControls";

type Props = {
  isVisible: boolean;
  hatLayerData: any[];
  direkLayerData: any[];
  aydDirekData: any[];
  armaturLayerData: any[];
  yolLayerData: any[];
  adrBina: GeoJSON.FeatureCollection[];
  buildingBina: GeoJSON.FeatureCollection[];
  trafoBina: GeoJSON.FeatureCollection[];
  visibility: C3D_LayerViewState;
  config: Config;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onViewStateChange: (viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
  onRefresh: () => void;
};

export default function OlDrawingMap(props: Props) {
  const {
    isVisible,
    hatLayerData,
    direkLayerData,
    aydDirekData,
    armaturLayerData,
    yolLayerData,
    adrBina,
    buildingBina,
    trafoBina,
    visibility,
    config,
    viewState,
    onViewStateChange,
  } = props;

  const olContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    drawingMode,
    setDrawingMode,
    hasFeatures,
    hoverInfo,
    currentGeometryType,
    clearFeatures,
    getModifiedFeatures,
    selectedFeatures,
  } = useOlDrawingMap({
    olContainerRef,
    viewState,
    onViewStateChange,
    hatLayerData,
    direkLayerData,
    aydDirekData,
    armaturLayerData,
    yolLayerData,
    adrBina,
    buildingBina,
    trafoBina,
    visibility,
    config,
  });

  const handleSave = () => {
    const { modified, new: newFeatures } = getModifiedFeatures();
    console.log("Modified Features:", modified.map(f => ({
      id: f.get("id") || (f as any).ol_uid,
      properties: f.getProperties(),
      geometry: (f.getGeometry() as any)?.getCoordinates() // Simplified for logging
    })));
    console.log("New Features:", newFeatures.map(f => ({
      properties: f.getProperties(),
      geometry: (f.getGeometry() as any)?.getCoordinates()
    })));

    if (newFeatures.length > 0) {
      // For now, we only handle the first new feature for the modal
      // In a real app, we might want to handle multiple or loop through them
      // But the modal likely only handles one at a time or we need a different UI
      // Let's assume we just open the modal and when they save in the modal, we save the feature.
      // But wait, the modal is "SaveFeatureModal". It probably takes the feature details.
      // We need to pass the geometry to the modal or handle the save here if the modal just returns data.

      // Actually, looking at SaveFeatureModal usage (which I haven't seen fully but I see it being rendered),
      // it has an onSave prop.
      // Let's check SaveFeatureModal.tsx to see what it does.
      setIsModalOpen(true);
    } else if (modified.length > 0) {
      // Handle modified features update if needed (not requested yet, but good to note)
      console.log("Saving modified features is not yet implemented on backend for update.");
    }
  };

  const handleModalSave = async (_featureType: string, data: any) => {
    const { new: newFeatures } = getModifiedFeatures();
    if (newFeatures.length === 0) return;

    const feature = newFeatures[0]; // Taking the first one for now
    const geometry = feature.getGeometry();

    if (!geometry) return;

    const wkb = geometryToWkb(geometry);

    console.log("Saving AdrBina - Raw Data:", data);

    const newBuilding: Partial<AdrBina> = {
      adi: data.adi || "",
      siteAdi: data.site_adi || "",
      binaKatSayisi: Number(data.bina_kat_sayisi || 0),
      daireSayisi: Number(data.daire_sayisi || 0),
      isyeriSayisi: Number(data.isyeri_sayisi || 0),
      yukseklik: Number(data.yukseklik || 0),
      kodu: data.kodu || "",
      wkb: wkb as any
    };

    console.log("Saving AdrBina - Mapped Object:", newBuilding);

    try {
      await AdrBinaApi.create(newBuilding);
      console.log("Building saved successfully");
      setIsModalOpen(false);
      setDrawingMode("None");
      props.onRefresh();
    } catch (error) {
      console.error("Failed to save building", error);
    }
  };

  const handleDelete = async () => {
    if (selectedFeatures.length === 0) return;

    for (const feature of selectedFeatures) {
      const properties = feature.getProperties();
      const id = properties.id;
      if (id) {
        try {
          await AdrBinaApi.delete(id);
          console.log(`Deleted feature ${id}`);
        } catch (error) {
          console.error(`Failed to delete feature ${id}`, error);
        }
      }
    }
    setDrawingMode("None");
    props.onRefresh();
  };

  return (
    <div
      id="openlayers-map"
      className={!isVisible ? "openlayers-hidden" : ""}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <DrawingControls
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        hasFeatures={hasFeatures}
        onClear={clearFeatures}
        onSave={handleSave}
        onDelete={handleDelete}
        hasSelection={selectedFeatures.length > 0}
      />
      <SaveFeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        geometryType={currentGeometryType}
      />
      <div
        id="ol-map"
        style={{ width: "100%", height: "100%" }}
        ref={olContainerRef}
      ></div>
      {hoverInfo && (
        <div
          className="ol-hover-card"
          style={{
            left: hoverInfo.x,
            top: hoverInfo.y,
          }}
        >
          {hoverInfo.properties.dataType ? (
            <>
              <h3>
                <span>{hoverInfo.properties.dataType}</span>
              </h3>
              <div className="divider"></div>
            </>
          ) : (
            Object.keys(hoverInfo.properties).length > 1 && (
              <>
                <h3>
                  <span>Feature Details</span>
                </h3>
                <div className="divider"></div>
              </>
            )
          )}
          {InfoContent(hoverInfo.properties)}
        </div>
      )}
    </div>
  );
}
