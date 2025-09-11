import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { COLORS, DEBOUNCE_TIME_MS, MAX_ZOOM } from "../../../lib/constants";

import type { C3D_ViewState, PopupState } from "../../../lib/types";

import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { useHat } from "../../../lib/hooks";
import { useDirek } from "../../../lib/hooks";
import { useMapInteraction } from "../../../lib/hooks";

import { CreateLayer } from "../../../lib/utils";
import { flyToFeature } from "../../../lib/utils";

import { FirstPersonView, FirstPersonViewport, Layer, MapView, Viewport, WebMercatorViewport, type DeckProps } from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { selectMapState, setExtent, setSelectedViewType, setViewState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import DataComponent from "./data/DataComponent";
import MousePosition from "./mousePosition/MousePosition";
import Attribution from "./attribution/Attribution";
import HoverCard from "./hoverCard/HoverCard";
import FeatureInfo from "./featureInfo/FeatureInfo";
import ShortcutsInfo from "./shortcutsInfo/ShortcutsInfo";
import { C3D_MapViewType } from "../../../lib/enums";
import ViewToggle from "./viewToggle/ViewToggle";

/**
 * DeckglMap component renders the Deck.gl map with various layers and controls.
 * @component
 * @returns The rendered component
 */
export default function DeckglMap(): React.ReactNode {
    // Redux State
    const { visibility, filters, types, selectedViewType, viewState } = useAppSelector(selectMapState);
    const { cartesian, firstPerson } = viewState;

    // React-Router State
    var [searchParams, setSearchParams] = useSearchParams();

    // Refs
    const zIndexCounter = useRef(1000);

    // Local State
    const [mapViewState, setMapViewState] = useState<C3D_ViewState>({
        [C3D_MapViewType.Cartesian]: {
            longitude: searchParams.get("cLon") ? parseFloat(searchParams.get("cLon")!) : cartesian.longitude,
            latitude: searchParams.get("cLat") ? parseFloat(searchParams.get("cLat")!) : cartesian.latitude,
            zoom: searchParams.get("cZ") ? parseFloat(searchParams.get("cZ")!) : cartesian.zoom,
            maxZoom: MAX_ZOOM,
            pitch: searchParams.get("cP") ? parseFloat(searchParams.get("cP")!) : cartesian.pitch,
            bearing: searchParams.get("cB") ? parseFloat(searchParams.get("cB")!) : cartesian.bearing
        },
        [C3D_MapViewType.FirstPerson]: {
            longitude: searchParams.get("fpLon") ? parseFloat(searchParams.get("fpLon")!) : firstPerson.longitude,
            latitude: searchParams.get("fpLat") ? parseFloat(searchParams.get("fpLat")!) : firstPerson.latitude,
            pitch: searchParams.get("fpP") ? parseFloat(searchParams.get("fpP")!) : firstPerson.pitch,
            bearing: searchParams.get("fpB") ? parseFloat(searchParams.get("fpB")!) : firstPerson.bearing,
            position: [0, 0, 3],
        }
    });

    // GeoJSON Data States
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection>(null!);

    const [overgroundLineWidth, setOvergroundLineWidth] = useState<number>(1);
    const [undergroundLineWidth, setUndergroundLineWidth] = useState<number>(1);
    const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);

    const [activePopups, setActivePopups] = useState<PopupState[]>([]);

    const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [mouseLonLat, setMouseLonLat] = useState<number[]>([0, 0]);

    // Redux hooks
    const dispatch = useAppDispatch();

    // Hat hook
    const { hatLayerData } = useHat(
        agHat,
        ogHat,
        rekortman,
        types,
        filters,
        visibility,
    );

    // Direk hook
    const { direkLayerData, allPoles } = useDirek(
        agDirek,
        ogMusDirek,
        aydDirek,
        types,
        filters,
        visibility);

    // Map interaction hook
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
        setHoveredFeature,
        setMousePos,
        setMouseLonLat,
        setActivePopups,
    );

    // Mmemoized layers from the current data
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
                    hat.id.includes("HAVAİ") ? overgroundLineWidth : undergroundLineWidth,
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
                    direk.visibility,
                )
            )
        ),

        new GeoJsonLayer({
            id: "adr-bina-layer",
            data: adrBina ?? { type: "FeatureCollection", features: [] },
            getElevation: (d) => d.properties.yukseklik,
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
            getElevation: d => d.properties.yukseklik,
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
    ], [
        filters,
        visibility,
        adrBina,
        trafoBina,
        agDirek,
        ogMusDirek,
        aydDirek,
        agHat,
        ogHat,
        rekortman,
        overgroundLineWidth,
        undergroundLineWidth,
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
                controller: true
            });
        }
        else {
            return null;
        }
    }, [selectedViewType, mapViewState]);

    // Fly to a given feature
    const flyTo = useCallback((
        feature: GeoJSON.Feature,
    ): void => {
        if (selectedViewType !== C3D_MapViewType.Cartesian)
            return;

        flyToFeature(feature, mapViewState.cartesian, setMapViewState);
    }, [mapViewState, selectedViewType])

    // Add keyboard event listener
    useEffect(() => {
        if (searchParams.has("viewType"))
            dispatch(setSelectedViewType(searchParams.get("viewType") as C3D_MapViewType))

        document.addEventListener("keypress", (e) => handleKeyPresses(e));

        return () => document.removeEventListener("keypress", (e) => handleKeyPresses(e));
    }, []);


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

                setSearchParams(
                    {
                        cLon: mapViewState.cartesian.longitude.toString(),
                        cLat: mapViewState.cartesian.latitude.toString(),
                        cZ: mapViewState.cartesian.zoom.toFixed(2),
                        cP: mapViewState.cartesian.pitch!.toFixed(2),
                        cB: mapViewState.cartesian.bearing!.toFixed(2),
                        viewType: selectedViewType
                    },
                    {
                        preventScrollReset: true,
                        replace: true
                    }
                );

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

                setSearchParams(
                    {
                        fpLon: mapViewState.firstPerson.longitude!.toString(),
                        fpLat: mapViewState.firstPerson.latitude!.toString(),
                        fpZ: "0",
                        fpP: mapViewState.firstPerson.pitch!.toFixed(2),
                        fpB: mapViewState.firstPerson.bearing!.toFixed(2),
                        viewType: selectedViewType
                    },
                    {
                        preventScrollReset: true,
                        replace: true
                    }
                );

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
    }, [mapViewState, selectedViewType]);

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
                <ShortcutsInfo />
                <ViewToggle />
                <DeckGL
                    controller
                    views={views}
                    viewState={mapViewState[selectedViewType]}
                    onViewStateChange={({ viewId, viewState }) => handleViewStateChange(viewId as C3D_MapViewType, viewState)}
                    layers={layers}
                    layerFilter={layerFilter}
                    widgets={selectedViewType === C3D_MapViewType.Cartesian ? [new ZoomWidget({}), new CompassWidget({})] : []}
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
            </div >
        </>
    );
}