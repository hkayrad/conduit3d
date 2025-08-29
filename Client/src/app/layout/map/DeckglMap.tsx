import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { DeckGL } from "@deck.gl/react"
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useAppSelector } from "../../../lib/hooks/reduxHooks"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, MapView, WebMercatorViewport, type MapViewState, type PickingInfo } from "@deck.gl/core";
import { selectMapState, setExtent, setViewState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import { ColumnLayer, GeoJsonLayer } from "deck.gl"
import { CreateLayer } from "../../../lib/utils/createLayer"
import { COLORS } from "../../../lib/colors"
import DataComponent from "./data/DataComponent"
import { useHat } from "../../../lib/hooks/useHat"
import useDirek from "../../../lib/hooks/useDirek"
import MousePosition from "./mousePosition/MousePosition"
import Attribution from "./attribution/Attribution"
import { useSearchParams } from "react-router"
import { useDispatch } from "react-redux"
import HoverCard from "./hoverCard/HoverCard"
import FeatureInfo from "./featureInfo/FeatureInfo"

// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

const DEBOUNCE_TIME_MS = 500;

type PopupState = {
    id: string;
    info: PickingInfo;
    zIndex: number;
}

export default function DeckglMap() {
    const dispatch = useDispatch();

    var [searchParams, setSearchParams] = useSearchParams();

    const [mapViewState, setMapViewState] = useState<MapViewState>({
        longitude: searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : 41.287,
        latitude: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 39.9,
        zoom: searchParams.get("z") ? parseFloat(searchParams.get("z")!) : 15,
        maxZoom: 25,
        pitch: searchParams.get("p") ? parseFloat(searchParams.get("p")!) : 60,
        bearing: searchParams.get("b") ? parseFloat(searchParams.get("b")!) : 0
    });

    const [lineWidth, setLineWidth] = useState<number>(1);
    const { visibility, filters, types } = useAppSelector(selectMapState);

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

    const { hatLayerData } = useHat(
        agHat,
        ogHat,
        rekortman,
        types,
        filters,
        visibility);

    const { direkLayerData, allPoles } = useDirek(
        agDirek,
        ogMusDirek,
        aydDirek,
        types,
        filters,
        visibility);

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

    const handleViewStateChange = useCallback((viewState: MapViewState) => {
        setMapViewState(viewState);
        setLineWidth(Number(Math.max((23.5 - viewState.zoom) / 10, 0.01).toFixed(4)));
    }, []);

    const handleMouseMove = useCallback((info: PickingInfo) => {
        setHoveredFeature(info.object);
        setMousePos({ x: info.x, y: info.y });
        setMouseLonLat(info.coordinate ? info.coordinate : [0, 0]);
    }, []);

    const handleClick = useCallback((info: PickingInfo) => {
        if (info.object) {
            const id = Math.random().toString(36).substring(2, 9);
            zIndexCounter.current += 1;
            const newPopup: PopupState = {
                id: `popup-${id}`,
                info: info,
                zIndex: zIndexCounter.current
            };
            setActivePopups(prev => [...prev, newPopup]);
        }
    }, []);

    const handleClosePopup = useCallback((id: string) => {
        setActivePopups(prev => prev.filter(popup => popup.id !== id));
    }, []);

    const handleFocusPopup = useCallback((id: string) => {
        const maxZIndex = Math.max(...activePopups.map(p => p.zIndex));
        const focusedPopup = activePopups.find(p => p.id === id);

        // Only update if the focused popup is not already on top
        if (focusedPopup && focusedPopup.zIndex < maxZIndex) {
            zIndexCounter.current += 1;
            setActivePopups(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, zIndex: zIndexCounter.current } : p
                )
            );
        }
    }, [activePopups]);

    const handleKeyPresses = useCallback((e: KeyboardEvent) => {
        if (e.key === "Delete" && e.ctrlKey) {
            e.preventDefault();
            setActivePopups([]);
        }
    }, [])

    useEffect(() => {
        document.addEventListener("keypress", (e) => handleKeyPresses(e));
    }, []);

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
                {activePopups.map(popup => (
                    <FeatureInfo
                        key={popup.id}
                        info={popup.info}
                        zIndex={popup.zIndex}
                        onFocus={() => handleFocusPopup(popup.id)}
                        onClose={() => handleClosePopup(popup.id)}
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
                    widgets={[new ZoomWidget(), new CompassWidget({})]}
                    onClick={handleClick}
                    onHover={handleMouseMove}
                >
                    <MapLibre
                        reuseMaps
                        // mapStyle={mapState.visibility.basemap ? MAP_STYLE : undefined}
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