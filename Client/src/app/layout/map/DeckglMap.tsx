import "@deck.gl/widgets/stylesheet.css";
import "deck.gl/stylesheet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style/deckglMap.css";

import { COLORS, DEBOUNCE_TIME_MS } from "../../../lib/constants";
import {
  useAppDispatch,
  useAppSelector,
  useYol,
  useHat,
  useDirek,
  useMap,
} from "../../../lib/hooks";
import { CreateLayer, hexToRgba, Logger } from "../../../lib/utils";
import { C3D_MapViewType } from "../../../lib/enums";

import {
  AmbientLight,
  DirectionalLight,
  Layer,
  LightingEffect,
} from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import {
  Map as MapLibre,
  type StyleSpecification,
} from "react-map-gl/maplibre";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";

import { selectMapState, setFocusedView } from "./mapSlice";
import { selectConfig } from "../../configSlice";
import LayerControl from "./components/layerControl/LayerControl";
import DataComponent from "./components/data/DataComponent";
import MousePosition from "./components/mousePosition/MousePosition";
import Attribution from "./components/attribution/Attribution";
import HoverCard from "./components/hoverCard/HoverCard";
import FeatureInfo from "./components/featureInfo/FeatureInfo";
import ShortcutsInfo from "./components/shortcutsInfo/ShortcutsInfo";
import ViewToggle from "./components/viewToggle/ViewToggle";
import GlobalSearch from "./components/globalSearch/GlobalSearch";
import DynamicStreetView from "./components/streetView/DynamicStreetView";
import MapSettings from "./components/mapSettings/MapSettings";
import FpsCounter from "../../shared/fpsCounter/FpsCounter";

/**
 * DeckglMap component renders the Deck.gl map with various layers and controls.
 * @component
 * @returns The rendered component
 */
export default function DeckglMap(): React.ReactNode {
  // Redux State
  const {
    visibility,
    selectedViewType,
    viewState,
    lastRefreshPosition,
    isWireframe,
    focusedView,
    basemapOpacity,
  } = useAppSelector(selectMapState);
  const { cartesian, firstPerson } = viewState;
  const config = useAppSelector(selectConfig);

  const adrBinaColor = config.ADR_BINA_COLOR
    ? hexToRgba(config.ADR_BINA_COLOR)
    : hexToRgba("#C8C8C8FF");
  const MAP_STYLE: StyleSpecification = useMemo(
    () => ({
      version: 8,
      sources: {
        eskisehir: {
          type: "raster",
          tiles: [
            `${import.meta.env.VITE_TILE_SERVER_URL}/eskisehir/{z}/{x}/{y}`,
          ],
          tileSize: 256,
          maxzoom: 16,
          attribution: "© OpenStreetMap contributors",
          bounds: [29.8, 38.3, 31.8, 40.1],
        },
        erzurum: {
          type: "raster",
          tiles: [
            `${import.meta.env.VITE_TILE_SERVER_URL}/erzurum/{z}/{x}/{y}`,
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
          bounds: [39.5, 38, 42.5, 41],
        },
        turkey: {
          type: "raster",
          tiles: [`${import.meta.env.VITE_TILE_SERVER_URL}/turkey/{z}/{x}/{y}`],
          tileSize: 256,
          maxzoom: 12,
          attribution: "© OpenStreetMap contributors",
          bounds: [
            25.544799999999995, 36.0213296718736, 45.21067066650391, 42.4926,
          ],
        },
        all_buildings: {
          type: "vector",
          scheme: "tms",
          tiles: [
            "https://localhost/geoserver/gwc/service/tms/1.0.0/buildings:all_buildings@EPSG:900913@pbf/{z}/{x}/{y}.pbf",
          ],
          bounds: [25.670742, 35.7996524, 44.8299436, 42.1146586],
          minzoom: 0,
        },
      },
      layers: [
        {
          id: "turkey-layer",
          type: "raster",
          source: "turkey",
          "source-layer": "turkey",
          layout: {
            visibility:
              selectedViewType === C3D_MapViewType.Cartesian &&
              visibility.basemap
                ? "visible"
                : "none",
          },
          maxzoom: 16,
        },
        {
          id: "eskisehir-layer",
          type: "raster",
          source: "eskisehir",
          "source-layer": "eskisehir",
          layout: {
            visibility:
              selectedViewType === C3D_MapViewType.Cartesian &&
              visibility.basemap
                ? "visible"
                : "none",
          },
          maxzoom: 16,
        },
        {
          id: "erzurum-layer",
          type: "raster",
          source: "erzurum",
          "source-layer": "erzurum",
          layout: {
            visibility:
              selectedViewType === C3D_MapViewType.Cartesian &&
              visibility.basemap
                ? "visible"
                : "none",
          },
          maxzoom: 16,
        },
        {
          id: "all_buildings-layer",
          source: "all_buildings",
          "source-layer": "all_buildings",
          type: "fill-extrusion",
          minzoom: 0,
          maxzoom: 16,
          layout: {
            visibility:
              selectedViewType === C3D_MapViewType.Cartesian &&
              visibility.adrBina
                ? "visible"
                : "none",
          },
          paint: {
            "fill-extrusion-color": `rgba(${adrBinaColor[0]}, ${adrBinaColor[1]}, ${adrBinaColor[2]}, 1)`,
            "fill-extrusion-height": 12.5,
          },
        },
      ],
    }),
    [selectedViewType, visibility.basemap, visibility.adrBina, adrBinaColor],
  );

  const ambientLight = useMemo(
    () =>
      new AmbientLight({
        color: [255, 255, 255],
        intensity: 1.85,
      }),
    [],
  );
  const directionalLight = useMemo(
    () =>
      new DirectionalLight({
        color: [255, 255, 255],
        intensity: 0.5,
        direction: [0, 0, -1],
      }),
    [],
  );
  const effects = useMemo(
    () => [new LightingEffect({ ambientLight, directionalLight })],
    [ambientLight, directionalLight],
  );

  // React-Router Hooks
  const location = useLocation();

  // GeoJSON Data States
  const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection[]>([]);
  const [buildingBina, setBuildingBina] = useState<GeoJSON.FeatureCollection[]>(
    [],
  );
  const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection[]>([]);

  // Redux hooks
  const dispatch = useAppDispatch();

  // Hat hook
  const {
    setAgHat,
    setOgHat,
    setRekortman,
    hatLayerData,
    overgroundLineWidth,
    undergroundLineWidth,
    setOvergroundLineWidth,
    setUndergroundLineWidth,
  } = useHat();

  // Direk hook
  const { setAgDirek, setOgMusDirek, setAydDirek, direkLayerData, allPoles } =
    useDirek();

  const { yolLayerData, setAdrYol } = useYol();

  // Map hook
  const {
    showFpsCounter,
    activePopups,
    searchInputRef,
    mapViewState,
    setMapViewState,
    hoveredFeature,
    selectedFeature,
    handleViewStateChange,
    mousePos,
    mouseLonLat,
    handleUpdate,
    views,
    layerFilter,
    handleMouseMove,
    handleFirstPersonDrag,
    handleClick,
    handleClosePopup,
    handleFocusPopup,
    handleKeyPresses,
    flyTo,
  } = useMap();

  // Memoized widgets
  const widgets = useMemo(() => {
    const zoomWidget = new ZoomWidget({
      viewId: C3D_MapViewType.Cartesian,
    });
    const compassWidget = new CompassWidget({
      viewId: C3D_MapViewType.Cartesian,
    });

    return [zoomWidget, compassWidget];
  }, []);

  // Memoized layers from the current data
  const layers: Layer[] = useMemo(
    (): Layer[] => [
      // ...CreateLayer.LocalTiles(C3D_MapViewType.Cartesian, visibility.basemap),
      // ...CreateLayer.LocalTiles(
      //   C3D_MapViewType.FirstPerson,
      //   visibility.basemap,
      // ),

      ...hatLayerData.flatMap((filteredHat) =>
        filteredHat.map((hat) =>
          CreateLayer.Hat(
            `${hat.id}-layer`,
            hat.data,
            hat.color,
            hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            hat.id.includes("HAVAİ")
              ? overgroundLineWidth
              : undergroundLineWidth,
            selectedViewType === C3D_MapViewType.Cartesian
              ? hat.visibility && cartesian.zoom >= 15
              : hat.visibility,
            hat.cinsi,
            selectedFeature,
          ),
        ),
      ),

      CreateLayer.OsmTiles(visibility.basemap, basemapOpacity),

      ...yolLayerData.flatMap((filteredYol) =>
        filteredYol.map((yol) =>
          CreateLayer.Yol(
            `${yol.id}-layer`,
            yol.data,
            yol.color,
            hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            0.5,
            selectedViewType === C3D_MapViewType.Cartesian
              ? yol.visibility && cartesian.zoom >= 15
              : yol.visibility,
            selectedFeature,
          ),
        ),
      ),

      ...direkLayerData.flatMap((filteredData) =>
        filteredData.map((direk) =>
          CreateLayer.Direk(
            `${direk.id}-layer`,
            direk.data,
            direk.color,
            hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            selectedViewType === C3D_MapViewType.Cartesian
              ? direk.visibility && cartesian.zoom >= 15
              : direk.visibility,
            isWireframe,
            selectedFeature,
          ),
        ),
      ),

      ...adrBina.map(
        (chunk, index) =>
          new GeoJsonLayer({
            id: `adr-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: (d) => {
              if (isWireframe) return [0, 0, 0, 0];
              const isSelected =
                selectedFeature &&
                d.properties?.id === selectedFeature.properties?.id;
              return isSelected
                ? hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER
                : hexToRgba(config.ADR_BINA_COLOR || "#ffffff") ||
                    COLORS.ADR_BINA;
            },
            filled: true,
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor:
              hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            visible:
              selectedViewType === C3D_MapViewType.Cartesian
                ? visibility.adrBina && cartesian.zoom >= 15
                : visibility.adrBina,
            wireframe: isWireframe,
            updateTriggers: {
              getFillColor: [
                selectedFeature,
                isWireframe,
                config.HOVER_COLOR,
                config.ADR_BINA_COLOR,
              ],
            },
          }),
      ),

      ...buildingBina.map(
        (chunk, index) =>
          new GeoJsonLayer({
            id: `building-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: (d) => {
              if (isWireframe) return [0, 0, 0, 0];
              const isSelected =
                selectedFeature &&
                d.properties?.id === selectedFeature.properties?.id;
              return isSelected
                ? hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER
                : hexToRgba(config.ADR_BINA_COLOR || "#ffffff") ||
                    COLORS.ADR_BINA;
            },
            filled: true,
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor:
              hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            visible:
              selectedViewType === C3D_MapViewType.Cartesian
                ? visibility.adrBina && cartesian.zoom >= 15
                : visibility.adrBina,
            wireframe: isWireframe,
            updateTriggers: {
              getFillColor: [
                selectedFeature,
                isWireframe,
                config.HOVER_COLOR,
                config.ADR_BINA_COLOR,
              ],
            },
          }),
      ),

      ...trafoBina.map(
        (chunk, index) =>
          new ColumnLayer({
            id: `trafo-bina-layer-${index}`,
            data: chunk.features,
            getPosition: (d) => d.geometry.coordinates,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: (d) => {
              if (isWireframe) return [0, 0, 0, 0];
              const isSelected =
                selectedFeature &&
                d.properties?.id === selectedFeature.properties?.id;
              return isSelected
                ? hexToRgba(config.HOVER_COLOR) || COLORS.HOVER
                : hexToRgba(config.TRAFO_BINA_COLOR || "#ffffff") ||
                    COLORS.TRAFO_BINA;
            },
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor:
              hexToRgba(config.HOVER_COLOR || "#ffffff") || COLORS.HOVER,
            radius: 1,
            elevationScale: 1,
            diskResolution: 4,
            filled: true,
            visible:
              selectedViewType === C3D_MapViewType.Cartesian
                ? visibility.trafoBina && cartesian.zoom >= 15
                : visibility.trafoBina,
            wireframe: isWireframe,
            updateTriggers: {
              getFillColor: [
                selectedFeature,
                isWireframe,
                config.HOVER_COLOR,
                config.TRAFO_BINA_COLOR,
              ],
            },
          }),
      ),
    ],
    [
      visibility,
      isWireframe,
      yolLayerData,
      hatLayerData,
      direkLayerData,
      adrBina,
      buildingBina,
      trafoBina,
      overgroundLineWidth,
      undergroundLineWidth,
      config,
      selectedFeature,
      basemapOpacity,
      cartesian.zoom,
      selectedViewType,
    ],
  );

  // Add keyboard event listener
  useEffect(() => {
    const deckglContainer = document.getElementById("deckgl-wrapper");

    const keydownHandler = (e: KeyboardEvent) => {
      try {
        handleKeyPresses(e);
      } catch (error) {
        Logger.error("Error handling keypress:", error);
      }
    };

    const mousedownHandler = () => {
      try {
        dispatch(setFocusedView("deckgl"));
      } catch (error) {
        Logger.error("Error setting focused view:", error);
      }
    };

    if (location.pathname === "/") {
      document.addEventListener("keydown", keydownHandler);
      deckglContainer?.addEventListener("mousedown", mousedownHandler);
    }

    return () => {
      document.removeEventListener("keydown", keydownHandler);
      deckglContainer?.removeEventListener("mousedown", mousedownHandler);
    };
  }, [location.pathname, handleKeyPresses, dispatch]);

  useEffect(() => {
    if (focusedView === "streetview") {
      setMapViewState((prev) => ({
        ...prev,
        [C3D_MapViewType.FirstPerson]: {
          ...prev.firstPerson,
          longitude: firstPerson.longitude,
          latitude: firstPerson.latitude,
          pitch: firstPerson.pitch,
          bearing: firstPerson.bearing,
          position: [0, 0, 3],
        },
      }));
    }
  }, [firstPerson, focusedView, setMapViewState]);

  // Adjust line widths based on zoom level or camera height
  useEffect(() => {
    if (selectedViewType === C3D_MapViewType.Cartesian) {
      setOvergroundLineWidth(
        Number(
          Math.max((23.5 - mapViewState.cartesian.zoom) / 10, 0.01).toFixed(4),
        ),
      );
      setUndergroundLineWidth(
        Number(
          Math.max((23.5 - mapViewState.cartesian.zoom) / 10, 0.005).toFixed(4),
        ),
      );
    } else if (selectedViewType === C3D_MapViewType.FirstPerson) {
      setOvergroundLineWidth(3);

      // New underground line width algorithm based on camera height and distance
      const height = mapViewState.firstPerson.position![2];
      const baseWidth = 2;
      const maxWidth = 30;
      const minWidth = 2;

      // Exponential scaling for better visual perception
      const scaleFactor = Math.pow(Math.abs(height) / 10, 0.7);
      const calculatedWidth = baseWidth * scaleFactor;

      setUndergroundLineWidth(
        Number(
          Math.max(Math.min(calculatedWidth, maxWidth), minWidth).toFixed(4),
        ),
      );
    }
  }, [
    mapViewState,
    selectedViewType,
    setOvergroundLineWidth,
    setUndergroundLineWidth,
  ]);

  // Handle view state changes
  useEffect(() => {
    const handler = setTimeout(() => {
      handleUpdate();
    }, DEBOUNCE_TIME_MS);

    handleFirstPersonDrag();

    return () => clearTimeout(handler);
  }, [lastRefreshPosition, mapViewState, selectedViewType]);

  return (
    <>
      <Outlet context={{ flyTo }} />
      <div id="map-page" className={location.pathname === "/" ? "" : "hide"}>
        <DataComponent
          allPoles={allPoles}
          setBuildingBina={setBuildingBina}
          setAdrBina={setAdrBina}
          setTrafoBina={setTrafoBina}
          setAdrYol={setAdrYol}
          setAgDirek={setAgDirek}
          setOgMusDirek={setOgMusDirek}
          setAydDirek={setAydDirek}
          setAgHat={setAgHat}
          setOgHat={setOgHat}
          setRekortman={setRekortman}
        />
        {/* Dynamically create the FeatureInfo components */}
        {activePopups.map((popup) => (
          <FeatureInfo
            key={popup.id}
            info={popup.info}
            zIndex={popup.zIndex}
            onFocus={() => handleFocusPopup(popup.id)}
            onClose={() => handleClosePopup(popup.id)}
            onFlyTo={() => flyTo(popup.info.object)}
          />
        ))}
        <GlobalSearch flyTo={flyTo} searchInputRef={searchInputRef} />
        <MapSettings />
        {/* <StaticStreetView /> */}
        <DynamicStreetView />
        <LayerControl />
        <HoverCard hoveredFeature={hoveredFeature} mousePos={mousePos} />
        <ViewToggle />
        <ShortcutsInfo />
        <MousePosition mouseLonLat={mouseLonLat} />
        <Attribution />
        {showFpsCounter && (
          <FpsCounter position="top-left" showDetails={true} />
        )}
        <DeckGL
          controller
          views={views}
          viewState={mapViewState[selectedViewType]}
          onViewStateChange={({ viewId, viewState }) =>
            handleViewStateChange(viewId as C3D_MapViewType, viewState)
          }
          layers={layers}
          layerFilter={layerFilter}
          widgets={widgets}
          onClick={handleClick}
          onHover={handleMouseMove}
          effects={effects}
        >
          <MapLibre
            mapStyle={MAP_STYLE}
            reuseMaps
            attributionControl={false}
            maxZoom={25}
            boxZoom={false}
          />
        </DeckGL>
      </div>
    </>
  );
}
