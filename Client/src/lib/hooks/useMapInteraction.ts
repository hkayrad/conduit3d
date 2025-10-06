import type { FirstPersonViewState, MapViewState, PickingInfo } from "deck.gl";
import { useCallback, useRef, useState } from "react";
import type { C3D_ViewState, PopupState } from "../types";
import { MAX_POPUP_COUNT, MAX_ZOOM_LEVEL } from "../constants";
import { C3D_MapViewType, FeatureType, C3D_MapLayers } from "../enums";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { selectMapState, setSelectedViewType, toggleMapLayerVisibility, toggleSettingsWindow, toggleStreetView, toggleWireframe } from "../../app/layout/map/mapSlice";
import { flyToFeature } from "../utils";

/**
 * Map interaction handlers
 * @returns Map interaction handlers
 */
export function useMapInteraction() {
    const { viewState, selectedViewType } = useAppSelector(selectMapState);
    const { cartesian, firstPerson } = viewState;
    const dispatch = useAppDispatch();

    const [activePopups, setActivePopups] = useState<PopupState[]>([]);
    const [mapViewState, setMapViewState] = useState<C3D_ViewState>({
        [C3D_MapViewType.Cartesian]: {
            longitude: cartesian.longitude,
            latitude: cartesian.latitude,
            zoom: cartesian.zoom,
            maxZoom: MAX_ZOOM_LEVEL,
            pitch: cartesian.pitch,
            bearing: cartesian.bearing
        },
        [C3D_MapViewType.FirstPerson]: {
            longitude: firstPerson.longitude,
            latitude: firstPerson.latitude,
            pitch: firstPerson.pitch,
            bearing: firstPerson.bearing,
            position: [0, 0, 3],
        }
    });
    const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [mouseLonLat, setMouseLonLat] = useState<number[]>([0, 0]);
    const [showFpsCounter, setShowFpsCounter] = useState(false);

    const zIndexCounter = useRef(1000);
    const searchInputRef = useRef<HTMLInputElement>(null!);

    /**
     * Handle view state changes
     * @param viewState The new map view state
     */
    const handleViewStateChange = (viewId: C3D_MapViewType, viewState: MapViewState | FirstPersonViewState) => {
        setMapViewState((prevState) => ({
            ...prevState,
            [viewId]: {
                ...viewState,
            },
        }));

        switch (viewId) {
            case C3D_MapViewType.Cartesian:
                setMapViewState((prevState) => ({
                    ...prevState,
                    firstPerson: {
                        ...prevState.firstPerson,
                        longitude: viewState.longitude,
                        latitude: viewState.latitude,
                    }
                }));
                break;

            case C3D_MapViewType.FirstPerson:
                setMapViewState((prevState) => ({
                    ...prevState,
                    firstPerson: {
                        ...prevState.firstPerson,
                        position: [
                            prevState.firstPerson.position![0],
                            prevState.firstPerson.position![1],
                            prevState.firstPerson.position![2] < 3 ? 3 : prevState.firstPerson.position![2]
                            // BELKI StreetView icin SINIRLANIR
                        ]
                    }
                }));
        }
    };

    /**
     * Handle mouse move events
     * @param info The picking info from the mouse move event
     */
    const handleMouseMove = useCallback((info: PickingInfo) => {
        // if (info.object && info.layer?.id === 'building-bina-mvt-layer') {
        //     // Ensure dataType is set for MVT features
        //     if (!info.object.properties.dataType) {
        //         info.object.properties.dataType = FeatureType.BUILDING;
        //     }
        //     // Continue with your existing click handling logic
        // }
        setHoveredFeature(info.object);
        setMousePos({ x: info.x, y: info.y });
        setMouseLonLat(info.coordinate ? info.coordinate : [0, 0]);
    }, []);

    /**
     * Handle click events to create popups
     * @param info The picking info from the click event
     */
    const handleClick = useCallback((info: PickingInfo) => {
        if (!info.object) {
            return;
        }

        setActivePopups(prev => {
            if (!info.object)
                return prev;

            if (info.object && info.layer?.id === 'building-bina-mvt-layer') {
                // Ensure dataType is set for MVT features
                if (!info.object.properties.dataType) {
                    info.object.properties.dataType = FeatureType.BUILDING;
                }
                // Continue with your existing click handling logic
            }

            let popups = prev.filter(
                p => JSON.stringify(p.info.object.properties) != JSON.stringify(info.object.properties)
            );

            // Create a unique ID for the popup
            const id = Math.random().toString(36).substring(2, 9);
            zIndexCounter.current += 1;
            const newPopup: PopupState = {
                id: `popup-${id}`,
                info: info,
                zIndex: zIndexCounter.current
            };

            popups = [...popups, newPopup];

            if (popups.length > MAX_POPUP_COUNT)
                popups.shift(); // Remove the oldest popup if exceeding max count

            return popups;
        })
    }, []);

    /**
     * Handle closing a popup
     * @param id The ID of the popup to close
     */
    const handleClosePopup = useCallback((id: string) => {
        setActivePopups(prev => prev.filter(popup => popup.id !== id));
    }, []);

    /**
     * Handle focusing a popup to bring it to the front
     * @param id The ID of the popup to focus
     */
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

    /**
     * Handle key presses for global shortcuts
     * @param e The keyboard event
     */
    const handleKeyPresses = useCallback((e: KeyboardEvent) => {

        if (e.code === "Escape" && searchInputRef.current === document.activeElement) {
            e.preventDefault();
            if (searchInputRef.current)
                searchInputRef.current.blur();
        }

        if (e.ctrlKey && !e.altKey && !e.shiftKey && searchInputRef.current !== document.activeElement) {

            if (e.code === "Slash") {
                e.preventDefault();
                e.stopPropagation();
                if (searchInputRef.current)
                    searchInputRef.current.focus();
            }

            if (e.code === "Delete") {
                e.preventDefault();
                setActivePopups([]);
            }


            if (e.code === "Comma") {
                e.preventDefault();
                dispatch(toggleSettingsWindow())
            }
        }

        if (e.shiftKey && !e.altKey && !e.ctrlKey && searchInputRef.current !== document.activeElement) {

            // Toggle Wireframe mode
            if (e.code === "KeyW") {
                e.preventDefault();
                dispatch(toggleWireframe());
            }

            // Toggle Street View Visibility
            if (e.code === "KeyS") {
                e.preventDefault();
                dispatch(toggleStreetView());
            }

            // Toggle between Cartesian and First Person views
            if (e.code === "KeyC") {
                e.preventDefault();
                dispatch(setSelectedViewType(C3D_MapViewType.Cartesian));
            }

            if (e.code === "KeyF") {
                e.preventDefault();
                dispatch(setSelectedViewType(C3D_MapViewType.FirstPerson));
            }

            // Toggle FPS Counter
            if (e.code === "KeyP") {
                e.preventDefault();
                setShowFpsCounter(prev => !prev);
            }

            // Toggle layers
            if (e.code === "Digit1") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.AdrBina }));
            }

            if (e.code === "Digit2") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.TrafoBina }));
            }

            if (e.code === "Digit3") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.AgDirek }));
            }

            if (e.code === "Digit4") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.OgMusDirek }));
            }

            if (e.code === "Digit5") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.AydDirek }));
            }

            if (e.code === "Digit6") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.AgHat }));
            }

            if (e.code === "Digit7") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.OgHat }));
            }

            if (e.code === "Digit8") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.Rekortman }));
            }

            if (e.code === "Digit0") {
                e.preventDefault();
                dispatch(toggleMapLayerVisibility({ layer: C3D_MapLayers.Basemap }));
            }
        }
    }, [searchInputRef]);

    // Fly to a given feature
    const flyTo = useCallback((
        feature: GeoJSON.Feature,
    ): void => {
        if (selectedViewType !== C3D_MapViewType.Cartesian)
            dispatch(setSelectedViewType(C3D_MapViewType.Cartesian));

        flyToFeature(feature, mapViewState.cartesian, setMapViewState);
    }, [mapViewState, selectedViewType])

    return {
        showFpsCounter,
        activePopups,
        mapViewState,
        setMapViewState,
        searchInputRef,
        hoveredFeature,
        setHoveredFeature,
        mousePos,
        setMousePos,
        mouseLonLat,
        setMouseLonLat,
        handleViewStateChange,
        handleMouseMove,
        handleClick,
        handleClosePopup,
        handleFocusPopup,
        handleKeyPresses,
        flyTo
    }
}