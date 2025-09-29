import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { COLORS, DEBOUNCE_TIME_MS, LAT_EXTENT_PADDING, LON_EXTENT_PADDING, MIN_ZOOM_THRESHOLD } from "../../../lib/constants";

import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { useHat } from "../../../lib/hooks";
import { useDirek } from "../../../lib/hooks";
import { useMapInteraction } from "../../../lib/hooks";

import { CreateLayer } from "../../../lib/utils";

import { FirstPersonView, FirstPersonViewport, Layer, MapView, Viewport, WebMercatorViewport, type DeckProps } from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";

import { selectMapState, setExtent, setFocusedView, setLastRefreshPosition, setViewState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import DataComponent from "./data/DataComponent";
import MousePosition from "./mousePosition/MousePosition";
import Attribution from "./attribution/Attribution";
import HoverCard from "./hoverCard/HoverCard";
import FeatureInfo from "./featureInfo/FeatureInfo";
import ShortcutsInfo from "./shortcutsInfo/ShortcutsInfo";
import { C3D_MapViewType } from "../../../lib/enums";
import ViewToggle from "./viewToggle/ViewToggle";
import GlobalSearch from "./globalSearch/GlobalSearch";
//@ts-ignore
import StaticStreetView from "./streetView/StaticStreetView";
import DynmicStreetView from "./streetView/DynamicStreetView";


/**
 * DeckglMap component renders the Deck.gl map with various layers and controls.
 * @component
 * @returns The rendered component
 */
export default function DeckglMap(): React.ReactNode {
    // Redux State
    const { visibility, filters, selectedViewType, viewState, lastRefreshPosition, isWireframe, focusedView } = useAppSelector(selectMapState);
    const { firstPerson } = viewState;

    // React-Router Hooks
    const location = useLocation();

    // Refs

    // Local State
    const [debugBinaVisible, setDebugBinaVisible] = useState<boolean>(false);
    const [cursor, setCursor] = useState<string>("default");

    // const [agDirekWFS, setAgDirekWFS] = useState<GeoJSON.Feature[] | null>(null);
    // const [ogDirekWFS, setOgDirekWFS] = useState<GeoJSON.Feature[] | null>(null);
    // const [aydDirekWFS, setAydDirekWFS] = useState<GeoJSON.Feature[] | null>(null);
    // const [agHatWFS, setAgHatWFS] = useState<GeoJSON.Feature[] | null>(null);
    // const [ogHatWFS, setOgHatWFS] = useState<GeoJSON.Feature[] | null>(null);
    // const [aydHatWFS, setAydHatWFS] = useState<GeoJSON.Feature[] | null>(null);

    // useEffect(() => {
    //     const fetchAgDirekWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:ag_direk&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setAgDirekWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching AG Direk data:', error);
    //         }
    //     }

    //     const fetchOgDirekWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:og_direk&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setOgDirekWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching OG Direk data:', error);
    //         }
    //     }

    //     const fetchAydDirekWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:ayd_direk&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setAydDirekWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching Ayd Direk data:', error);
    //         }
    //     }

    //     const fetchAgHatWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:ag_hat&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setAgHatWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching AG Hat data:', error);
    //         }
    //     }

    //     const fetchOgHatWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:og_hat&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setOgHatWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching OG Hat data:', error);
    //         }
    //     }

    //     const fetchAydHatWFS = async () => {
    //         try {
    //             const response = await fetch(
    //                 "http://localhost:8080/geoserver/demoB/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demoB:ayd_hat&outputFormat=application/json&srsName=EPSG:4326"
    //             );
    //             const geojson = await response.json();
    //             setAydHatWFS(geojson.features || []);
    //         } catch (error) {
    //             console.error('Error fetching Ayd Hat data:', error);
    //         }
    //     }

    //     // fetchAgDirekWFS();
    //     // fetchOgDirekWFS();
    //     // fetchAydDirekWFS();
    //     // fetchAgHatWFS();
    //     // fetchOgHatWFS();
    //     // fetchAydHatWFS();
    // }, [])



    // GeoJSON Data States
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection[]>([]);
    const [buildingBina, setBuildingBin] = useState<GeoJSON.FeatureCollection[]>([]);
    const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection[]>([]);


    const [overgroundLineWidth, setOvergroundLineWidth] = useState<number>(1);
    const [undergroundLineWidth, setUndergroundLineWidth] = useState<number>(1);


    // Redux hooks
    const dispatch = useAppDispatch();

    // Hat hook
    const {
        setAgHat,
        setOgHat,
        setRekortman,
        hatLayerData
    } = useHat();

    // Direk hook
    const { 
        setAgDirek,
        setOgMusDirek,
        setAydDirek,
        direkLayerData, 
        allPoles } = useDirek();

    // Map interaction hook
    const {
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

        ...adrBina.map((chunk, index) => new GeoJsonLayer({
            id: `adr-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: isWireframe ? [0, 0, 0, 0] : COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: visibility.adrBina,
            wireframe: isWireframe,
        })),

        ...buildingBina.map((chunk, index) => new GeoJsonLayer({
            id: `building-bina-layer-${index}`,
            data: chunk,
            getElevation: (d) => d.properties.yukseklik,
            getFillColor: isWireframe ? [0, 0, 0, 0] : COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: debugBinaVisible,
            wireframe: isWireframe,
        })),

        // new ColumnLayer({
        //     id: 'ag-direk-layer-mvt',
        //     data: agDirekWFS ? agDirekWFS : [],
        //     getPosition: d => d.geometry.coordinates,
        //     getElevation: 10,
        //     getFillColor: COLORS.AG_DIREK,
        //     extruded: true,
        //     pickable: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     radius: .5,
        //     elevationScale: 1,
        //     visible: visibility.agDirek,
        // }),
        // new ColumnLayer({
        //     id: 'og-direk-layer-mvt',
        //     data: ogDirekWFS ? ogDirekWFS : [],
        //     getPosition: d => d.geometry.coordinates,
        //     getElevation: 10,
        //     getFillColor: COLORS.OG_MUS_DIREK,
        //     extruded: true,
        //     pickable: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     radius: .5,
        //     elevationScale: 1,
        //     visible: visibility.ogMusDirek,
        // }),
        // new ColumnLayer({
        //     id: 'ayd-direk-layer-mvt',
        //     data: aydDirekWFS ? aydDirekWFS : [],
        //     getPosition: d => d.geometry.coordinates,
        //     getElevation: 10,
        //     getFillColor: COLORS.AYD_DIREK,
        //     extruded: true,
        //     pickable: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     radius: .5,
        //     elevationScale: 1,
        //     visible: visibility.aydDirek,
        // }),
        // new PathLayer({
        //     id: "ag-hat-layer-mvt",
        //     data: agHatWFS ? agHatWFS : [],
        //     getPath: d => [[...d.geometry.coordinates[0] as [number, number], 10], [...d.geometry.coordinates[1] as [number, number], 10]],
        //     getColor: COLORS.AG_HAT,
        //     getWidth: overgroundLineWidth,
        //     pickable: true,
        //     billboard: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     visible: visibility.agHat,
        // }),
        // new PathLayer({
        //     id: "og-hat-layer-mvt",
        //     data: ogHatWFS ? ogHatWFS : [],
        //     getPath: d => [[...d.geometry.coordinates[0] as [number, number], 10], [...d.geometry.coordinates[1] as [number, number], 10]],
        //     getColor: COLORS.OG_HAT,
        //     getWidth: overgroundLineWidth,
        //     pickable: true,
        //     billboard: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     visible: visibility.ogHat,
        // }),
        // new PathLayer({
        //     id: "ayd-hat-layer-mvt",
        //     data: aydHatWFS ? aydHatWFS : [],
        //     getPath: d => [[...d.geometry.coordinates[0] as [number, number], 10], [...d.geometry.coordinates[1] as [number, number], 10]],
        //     getColor: COLORS.REKORTMAN,
        //     getWidth: overgroundLineWidth,
        //     pickable: true,
        //     billboard: true,
        //     autoHighlight: true,
        //     highlightColor: COLORS.HOVER,
        //     visible: visibility.rekortman,
        // }),

        ...trafoBina.map((chunk, index) => new ColumnLayer({
            id: `trafo-bina-layer-${index}`,
            data: chunk.features,
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
        debugBinaVisible
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

        const deltaLonDistance = Math.abs(lastRefreshPosition.longitude - mapViewState[selectedViewType].longitude!);
        const deltaLatDistance = Math.abs(lastRefreshPosition.latitude - mapViewState[selectedViewType].latitude!);

        if (deltaLonDistance < LON_EXTENT_PADDING || deltaLatDistance < LAT_EXTENT_PADDING || mapViewState.cartesian.zoom < MIN_ZOOM_THRESHOLD) return;

        dispatch(setExtent({
            extent: {
                minX: bounds[0] - LON_EXTENT_PADDING,
                minY: bounds[1] - LAT_EXTENT_PADDING,
                maxX: bounds[2] + LON_EXTENT_PADDING,
                maxY: bounds[3] + LAT_EXTENT_PADDING,
            }
        }));

        dispatch(setLastRefreshPosition({
            position: { longitude: mapViewState[selectedViewType].longitude!, latitude: mapViewState[selectedViewType].latitude! }
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
        document.addEventListener("keydown", (e) => handleKeyPresses(e));

        const deckglContainer = document.getElementById("deckgl-wrapper");
        deckglContainer?.addEventListener("mousedown", () => {
            dispatch(setFocusedView("deckgl"));
        });

        return () => {
            document.removeEventListener("keydown", (e) => handleKeyPresses(e));
            deckglContainer?.removeEventListener("mousedown", () => {
                dispatch(setFocusedView("deckgl"));
            });
        };
    }, []);

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
            <DataComponent
                allPoles={allPoles}
                setBuildingBina={setBuildingBin}
                setAdrBina={setAdrBina}
                setTrafoBina={setTrafoBina}
                setAgDirek={setAgDirek}
                setOgMusDirek={setOgMusDirek}
                setAydDirek={setAydDirek}
                setAgHat={setAgHat}
                setOgHat={setOgHat}
                setRekortman={setRekortman}
            />
            <div id="map-page" className={location.pathname !== "/" ? "hide" : ""}>
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
                {/* <StaticStreetView /> */}
                <DynmicStreetView />
                <LayerControl
                    debugBinaVisible={debugBinaVisible}
                    setDebugBinaVisible={setDebugBinaVisible}
                />
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
                    getCursor={(state) => {
                        setCursor(state.isDragging ? "grabbing" :
                            state.isHovering ? "pointer" : "default"
                        );
                        return "inherit"
                    }}
                >
                    <MapLibre
                        // mapStyle={MAP_STYLE[0]}
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