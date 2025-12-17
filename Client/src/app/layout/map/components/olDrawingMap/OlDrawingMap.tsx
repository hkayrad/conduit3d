import "./style/olDrawingMap.scss";
import { useRef, useState } from "react";

import { AdrBinaApi, TrafoBinaApi, AdrYolApi } from "../../../../../lib/api/buildings";
import { AgHatApi, OgHatApi, RekortmanApi } from "../../../../../lib/api/lines";
import { AgDirekApi, OgMusDirekApi, AydDirekApi } from "../../../../../lib/api/poles";
import { ArmaturApi } from "../../../../../lib/api/armatur";
import { geometryToWkb } from "../../../../../lib/utils/geometry/geometryToWkb";
import type { AdrBina, AdrYol, Hat, Rekortman, Direk, Armatur, TrafoBina } from "../../../../../lib/types";
import InfoContent from "../../../../shared/infoContent/InfoContent";
import SaveFeatureModal from "./components/SaveFeatureModal";
import type { C3D_LayerViewState, Config, GeoTiffLayer } from "../../../../../lib/types";
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
  customLayers: any[];
  geoTiffLayers: GeoTiffLayer[];
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
    customLayers,
    geoTiffLayers,
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
    customLayers,
    geoTiffLayers,
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
      setIsModalOpen(true);
    } else if (modified.length > 0) {
      console.log("Saving modified features is not yet implemented on backend for update.");
    }
  };

  const handleModalSave = async (featureType: string, data: any) => {
    const { new: newFeatures } = getModifiedFeatures();
    if (newFeatures.length === 0) return;

    const feature = newFeatures[0]; // Taking the first one for now
    const geometry = feature.getGeometry();

    if (!geometry) return;

    const wkb = geometryToWkb(geometry);

    console.log(`Saving ${featureType} - Raw Data:`, data);

    try {
      switch (featureType) {
        case "AdrBina":
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
          await AdrBinaApi.create(newBuilding);
          break;
        case "TrafoBina":
          const newTrafo: Partial<TrafoBina> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            wkb: wkb as any
          };
          await TrafoBinaApi.create(newTrafo);
          break;
        case "AdrYol":
          const newYol: Partial<AdrYol> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            genislik: Number(data.genislik || 0),
            seritSayisi: Number(data.serit_sayisi || 0),
            yapisi: data.yapisi || "",
            tipi: data.tipi || "",
            wkb: wkb as any
          };
          await AdrYolApi.create(newYol);
          break;
        case "AgHat":
          const newAgHat: Partial<Hat> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            cinsi: data.cinsi || "",
            kesit: data.kesit || "",
            tipi: data.tipi || "",
            wkb: wkb as any
          };
          await AgHatApi.create(newAgHat);
          break;
        case "OgHat":
          const newOgHat: Partial<Hat> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            cinsi: data.cinsi || "",
            kesit: data.kesit || "",
            tipi: data.tipi || "",
            wkb: wkb as any
          };
          await OgHatApi.create(newOgHat);
          break;
        case "Rekortman":
          const newRekortman: Partial<Rekortman> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            kesit: data.kesit || "",
            tipi: data.tipi || "",
            wkb: wkb as any
          };
          await RekortmanApi.create(newRekortman);
          break;
        case "AgDirek":
          const newAgDirek: Partial<Direk> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            cinsi: data.cinsi || "",
            tipi: data.tipi || "",
            direkNo: data.direk_no || "",
            boyOzellik: data.boy_ozellik || "",
            direkBoyId: Number(data.direk_boy_id || 0),
            wkb: wkb as any
          };
          await AgDirekApi.create(newAgDirek);
          break;
        case "OgMusDirek":
          const newOgMusDirek: Partial<Direk> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            cinsi: data.cinsi || "",
            tipi: data.tipi || "",
            direkNo: data.direk_no || "",
            boyOzellik: data.boy_ozellik || "",
            direkBoyId: Number(data.direk_boy_id || 0),
            wkb: wkb as any
          };
          await OgMusDirekApi.create(newOgMusDirek);
          break;
        case "AydDirek":
          const newAydDirek: Partial<Direk> = {
            adi: data.adi || "",
            kodu: data.kodu || "",
            cinsi: data.cinsi || "",
            tipi: data.tipi || "",
            direkNo: data.direk_no || "",
            boyOzellik: data.boy_ozellik || "",
            direkBoyId: Number(data.direk_boy_id || 0),
            wkb: wkb as any
          };
          await AydDirekApi.create(newAydDirek);
          break;
        case "Armatur":
          // Armatur might need specific fields, but assuming generic for now based on modal
          const newArmatur: Partial<Armatur> = {
            // Armatur specific fields if any in modal, otherwise just wkb and relations
            // Looking at SaveFeatureModal, Armatur is not explicitly listed in FEATURE_TYPES or FIELD_SCHEMAS
            // If it's added later, we handle it here.
            // For now, let's assume it might be treated as a point if added.
            wkb: wkb as any
          };
          await ArmaturApi.create(newArmatur);
          break;
        default:
          console.warn(`Unknown feature type: ${featureType}`);
          return;
      }

      console.log(`${featureType} saved successfully`);
      setIsModalOpen(false);
      setDrawingMode("None");
      clearFeatures();
      props.onRefresh();
    } catch (error) {
      console.error(`Failed to save ${featureType}`, error);
    }
  };

  const handleDelete = async () => {
    if (selectedFeatures.length === 0) return;

    for (const feature of selectedFeatures) {
      const properties = feature.getProperties();
      const id = properties.id;
      const entityType = properties.entityType || properties.dataType; // Fallback to dataType if entityType missing

      if (id) {
        try {
          switch (entityType) {
            case "AdrBina":
            case "building": // Fallback
              await AdrBinaApi.delete(id);
              break;
            case "TrafoBina":
            case "trafo": // Fallback
              await TrafoBinaApi.delete(id);
              break;
            case "AdrYol":
            case "road": // Fallback
              await AdrYolApi.delete(id);
              break;
            case "AgHat":
              await AgHatApi.delete(id);
              break;
            case "OgHat":
              await OgHatApi.delete(id);
              break;
            case "Rekortman":
              await RekortmanApi.delete(id);
              break;
            case "AgDirek":
              await AgDirekApi.delete(id);
              break;
            case "OgMusDirek":
              await OgMusDirekApi.delete(id);
              break;
            case "AydDirek":
              await AydDirekApi.delete(id);
              break;
            case "Armatur":
            case "armatur": // Fallback
              await ArmaturApi.delete(id);
              break;
            default:
              console.warn(`Unknown entity type for deletion: ${entityType}`);
              continue;
          }
          console.log(`Deleted feature ${id} of type ${entityType}`);
        } catch (error) {
          console.error(`Failed to delete feature ${id} of type ${entityType}`, error);
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
