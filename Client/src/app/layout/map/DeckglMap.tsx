import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { COLORS, DEBOUNCE_TIME_MS, MAX_ZOOM } from "../../../lib/constants";

import type { PopupState } from "../../../lib/types";

import { useAppSelector } from "../../../lib/hooks";
import { useHat } from "../../../lib/hooks";
import { useDirek } from "../../../lib/hooks";
import { useMapInteraction } from "../../../lib/hooks";

import { CreateLayer } from "../../../lib/utils";
import { flyToFeature } from "../../../lib/utils";

import { Layer, MapView, WebMercatorViewport, type MapViewState } from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useSearchParams } from "react-router";
import { useDispatch } from "react-redux";

import { selectMapState, setExtent, setViewState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import DataComponent from "./data/DataComponent";
import MousePosition from "./mousePosition/MousePosition";
import Attribution from "./attribution/Attribution";
import HoverCard from "./hoverCard/HoverCard";
import FeatureInfo from "./featureInfo/FeatureInfo";

/**
 * DeckglMap component renders the Deck.gl map with various layers and controls.
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function DeckglMap(): JSX.Element {
    var [searchParams, setSearchParams] = useSearchParams();

    const dispatch = useDispatch();

    // Global Map State
    const { visibility, filters, types } = useAppSelector(selectMapState);

    const [mapViewState, setMapViewState] = useState<MapViewState>({
        longitude: searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : 41.287,
        latitude: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 39.9,
        zoom: searchParams.get("z") ? parseFloat(searchParams.get("z")!) : 15,
        maxZoom: MAX_ZOOM,
        pitch: searchParams.get("p") ? parseFloat(searchParams.get("p")!) : 60,
        bearing: searchParams.get("b") ? parseFloat(searchParams.get("b")!) : 0
    });

    const [lineWidth, setLineWidth] = useState<number>(1);

    // Map data
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection>(null!);

    const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);

    const [activePopups, setActivePopups] = useState<PopupState[]>([]);
    const zIndexCounter = useRef(1000);

    const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [mouseLonLat, setMouseLonLat] = useState<number[]>([0, 0]);

    // Formatted Hat Layer Data
    const { hatLayerData } = useHat(
        agHat,
        ogHat,
        rekortman,
        types,
        filters,
        visibility);

    // Formatted Direk Layer Data and All Poles
    const { direkLayerData, allPoles } = useDirek(
        agDirek,
        ogMusDirek,
        aydDirek,
        types,
        filters,
        visibility);

    // Map Interaction Handlers
    const { handleViewStateChange,
        handleMouseMove,
        handleClick,
        handleClosePopup,
        handleFocusPopup,
        handleKeyPresses
    } = useMapInteraction(
        zIndexCounter,
        activePopups,
        setMapViewState,
        setLineWidth,
        setHoveredFeature,
        setMousePos,
        setMouseLonLat,
        setActivePopups);

    // Create layers from the formatted data
    const layers: Layer[] = useMemo(() => [
        ...CreateLayer.LocalTiles(visibility.basemap),

        ...hatLayerData.flatMap(filteredHat =>
            filteredHat.map(hat =>
                CreateLayer.Hat(
                    `${hat.id}-layer`,
                    hat.data,
                    hat.color,
                    lineWidth,
                    hat.visibility,
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
                    direk.visibility
                )
            )
        ),

        new GeoJsonLayer({
            id: "adr-bina-layer",
            data: adrBina ?? { type: "FeatureCollection", features: [] },
            getElevation: (d) => d.properties.height,
            getFillColor: COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: visibility.adrBina,
        }),
        new ColumnLayer({
            id: "trafo-bina-layer",
            data: trafoBina ? trafoBina.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.TRAFO_BINA,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            radius: 1,
            elevationScale: 1,
            diskResolution: 4,
            visible: visibility.trafoBina,
        })
    ], [filters, visibility, adrBina, trafoBina, agDirek, ogMusDirek, aydDirek, agHat, ogHat, rekortman, lineWidth]);

    // Fly to a given feature
    const flyTo = useCallback((
        feature: GeoJSON.Feature,
    ) => {
        flyToFeature(feature, mapViewState, setMapViewState);
    }, [mapViewState])

    // Add keyboard event listener
    useEffect(() => {
        document.addEventListener("keypress", (e) => handleKeyPresses(e));
    }, []);

    // Handle view state changes
    useEffect(() => {
        const handler = setTimeout(() => {
            const viewport = new WebMercatorViewport({
                longitude: mapViewState.longitude,
                latitude: mapViewState.latitude,
                zoom: mapViewState.zoom,
                pitch: mapViewState.pitch,
                bearing: mapViewState.bearing,
                width: window.innerWidth,
                height: window.innerHeight
            })

            setSearchParams(
                {
                    lon: mapViewState.longitude.toString(),
                    lat: mapViewState.latitude.toString(),
                    z: mapViewState.zoom.toFixed(2),
                    p: mapViewState.pitch!.toFixed(2),
                    b: mapViewState.bearing!.toFixed(2),
                },
                {
                    preventScrollReset: true,
                    replace: true
                }
            );

            dispatch(setViewState({
                viewState: {
                    lon: mapViewState.longitude,
                    lat: mapViewState.latitude,
                    z: mapViewState.zoom,
                    p: mapViewState.pitch!,
                    b: mapViewState.bearing!
                }
            }));

            const bounds = { ...viewport.getBounds() };

            dispatch(setExtent({
                extent: {
                    minX: bounds[0] - .1,
                    minY: bounds[1] - .1,
                    maxX: bounds[2] + .1,
                    maxY: bounds[3] + .1,
                }
            }));
        }, DEBOUNCE_TIME_MS);

        return () => clearTimeout(handler);
    }, [mapViewState])

    return (
        <>
            <DataComponent
                allPoles={allPoles}
                setAdrBina={setAdrBina}
                setTrafoBina={setTrafoBina}
                setAgDirek={setAgDirek}
                setOgMusDirek={setOgMusDirek}
                setAydDirek={setAydDirek}
                setAgHat={setAgHat}
                setOgHat={setOgHat}
                setRekortman={setRekortman}
            />
            <div id="map-page">
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
                <LayerControl />
                <MousePosition mouseLonLat={mouseLonLat} />
                <HoverCard
                    hoveredFeature={hoveredFeature}
                    mousePos={mousePos}
                />
                <Attribution />
                <DeckGL
                    controller
                    views={new MapView()}
                    viewState={mapViewState}
                    onViewStateChange={(e) => handleViewStateChange(e.viewState as MapViewState)}
                    layers={layers}
                    widgets={[new ZoomWidget({}), new CompassWidget({})]}
                    onClick={handleClick}
                    onHover={handleMouseMove}
                >
                    <MapLibre
                        // mapStyle={MAP_STYLE[0]}
                        reuseMaps
                        attributionControl={false}
                        maxZoom={25}
                        boxZoom={false}
                        cursor={hoveredFeature ? "pointer" : "default"}
                    />
                </DeckGL>
            </div>
        </>
    );
}