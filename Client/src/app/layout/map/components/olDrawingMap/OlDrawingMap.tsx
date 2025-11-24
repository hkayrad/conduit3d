import "./style/olDrawingMap.scss";
import { useEffect, useRef, useState } from "react";
import OlMap from "ol/Map";
import { Circle, Activity, Hexagon, Trash2, Save } from "lucide-react";
import OlTileLayer from "ol/layer/Tile";
import OlVectorLayer from "ol/layer/Vector";
import OlOSM from "ol/source/OSM";
import OlVectorSource from "ol/source/Vector";
import OlView from "ol/View";
import { Draw, Modify, Snap } from "ol/interaction";
import type { C3D_LayerViewState, Config } from "../../../../../lib/types";
import type { Type } from "ol/geom/Geometry";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";

type Props = {
  isVisible: boolean;
  hatLayerData: any[];
  direkLayerData: any[];
  yolLayerData: any[];
  adrBina: GeoJSON.FeatureCollection[];
  buildingBina: GeoJSON.FeatureCollection[];
  trafoBina: GeoJSON.FeatureCollection[];
  visibility: C3D_LayerViewState;
  config: Config;
};

type DrawingMode = "Point" | "LineString" | "Polygon" | "None";

// Helper functions
const generateRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;


const normalizeGeoJSONData = (data: any) => {
  if (!data) return null;

  // If data is an array, wrap it in a FeatureCollection
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: data,
    };
  }

  // If data already has a features property, use it as-is
  if (data.features) {
    if (data.features.length === 0) return null;
    return data;
  }

  // Otherwise, assume it's already a valid GeoJSON object
  return data;
};

const normalizeColor = (color: string | [number, number, number, number]): string => {
  if (Array.isArray(color)) {
    // Convert [r, g, b, a] to rgba string
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
  }
  return color;
};

const createVectorLayer = (
  data: any,
  color: string | [number, number, number, number],
  width: number = 2,
  isPoint: boolean = false,
): OlVectorLayer<OlVectorSource> | null => {
  const geojsonData = normalizeGeoJSONData(data);
  if (!geojsonData) return null;

  const olColor = normalizeColor(color);

  const vectorSource = new OlVectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });

  const style = isPoint
    ? new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: olColor }),
        stroke: new Stroke({ color: "#fff", width: 1 }),
      }),
    })
    : new Style({
      stroke: new Stroke({
        color: olColor,
        width: width,
      }),
      fill: new Fill({
        color: olColor,
      }),
    });

  const vectorLayer = new OlVectorLayer({
    source: vectorSource,
    style: style,
  });
  vectorLayer.setProperties({ isDataLayer: true });
  return vectorLayer;
};

const createBuildingLayer = (
  data: any,
  hexColor: string,
): OlVectorLayer<OlVectorSource> | null => {
  const layer = createVectorLayer(data, hexColor, 2);
  if (!layer) return null;

  // Darken the color for fill
  const r = Math.floor(parseInt(hexColor.slice(1, 3), 16) * 0.7);
  const g = Math.floor(parseInt(hexColor.slice(3, 5), 16) * 0.7);
  const b = Math.floor(parseInt(hexColor.slice(5, 7), 16) * 0.7);
  const darkenedColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

  // Override style for buildings with semi-transparent fill
  layer.setStyle(
    new Style({
      stroke: new Stroke({
        color: hexColor,
        width: 2,
      }),
      fill: new Fill({
        color: darkenedColor,
      }),
    }),
  );
  return layer;
};

export default function OlDrawingMap(props: Props) {
  const {
    isVisible,
    hatLayerData,
    direkLayerData,
    yolLayerData,
    adrBina,
    buildingBina,
    trafoBina,
    visibility,
    config,
  } = props;

  const olContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<OlMap | null>(null);
  const sourceRef = useRef<OlVectorSource>(new OlVectorSource());
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("None");
  const [hasFeatures, setHasFeatures] = useState(false);

  // Initialize OpenLayers map
  useEffect(() => {
    if (olContainerRef.current === null) return;

    const vectorLayer = new OlVectorLayer({
      source: sourceRef.current,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffcc33",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#ffcc33",
      },
    });

    const map = new OlMap({
      target: olContainerRef.current,
      layers: [
        new OlTileLayer({
          source: new OlOSM({
            // Performance optimizations
            transition: 0, // Disable tile fade-in animation
            cacheSize: 512, // Limit tile cache
          }),
          // Reduce render buffer to improve performance
          properties: {
            preload: 0,
          },
        }),
        vectorLayer,
      ],
      view: new OlView({
        center: [4595997.358926718, 4851468.48885042],
        projection: "EPSG:3857",
        zoom: 15,
        // Performance: disable smooth animations
        enableRotation: false,
      }),
      // Performance: limit max tiles in viewport
      maxTilesLoading: 8,
    });

    mapRef.current = map;

    // Listen to source changes to update hasFeatures
    const updateFeatureState = () => {
      setHasFeatures(sourceRef.current.getFeatures().length > 0);
    };

    sourceRef.current.on(
      ["addfeature", "removefeature", "clear"],
      updateFeatureState,
    );

    return () => {
      map.setTarget(undefined);
      sourceRef.current.un(
        ["addfeature", "removefeature", "clear"],
        updateFeatureState,
      );
    };
  }, []);

  // Manage interactions based on drawingMode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing interactions to avoid duplicates
    map.getInteractions().forEach((interaction) => {
      if (
        interaction instanceof Draw ||
        interaction instanceof Modify ||
        interaction instanceof Snap
      ) {
        map.removeInteraction(interaction);
      }
    });

    // Always add Modify and Snap
    const modify = new Modify({ source: sourceRef.current });
    map.addInteraction(modify);

    if (drawingMode !== "None") {
      const draw = new Draw({
        source: sourceRef.current,
        type: drawingMode as Type,
      });

      draw.on("drawstart", () => {
        sourceRef.current.clear();
      });

      draw.on("drawend", () => {
        setTimeout(() => {
          setDrawingMode("None");
        }, 0);
      });

      map.addInteraction(draw);
    }

    const snap = new Snap({ source: sourceRef.current });
    map.addInteraction(snap);

    return () => {
      // Cleanup interactions on mode change or unmount
      map.getInteractions().forEach((interaction) => {
        if (
          interaction instanceof Draw ||
          interaction instanceof Modify ||
          interaction instanceof Snap
        ) {
          map.removeInteraction(interaction);
        }
      });
    };
  }, [drawingMode]);

  // Render data layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing data layers (keep base layer and drawing layer)
    const layersToRemove: any[] = [];
    map.getLayers().forEach((layer) => {
      const properties = layer.getProperties();
      if (properties.isDataLayer) {
        layersToRemove.push(layer);
      }
    });
    layersToRemove.forEach((layer) => map.removeLayer(layer));

    // Helper to add layers from grouped data
    const addLayersFromGroups = (
      groups: any[][],
      width: number,
      isPoint: boolean = false,
    ) => {
      groups.forEach((group) => {
        group.forEach((layer: any) => {
          if (layer.visibility) {
            const color = layer.color || generateRandomColor();
            const vectorLayer = createVectorLayer(layer.data, color, width, isPoint);
            if (vectorLayer) map.addLayer(vectorLayer);
          }
        });
      });
    };

    // Helper to add building layers
    const addBuildingLayers = (
      chunks: GeoJSON.FeatureCollection[],
      configColor: string | undefined,
    ) => {
      chunks.forEach((chunk) => {
        const hexColor = configColor || generateRandomColor();
        const layer = createBuildingLayer(chunk, hexColor);
        if (layer) map.addLayer(layer);
      });
    };

    // Add layers in order (bottom to top)
    if (yolLayerData) {
      // 1. Roads (Yol)
      addLayersFromGroups(yolLayerData, 4);

      // 2. Buildings (Bina)
      if (visibility.adrBina) {
        addBuildingLayers(adrBina, config.ADR_BINA_COLOR);
        addBuildingLayers(buildingBina, config.ADR_BINA_COLOR);
      }
      if (visibility.trafoBina) {
        addBuildingLayers(trafoBina, config.TRAFO_BINA_COLOR);
      }

      // 3. Power Lines (Hat)
      addLayersFromGroups(hatLayerData, 2);

      // 4. Poles (Direk)
      if (direkLayerData) {
        addLayersFromGroups(direkLayerData, 2, true);
      }
    }
  }, [
    hatLayerData,
    direkLayerData,
    yolLayerData,
    adrBina,
    buildingBina,
    trafoBina,
    visibility,
    config,
  ]);

  return (
    <div
      id="openlayers-map"
      className={!isVisible ? "openlayers-hidden" : ""}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div className="ol-drawing-map-controls">
        <div className="drawing-group">
          <button
            onClick={() =>
              setDrawingMode((prev) => (prev === "Point" ? "None" : "Point"))
            }
            className={drawingMode === "Point" ? "active" : ""}
            title="Point"
          >
            <Circle size={20} />
          </button>
          <button
            onClick={() =>
              setDrawingMode((prev) =>
                prev === "LineString" ? "None" : "LineString",
              )
            }
            className={drawingMode === "LineString" ? "active" : ""}
            title="LineString"
          >
            <Activity size={20} />
          </button>
          <button
            onClick={() =>
              setDrawingMode((prev) =>
                prev === "Polygon" ? "None" : "Polygon",
              )
            }
            className={drawingMode === "Polygon" ? "active" : ""}
            title="Polygon"
          >
            <Hexagon size={20} />
          </button>
        </div>
        <button
          onClick={() => sourceRef.current.clear()}
          className="clear-btn"
          title="Clear All"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={() => {
            // TODO: Implement save functionality
            console.log("Save clicked");
          }}
          title="Save"
          disabled={!hasFeatures}
        >
          <Save size={20} />
        </button>
      </div>
      <div
        id="ol-map"
        style={{ width: "100%", height: "100%" }}
        ref={olContainerRef}
      ></div>
    </div>
  );
}
