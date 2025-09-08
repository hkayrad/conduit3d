import type { MapViewState, PickingInfo } from "deck.gl";
import { useCallback } from "react";
import type { PopupState } from "../types";

/**
 * Map interaction handlers
 * @param zIndexCounter Counter for z-index handling
 * @param activePopups Array of active popups
 * @param setMapViewState Function to update the map view state
 * @param setLineWidth Function to update the line width
 * @param setHoveredFeature Function to update the hovered feature
 * @param setMousePos Function to update the mouse position
 * @param setMouseLonLat Function to update the mouse longitude and latitude
 * @param setActivePopups Function to update the active popups
 * @returns Map interaction handlers
 */
export function useMapInteraction(
    zIndexCounter: React.RefObject<number>,
    activePopups: PopupState[],
    setMapViewState: React.Dispatch<React.SetStateAction<MapViewState>>,
    setLineWidth: React.Dispatch<React.SetStateAction<number>>,
    setHoveredFeature: React.Dispatch<React.SetStateAction<GeoJSON.Feature | null>>,
    setMousePos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    setMouseLonLat: React.Dispatch<React.SetStateAction<number[]>>,
    setActivePopups: React.Dispatch<React.SetStateAction<PopupState[]>>
) {
    /**
     * Handle view state changes
     * @param viewState The new map view state
     */
    const handleViewStateChange = useCallback((viewState: MapViewState) => {
        setMapViewState(viewState);
        setLineWidth(Number(Math.max((23.5 - viewState.zoom) / 10, 0.01).toFixed(4)));
    }, []);

    /**
     * Handle mouse move events
     * @param info The picking info from the mouse move event
     */
    const handleMouseMove = useCallback((info: PickingInfo) => {
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

        const id = Math.random().toString(36).substring(2, 9);
        zIndexCounter.current += 1;
        const newPopup: PopupState = {
            id: `popup-${id}`,
            info: info,
            zIndex: zIndexCounter.current
        };
        setActivePopups(prev => [...prev, newPopup]);
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
        // Close all popups on Ctrl + Delete
        if (e.ctrlKey && e.key === "Delete") {
            e.preventDefault();
            setActivePopups([]);
        }
    }, [])

    return {
        handleViewStateChange,
        handleMouseMove,
        handleClick,
        handleClosePopup,
        handleFocusPopup,
        handleKeyPresses
    }
}