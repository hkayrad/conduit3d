import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { COLORS, DEBOUNCE_TIME_MS, LAT_EXTENT_PADDING, LON_EXTENT_PADDING, MIN_ZOOM_THRESHOLD } from "../../../lib/constants";

import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { useHat } from "../../../lib/hooks";
import { useDirek } from "../../../lib/hooks";
import { useMapInteraction } from "../../../lib/hooks";

import { convertDeckGLToLatLonWithOffset, CreateLayer, hexToRgba, Logger } from "../../../lib/utils";

import { AmbientLight, DirectionalLight, FirstPersonView, FirstPersonViewport, Layer, LightingEffect, MapView, Viewport, WebMercatorViewport, type DeckProps } from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre, type StyleSpecification } from 'react-map-gl/maplibre';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";

import { selectMapState, setExtent, setFocusedView, setLastRefreshPosition, setViewState } from "./mapSlice";
import LayerControl from "./components/layerControl/LayerControl";
import DataComponent from "./components/data/DataComponent";
import MousePosition from "./components/mousePosition/MousePosition";
import Attribution from "./components/attribution/Attribution";
import HoverCard from "./components/hoverCard/HoverCard";
import FeatureInfo from "./components/featureInfo/FeatureInfo";
import ShortcutsInfo from "./components/shortcutsInfo/ShortcutsInfo";
import { C3D_MapViewType } from "../../../lib/enums";
import ViewToggle from "./components/viewToggle/ViewToggle";
import GlobalSearch from "./components/globalSearch/GlobalSearch";
//@ts-ignore
import StaticStreetView from "./components/streetView/StaticStreetView";
import DynmicStreetView from "./components/streetView/DynamicStreetView";
import { selectConfig } from "../../configSlice";
import MapSettings from "./components/mapSettings/MapSettings";
import FpsCounter from "../../shared/fpsCounter/FpsCounter";

/**
 * DeckglMap component renders the Deck.gl map with various layers and controls.
 * @component
 * @returns The rendered component
 */
export default function DeckglMap(): React.ReactNode {
    // Redux State
    const { visibility, selectedViewType, viewState, lastRefreshPosition, isWireframe, focusedView, filters } = useAppSelector(selectMapState);
    const { cartesian, firstPerson } = viewState;
    const config = useAppSelector(selectConfig);

    //@ts-ignore
    const adrBinaColor = config.ADR_BINA_COLOR ? hexToRgba(config.ADR_BINA_COLOR) : hexToRgba("#C8C8C8FF");
    const MAP_STYLE: StyleSpecification = useMemo(() => ({
        version: 8,
        sources: {
            "eskisehir": {
                type: "raster",
                tiles: [
                    `${import.meta.env.VITE_TILE_SERVER_URL}/eskisehir/{z}/{x}/{y}`,
                ],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
                bounds: [29.8, 38.3, 31.8, 40.1]
            },
            "erzurum": {
                type: "raster",
                tiles: [
                    `${import.meta.env.VITE_TILE_SERVER_URL}/erzurum/{z}/{x}/{y}`,
                ],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
                bounds: [39.5, 38.0, 42.5, 41.0]
            },
            "turkey": {
                type: "raster",
                tiles: [
                    `${import.meta.env.VITE_TILE_SERVER_URL}/turkey/{z}/{x}/{y}`,
                ],
                tileSize: 256,
                maxzoom: 12,
                attribution: "© OpenStreetMap contributors",
                bounds: [25.544799999999995, 36.0213296718736, 45.21067066650391, 42.4926]
            },
            "buildings": {
                type: "vector",
                scheme: "tms",
                tiles: [
                    "https://localhost/geoserver/gwc/service/tms/1.0.0/buildings:buildings@EPSG:900913@pbf/{z}/{x}/{y}.pbf"
                ],
                bounds: [25.670742, 35.7996524, 44.8299436, 42.1146586],
                minzoom: 0,
            },
            "adr_bina": {
                type: "vector",
                scheme: "tms",
                tiles: [
                    "https://localhost/geoserver/gwc/service/tms/1.0.0/buildings:adr_bina@EPSG:900913@pbf/{z}/{x}/{y}.pbf"
                ],
                bounds: [41.28019714355469, 39.89549255371094, 41.29623794555664, 39.90587615966797],
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
                    visibility: selectedViewType === C3D_MapViewType.Cartesian && visibility.basemap ? "visible" : "none"
                },
                maxzoom: 19
            },
            {
                id: "eskisehir-layer",
                type: "raster",
                source: "eskisehir",
                "source-layer": "eskisehir",
                layout: {
                    visibility: selectedViewType === C3D_MapViewType.Cartesian && visibility.basemap ? "visible" : "none"
                },
                maxzoom: 16
            },
            {
                id: "erzurum-layer",
                type: "raster",
                source: "erzurum",
                "source-layer": "erzurum",
                layout: {
                    visibility: selectedViewType === C3D_MapViewType.Cartesian && visibility.basemap ? "visible" : "none"
                },
                maxzoom: 16
            },
            {
                id: "buildings-layer",
                source: "buildings",
                "source-layer": "buildings",
                type: "fill-extrusion",
                minzoom: 0,
                maxzoom: 16,
                layout: {
                    visibility: selectedViewType === C3D_MapViewType.Cartesian && visibility.adrBina ? "visible" : "none"
                },
                paint: {
                    "fill-extrusion-color": `rgba(${adrBinaColor[0]}, ${adrBinaColor[1]}, ${adrBinaColor[2]}, 1)`,
                    "fill-extrusion-height": 12.5
                }
            },
            {
                id: "adr-bina-layer",
                source: "adr_bina",
                "source-layer": "adr_bina",
                type: "fill-extrusion",
                minzoom: 0,
                maxzoom: 16,
                layout: {
                    visibility: selectedViewType === C3D_MapViewType.Cartesian && visibility.adrBina ? "visible" : "none"
                },
                paint: {
                    "fill-extrusion-color": `rgba(${adrBinaColor[0]}, ${adrBinaColor[1]}, ${adrBinaColor[2]}, 1)`,
                    "fill-extrusion-height": 12.5
                }
            },
        ]
    }), [config.ADR_BINA_COLOR, selectedViewType, visibility.basemap, visibility.adrBina]);

    const ambientLight = new AmbientLight({
        color: [255, 255, 255],
        intensity: 1.85,
    })
    const directionalLight = new DirectionalLight({
        color: [255, 255, 255],
        intensity: 0.5,
        direction: [0, 0, -1],
    });
    const effects = useMemo(() => [new LightingEffect({ ambientLight, directionalLight })], []);

    // React-Router Hooks
    const location = useLocation();

    // Local State
    const [cursor, setCursor] = useState<string>("default");

    const widgets = useMemo(() => {
        const zoomWidget = new ZoomWidget({
            viewId: C3D_MapViewType.Cartesian,
        })
        const compassWidget = new CompassWidget({
            viewId: C3D_MapViewType.Cartesian,
        })

        return [zoomWidget, compassWidget];
    }, []);

    // GeoJSON Data States
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection[]>([]);
    const [buildingBina, setBuildingBina] = useState<GeoJSON.FeatureCollection[]>([]);
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
        setUndergroundLineWidth
    } = useHat();

    // Direk hook
    const {
        setAgDirek,
        setOgMusDirek,
        setAydDirek,
        direkLayerData,
        allPoles
    } = useDirek();

    // Map interaction hook
    const {
        showFpsCounter,
        activePopups,
        searchInputRef,
        mapViewState,
        setMapViewState,
        hoveredFeature,
        handleViewStateChange,
        mousePos,
        mouseLonLat,
        handleMouseMove,
        handleClick,
        handleClosePopup,
        handleFocusPopup,
        handleKeyPresses,
        flyTo
    } = useMapInteraction();

    // Memoized layers from the current data
    const layers: Layer[] = useMemo((): Layer[] => [
        ...CreateLayer.LocalTiles(
            C3D_MapViewType.Cartesian,
            visibility.basemap
        ),
        ...CreateLayer.LocalTiles(
            C3D_MapViewType.FirstPerson,
            visibility.basemap
        ),

        ...hatLayerData.flatMap(filteredHat =>
            filteredHat.map(hat =>
                CreateLayer.Hat(
                    `${hat.id}-layer`,
                    hat.data,
                    hat.color,
                    hexToRgba(config.HOVER_COLOR) || COLORS.HOVER,
                    hat.id.includes("HAVAİ") ? overgroundLineWidth : undergroundLineWidth,
                    selectedViewType === C3D_MapViewType.Cartesian ? (hat.visibility && cartesian.zoom >= 15) : hat.visibility,
                    hat.cinsi
                )
            )
        ),

        ...direkLayerData.flatMap(filteredData =>
            filteredData.map(direk =>
                CreateLayer.Direk(
                    `${direk.id}-layer`,
                    direk.data,
                    direk.color,
                    hexToRgba(config.HOVER_COLOR) || COLORS.HOVER,
                    selectedViewType === C3D_MapViewType.Cartesian ? (direk.visibility && cartesian.zoom >= 15) : direk.visibility,
                )
            )
        ),

        ...adrBina.map((chunk, index) => new GeoJsonLayer({
            id: `adr-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: isWireframe ? [0, 0, 0, 0] : hexToRgba(config.ADR_BINA_COLOR) || COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor: hexToRgba(config.HOVER_COLOR) || COLORS.HOVER,
            visible: selectedViewType === C3D_MapViewType.Cartesian ? (visibility.adrBina && cartesian.zoom >= 15) : visibility.adrBina,
            wireframe: isWireframe,
        })),

        ...buildingBina.map((chunk, index) => new GeoJsonLayer({
            id: `building-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: isWireframe ? [0, 0, 0, 0] : hexToRgba(config.ADR_BINA_COLOR) || COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor: hexToRgba(config.HOVER_COLOR) || COLORS.HOVER,
            visible: selectedViewType === C3D_MapViewType.Cartesian ? (visibility.adrBina && cartesian.zoom >= 15) : visibility.adrBina,
            wireframe: isWireframe,
        })),

        ...trafoBina.map((chunk, index) => new ColumnLayer({
            id: `trafo-bina-layer-${index}`,
            data: chunk.features,
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.yukseklik,
            getFillColor: isWireframe ? [0, 0, 0, 0] : hexToRgba(config.TRAFO_BINA_COLOR) || COLORS.TRAFO_BINA,
            extruded: true,
            pickable: !isWireframe,
            autoHighlight: true,
            highlightColor: hexToRgba(config.HOVER_COLOR) || COLORS.HOVER,
            radius: 1,
            elevationScale: 1,
            diskResolution: 4,
            filled: true,
            visible: selectedViewType === C3D_MapViewType.Cartesian ? (visibility.trafoBina && cartesian.zoom >= 15) : visibility.trafoBina,
            wireframe: isWireframe,
        })),
    ], [
        filters,
        visibility,
        isWireframe,
        hatLayerData,
        direkLayerData,
        adrBina,
        buildingBina,
        trafoBina,
        overgroundLineWidth,
        undergroundLineWidth,
        config
    ]);

    const layerFilter: DeckProps['layerFilter'] = useCallback(
        ({ layer, viewport }: { layer: Layer, viewport: Viewport }) => {
            if (layer.id.includes("basemap"))
                return layer.id.includes(viewport.id as string);

            return true;
        }, []);

    const views = useMemo(() => {
        if (selectedViewType === C3D_MapViewType.Cartesian) {
            return new MapView({
                id: C3D_MapViewType.Cartesian,
                // viewState: { ...mapViewState.cartesian },
                controller: true
            });
        }
        else if (selectedViewType === C3D_MapViewType.FirstPerson) {
            return new FirstPersonView({
                id: C3D_MapViewType.FirstPerson,
                // viewState: { ...mapViewState.firstPerson },
                controller: true,
                far: 10000,

            });
        }
        else {
            return null;
        }
    }, [selectedViewType, mapViewState]);

    // Update handler
    const handleUpdate = useCallback(() => {
        if (focusedView !== "deckgl")
            return;

        if (location.pathname !== "/")
            return;

        let viewport;

        if (selectedViewType === C3D_MapViewType.Cartesian) {
            viewport = new WebMercatorViewport({
                longitude: mapViewState.cartesian.longitude,
                latitude: mapViewState.cartesian.latitude,
                zoom: mapViewState.cartesian.zoom,
                pitch: mapViewState.cartesian.pitch,
                bearing: mapViewState.cartesian.bearing,
                width: window.innerWidth,
                height: window.innerHeight
            });

            dispatch(setViewState({
                viewId: C3D_MapViewType.Cartesian,
                viewState: {
                    ...mapViewState.cartesian,
                }
            }));
        }
        else if (selectedViewType === C3D_MapViewType.FirstPerson) {
            viewport = new FirstPersonViewport({
                longitude: mapViewState.firstPerson.longitude,
                latitude: mapViewState.firstPerson.latitude,
                pitch: mapViewState.firstPerson.pitch,
                bearing: mapViewState.firstPerson.bearing,
                position: mapViewState.firstPerson.position,
                width: window.innerWidth,
                height: window.innerHeight
            });

            dispatch(setViewState({
                viewId: C3D_MapViewType.FirstPerson,
                viewState: {
                    ...mapViewState.firstPerson,
                }
            }));
        }
        else
            return;

        const bounds = { ...viewport.getBounds() };

        if (lastRefreshPosition.longitude === null || lastRefreshPosition.latitude === null)
            dispatch(setExtent({
                extent: {
                    minX: bounds[0] - LON_EXTENT_PADDING,
                    minY: bounds[1] - LAT_EXTENT_PADDING,
                    maxX: bounds[2] + LON_EXTENT_PADDING,
                    maxY: bounds[3] + LAT_EXTENT_PADDING,
                }
            }));

        // // Threshold scales inversely with zoom level
        // // Higher zoom = smaller threshold (more frequent updates)
        // // Lower zoom = larger threshold (less frequent updates)
        // const baseThreshold = EXTENT_PADDING / 2;
        // const zoomFactor = Math.pow(2, 15 - mapViewState.cartesian.zoom); // Exponential scaling
        // const zoomBasedThreshold = baseThreshold * Math.max(1, Math.min(10, zoomFactor));
        // Logger.table({ baseThreshold, zoomFactor, zoomBasedThreshold })

        const currentPos = convertDeckGLToLatLonWithOffset(
            mapViewState.firstPerson.position![0],
            mapViewState.firstPerson.position![1],
            mapViewState.firstPerson.latitude!,
            mapViewState.firstPerson.longitude!
        );

        const deltaLonDistance = selectedViewType === C3D_MapViewType.Cartesian ?
            Math.abs(lastRefreshPosition.longitude - mapViewState[selectedViewType].longitude!) :
            Math.abs(lastRefreshPosition.longitude - currentPos.longitude);

        const deltaLatDistance = selectedViewType === C3D_MapViewType.Cartesian ?
            Math.abs(lastRefreshPosition.latitude - mapViewState[selectedViewType].latitude!) :
            Math.abs(lastRefreshPosition.latitude - currentPos.latitude);

        if (deltaLonDistance < LON_EXTENT_PADDING || deltaLatDistance < LAT_EXTENT_PADDING || mapViewState.cartesian.zoom < MIN_ZOOM_THRESHOLD) return;

        dispatch(setExtent({
            extent: {
                minX: bounds[0] - LON_EXTENT_PADDING,
                minY: bounds[1] - LAT_EXTENT_PADDING,
                maxX: bounds[2] + LON_EXTENT_PADDING,
                maxY: bounds[3] + LAT_EXTENT_PADDING,
            }
        }));

        if (selectedViewType === C3D_MapViewType.Cartesian)
            dispatch(setLastRefreshPosition({
                position: { longitude: mapViewState[selectedViewType].longitude!, latitude: mapViewState[selectedViewType].latitude! }
            }));
        else if (selectedViewType === C3D_MapViewType.FirstPerson)
            dispatch(setLastRefreshPosition({
                position: { longitude: currentPos.longitude, latitude: currentPos.latitude }
            }));
    }, [focusedView, location, mapViewState, selectedViewType, lastRefreshPosition]);

    const handleFirstPersonPan = () => {
        if (selectedViewType !== C3D_MapViewType.FirstPerson) return;
        if (focusedView !== "deckgl") return;

        dispatch(setViewState({
            viewId: C3D_MapViewType.FirstPerson,
            viewState: {
                ...viewState.firstPerson,
                bearing: mapViewState.firstPerson.bearing,
                pitch: mapViewState.firstPerson.pitch,
                position: mapViewState.firstPerson.position,
            }
        }))
    }

    // Add keyboard event listener
    useEffect(() => {
        const deckglContainer = document.getElementById("deckgl-wrapper");

        const keydownHandler = (e: KeyboardEvent) => {
            try {
                handleKeyPresses(e);
            } catch (error) {
                Logger.error('Error handling keypress:', error);
            }
        };

        const mousedownHandler = () => {
            try {
                dispatch(setFocusedView("deckgl"));
            } catch (error) {
                Logger.error('Error setting focused view:', error);
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
                }
            }));
        }
    }, [firstPerson, focusedView]);

    // Adjust line widths based on zoom level or camera height
    useEffect(() => {
        if (selectedViewType === C3D_MapViewType.Cartesian) {
            setOvergroundLineWidth(Number(Math.max((23.5 - mapViewState.cartesian.zoom) / 10, 0.01).toFixed(4)));
            setUndergroundLineWidth(Number(Math.max((23.5 - mapViewState.cartesian.zoom) / 10, 0.01).toFixed(4)));
        }
        else if (selectedViewType === C3D_MapViewType.FirstPerson) {
            setOvergroundLineWidth(3);

            // New underground line width algorithm based on camera height and distance
            const height = mapViewState.firstPerson.position![2];
            const baseWidth = 0.1;
            const maxWidth = 3;
            const minWidth = 0.01;

            // Exponential scaling for better visual perception
            const scaleFactor = Math.pow(height / 10, 0.7);
            const calculatedWidth = baseWidth * scaleFactor;

            setUndergroundLineWidth(Number(Math.max(Math.min(calculatedWidth, maxWidth), minWidth).toFixed(4)));
        }

    }, [mapViewState, selectedViewType]);

    // Handle view state changes
    useEffect(() => {
        const handler = setTimeout(() => {
            handleUpdate();
        }, DEBOUNCE_TIME_MS);

        handleFirstPersonPan();

        return () => clearTimeout(handler);
    }, [lastRefreshPosition, mapViewState, selectedViewType]);

    return (
        <>
            <Outlet context={{ flyTo }} />
            <div id="map-page" className={location.pathname !== "/" ? "hide" : ""}>
                <DataComponent
                    allPoles={allPoles}
                    setBuildingBina={setBuildingBina}
                    setAdrBina={setAdrBina}
                    setTrafoBina={setTrafoBina}
                    setAgDirek={setAgDirek}
                    setOgMusDirek={setOgMusDirek}
                    setAydDirek={setAydDirek}
                    setAgHat={setAgHat}
                    setOgHat={setOgHat}
                    setRekortman={setRekortman}
                />
                {/* Dynamically create the FeatureInfo components */}
                {activePopups.map(popup => (
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
                <DynmicStreetView />
                <LayerControl />
                <HoverCard
                    hoveredFeature={hoveredFeature}
                    mousePos={mousePos}
                />
                <ViewToggle />
                <ShortcutsInfo />
                <MousePosition mouseLonLat={mouseLonLat} />
                <Attribution />
                {showFpsCounter && (
                    <FpsCounter
                        position="top-left"
                        showDetails={true}
                    />
                )}
                <DeckGL
                    controller
                    views={views}
                    viewState={mapViewState[selectedViewType]}
                    onViewStateChange={({ viewId, viewState }) => handleViewStateChange(viewId as C3D_MapViewType, viewState)}
                    layers={layers}
                    layerFilter={layerFilter}
                    widgets={widgets}
                    onClick={handleClick}
                    onHover={handleMouseMove}
                    getCursor={(state) => {
                        setCursor(state.isDragging ? "grabbing" :
                            state.isHovering ? "pointer" : "default"
                        );
                        return "inherit"
                    }}
                    effects={effects}
                >
                    <MapLibre
                        mapStyle={MAP_STYLE}
                        reuseMaps
                        attributionControl={false}
                        maxZoom={25}
                        boxZoom={false}
                        cursor={cursor}
                    />
                </DeckGL>
            </div >
        </>
    );
}