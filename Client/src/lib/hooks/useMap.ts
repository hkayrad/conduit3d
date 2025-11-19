import {
	FirstPersonView,
	FirstPersonViewport,
	Layer,
	MapView,
	Viewport,
	WebMercatorViewport,
	type DeckProps,
	type FirstPersonViewState,
	type MapViewState,
	type PickingInfo,
} from "deck.gl";
import { useCallback, useMemo, useRef, useState } from "react";
import type { C3D_ViewState, PopupState } from "../types";
import {
	LAT_EXTENT_PADDING,
	LON_EXTENT_PADDING,
	MAX_POPUP_COUNT,
	MAX_ZOOM_LEVEL,
	MIN_ZOOM_THRESHOLD,
} from "../constants";
import { C3D_MapViewType, FeatureType, C3D_MapLayers } from "../enums";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
	selectMapState,
	setExtent,
	setLastRefreshPosition,
	setSelectedViewType,
	setViewState,
	toggleBasemapOpacity,
	toggleMapLayerVisibility,
	toggleSettingsWindow,
	toggleStreetView,
	toggleWireframe,
} from "../../app/layout/map/mapSlice";
import { convertDeckGLToLatLonWithOffset, flyToFeature } from "../utils";

/**
 * Map interaction handlers
 * @returns Map interaction handlers
 */
export function useMap() {
	const { viewState, selectedViewType, focusedView, lastRefreshPosition } = useAppSelector(selectMapState);
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
			bearing: cartesian.bearing,
		},
		[C3D_MapViewType.FirstPerson]: {
			longitude: firstPerson.longitude,
			latitude: firstPerson.latitude,
			pitch: firstPerson.pitch,
			bearing: firstPerson.bearing,
			position: [0, 0, 3],
		},
	});
	const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);
	const [selectedFeature, setSelectedFeature] = useState<GeoJSON.Feature | null>(null);
	const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [mouseLonLat, setMouseLonLat] = useState<number[]>([0, 0]);
	const [showFpsCounter, setShowFpsCounter] = useState(false);

	const zIndexCounter = useRef(1000);
	const searchInputRef = useRef<HTMLInputElement>(null!);

	// Memoized views for DeckGL
	const views = useMemo(() => {
		if (selectedViewType === C3D_MapViewType.Cartesian) {
			return new MapView({
				id: C3D_MapViewType.Cartesian,
				farZMultiplier: 1000,
				controller: true,
			});
		} else if (selectedViewType === C3D_MapViewType.FirstPerson) {
			return new FirstPersonView({
				id: C3D_MapViewType.FirstPerson,
				controller: true,
				far: 10000,
			});
		} else {
			return null;
		}
	}, [selectedViewType]);

	/**
	 * Filter layers based on the current viewport
	 * @param param0 The layer and viewport information
	 * @returns Whether to render the layer in the current viewport
	 */
	const layerFilter: DeckProps["layerFilter"] = useCallback(
		({ layer, viewport }: { layer: Layer; viewport: Viewport }) => {
			if (layer.id.includes("basemap")) return layer.id.includes(viewport.id);

			return true;
		},
		[],
	);

	/**
	 * Handle map view updates and extent changes
	 */
	const handleUpdate = useCallback(() => {
		if (focusedView !== "deckgl") return;

		if (location.pathname !== "/") return;

		let viewport;

		if (selectedViewType === C3D_MapViewType.Cartesian) {
			viewport = new WebMercatorViewport({
				longitude: mapViewState.cartesian.longitude,
				latitude: mapViewState.cartesian.latitude,
				zoom: mapViewState.cartesian.zoom,
				pitch: mapViewState.cartesian.pitch,
				bearing: mapViewState.cartesian.bearing,
				width: window.innerWidth,
				height: window.innerHeight,
			});

			dispatch(
				setViewState({
					viewId: C3D_MapViewType.Cartesian,
					viewState: {
						...mapViewState.cartesian,
					},
				}),
			);
		} else if (selectedViewType === C3D_MapViewType.FirstPerson) {
			viewport = new FirstPersonViewport({
				longitude: mapViewState.firstPerson.longitude,
				latitude: mapViewState.firstPerson.latitude,
				pitch: mapViewState.firstPerson.pitch,
				bearing: mapViewState.firstPerson.bearing,
				position: mapViewState.firstPerson.position,
				width: window.innerWidth,
				height: window.innerHeight,
			});

			dispatch(
				setViewState({
					viewId: C3D_MapViewType.FirstPerson,
					viewState: {
						...mapViewState.firstPerson,
					},
				}),
			);
		} else return;

		const bounds = { ...viewport.getBounds() };

		if (lastRefreshPosition.longitude === null || lastRefreshPosition.latitude === null)
			dispatch(
				setExtent({
					extent: {
						minX: bounds[0] - LON_EXTENT_PADDING,
						minY: bounds[1] - LAT_EXTENT_PADDING,
						maxX: bounds[2] + LON_EXTENT_PADDING,
						maxY: bounds[3] + LAT_EXTENT_PADDING,
					},
				}),
			);

		const currentPos = convertDeckGLToLatLonWithOffset(
			mapViewState.firstPerson.position![0],
			mapViewState.firstPerson.position![1],
			mapViewState.firstPerson.latitude!,
			mapViewState.firstPerson.longitude!,
		);

		const deltaLonDistance =
			selectedViewType === C3D_MapViewType.Cartesian
				? Math.abs(lastRefreshPosition.longitude - mapViewState[selectedViewType].longitude)
				: Math.abs(lastRefreshPosition.longitude - currentPos.longitude);

		const deltaLatDistance =
			selectedViewType === C3D_MapViewType.Cartesian
				? Math.abs(lastRefreshPosition.latitude - mapViewState[selectedViewType].latitude)
				: Math.abs(lastRefreshPosition.latitude - currentPos.latitude);

		if (
			deltaLonDistance < LON_EXTENT_PADDING ||
			deltaLatDistance < LAT_EXTENT_PADDING ||
			mapViewState.cartesian.zoom < MIN_ZOOM_THRESHOLD
		)
			return;

		dispatch(
			setExtent({
				extent: {
					// Extra padding for first person view
					minX: bounds[0] - LON_EXTENT_PADDING - (selectedViewType === C3D_MapViewType.FirstPerson ? 0.002 : 0.001),
					minY: bounds[1] - LAT_EXTENT_PADDING - (selectedViewType === C3D_MapViewType.FirstPerson ? 0.002 : 0.001),
					maxX: bounds[2] + LON_EXTENT_PADDING + (selectedViewType === C3D_MapViewType.FirstPerson ? 0.002 : 0.001),
					maxY: bounds[3] + LAT_EXTENT_PADDING + (selectedViewType === C3D_MapViewType.FirstPerson ? 0.002 : 0.001),
				},
			}),
		);

		if (selectedViewType === C3D_MapViewType.Cartesian)
			dispatch(
				setLastRefreshPosition({
					position: {
						longitude: mapViewState[selectedViewType].longitude,
						latitude: mapViewState[selectedViewType].latitude,
					},
				}),
			);
		else if (selectedViewType === C3D_MapViewType.FirstPerson)
			dispatch(
				setLastRefreshPosition({
					position: { longitude: currentPos.longitude, latitude: currentPos.latitude },
				}),
			);
	}, [focusedView, mapViewState, selectedViewType, lastRefreshPosition, dispatch]);

	/**
	 * Handle dragging in First Person view
	 */
	const handleFirstPersonDrag = useCallback(() => {
		if (selectedViewType !== C3D_MapViewType.FirstPerson) return;
		if (focusedView !== "deckgl") return;

		dispatch(
			setViewState({
				viewId: C3D_MapViewType.FirstPerson,
				viewState: {
					...viewState.firstPerson,
					bearing: mapViewState.firstPerson.bearing,
					pitch: mapViewState.firstPerson.pitch,
					position: mapViewState.firstPerson.position,
				},
			}),
		);
	}, [
		dispatch,
		focusedView,
		viewState.firstPerson,
		selectedViewType,
		mapViewState.firstPerson.bearing,
		mapViewState.firstPerson.pitch,
		mapViewState.firstPerson.position,
	]);

	/**
	 * Handle view state changes
	 * @param viewState The new map view state
	 */
	const handleViewStateChange = useCallback(
		(viewId: C3D_MapViewType, viewState: MapViewState | FirstPersonViewState) => {
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
						},
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
								Math.max(-100, prevState.firstPerson.position![2]), //Min height limiter
								// BELKI StreetView icin SINIRLANIR
							],
						},
					}));
			}
		},
		[],
	);

	/**
	 * Handle mouse move events
	 * @param info The picking info from the mouse move event
	 */
	const handleMouseMove = useCallback((info: PickingInfo) => {
		setHoveredFeature(info.object);
		setMousePos({ x: info.x, y: info.y });
		setMouseLonLat(info.coordinate ?? [0, 0]);
	}, []);

	/**
	 * Handle click events to create popups
	 * @param info The picking info from the click event
	 */
	const handleClick = useCallback((info: PickingInfo) => {
		if (!info.object) {
			setSelectedFeature(null);
			return;
		}

		const clickedFeature = info.object as GeoJSON.Feature;

		if (info.layer?.id === "building-bina-mvt-layer" && !clickedFeature.properties?.dataType) {
			clickedFeature.properties = {
				...clickedFeature.properties,
				dataType: FeatureType.BUILDING,
			};
		}

		const enrichedFeature: GeoJSON.Feature = {
			...clickedFeature,
			properties: clickedFeature.properties ? { ...clickedFeature.properties } : clickedFeature.properties,
		};
		setSelectedFeature(enrichedFeature);

		setActivePopups((prev) => {
			if (!info.object) return prev;

			let popups = prev.filter(
				(p) => JSON.stringify(p.info.object.properties) != JSON.stringify(info.object.properties),
			);

			// Create a unique ID for the popup
			const id = Math.random().toString(36).substring(2, 9);
			zIndexCounter.current += 1;
			const newPopup: PopupState = {
				id: `popup-${id}`,
				info: info,
				zIndex: zIndexCounter.current,
			};

			popups = [...popups, newPopup];

			if (popups.length > MAX_POPUP_COUNT) popups.shift(); // Remove the oldest popup if exceeding max count

			return popups;
		});
	}, []);

	/**
	 * Handle closing a popup
	 * @param id The ID of the popup to close
	 */
	const handleClosePopup = useCallback((id: string) => {
		setActivePopups((prev) => prev.filter((popup) => popup.id !== id));
	}, []);

	/**
	 * Handle focusing a popup to bring it to the front
	 * @param id The ID of the popup to focus
	 */
	const handleFocusPopup = useCallback(
		(id: string) => {
			const maxZIndex = Math.max(...activePopups.map((p) => p.zIndex));
			const focusedPopup = activePopups.find((p) => p.id === id);

			// Only update if the focused popup is not already on top
			if (focusedPopup && focusedPopup.zIndex < maxZIndex) {
				zIndexCounter.current += 1;
				setActivePopups((prev) => prev.map((p) => (p.id === id ? { ...p, zIndex: zIndexCounter.current } : p)));
			}
		},
		[activePopups],
	);

	/**
	 * Handle Escape key press
	 */
	const handleEscapeKey = useCallback(
		(e: KeyboardEvent) => {
			if (e.code === "Escape" && searchInputRef.current === document.activeElement) {
				e.preventDefault();
				if (searchInputRef.current) searchInputRef.current.blur();
			}
		},
		[searchInputRef],
	);

	/**
	 * Handle Ctrl key combinations
	 */
	const handleCtrlKeys = useCallback(
		(e: KeyboardEvent) => {
			if (!e.ctrlKey || e.altKey || e.shiftKey || searchInputRef.current === document.activeElement) {
				return;
			}

			if (e.code === "Slash") {
				e.preventDefault();
				e.stopPropagation();
				if (searchInputRef.current) searchInputRef.current.focus();
			} else if (e.code === "Delete") {
				e.preventDefault();
				setActivePopups([]);
				setSelectedFeature(null);
			} else if (e.code === "Comma") {
				e.preventDefault();
				dispatch(toggleSettingsWindow());
			}
		},
		[searchInputRef, dispatch],
	);

	/**
	 * Handle Shift key combinations for view and display toggles
	 */
	const handleShiftViewKeys = useCallback(
		(e: KeyboardEvent) => {
			const keyActions: Record<string, () => void> = {
				KeyW: () => dispatch(toggleWireframe()),
				KeyS: () => dispatch(toggleStreetView()),
				KeyC: () => dispatch(setSelectedViewType(C3D_MapViewType.Cartesian)),
				KeyF: () => dispatch(setSelectedViewType(C3D_MapViewType.FirstPerson)),
				KeyP: () => setShowFpsCounter((prev) => !prev),
				Period: () => dispatch(toggleBasemapOpacity()),
			};

			const action = keyActions[e.code];
			if (action) {
				e.preventDefault();
				action();
			}
		},
		[dispatch],
	);

	/**
	 * Handle Shift key combinations for layer toggles
	 */
	const handleShiftLayerKeys = useCallback(
		(e: KeyboardEvent) => {
			const layerMap: Record<string, C3D_MapLayers> = {
				Digit1: C3D_MapLayers.AdrBina,
				Digit2: C3D_MapLayers.TrafoBina,
				Digit3: C3D_MapLayers.AdrYol,
				Digit4: C3D_MapLayers.AgDirek,
				Digit5: C3D_MapLayers.OgMusDirek,
				Digit6: C3D_MapLayers.AydDirek,
				Digit7: C3D_MapLayers.AgHat,
				Digit8: C3D_MapLayers.OgHat,
				Digit9: C3D_MapLayers.Rekortman,
				Digit0: C3D_MapLayers.Basemap,
			};

			const layer = layerMap[e.code];
			if (layer) {
				e.preventDefault();
				dispatch(toggleMapLayerVisibility({ layer }));
			}
		},
		[dispatch],
	);

	/**
	 * Handle key presses for global shortcuts
	 * @param e The keyboard event
	 */
	const handleKeyPresses = useCallback(
		(e: KeyboardEvent) => {
			handleEscapeKey(e);

			handleCtrlKeys(e);

			if (e.shiftKey && !e.altKey && !e.ctrlKey && searchInputRef.current !== document.activeElement) {
				handleShiftViewKeys(e);
				handleShiftLayerKeys(e);
			}
		},
		[searchInputRef, handleEscapeKey, handleCtrlKeys, handleShiftViewKeys, handleShiftLayerKeys],
	);

	// Fly to a given feature
	const flyTo = useCallback(
		(feature: GeoJSON.Feature): void => {
			if (!feature || !feature.geometry) {
				setSelectedFeature(null);
				return;
			}

			if (selectedViewType !== C3D_MapViewType.Cartesian) dispatch(setSelectedViewType(C3D_MapViewType.Cartesian));

			flyToFeature(feature, mapViewState.cartesian, setMapViewState);
			setSelectedFeature(feature);
		},
		[mapViewState, selectedViewType, setSelectedFeature, dispatch],
	);

	return {
		showFpsCounter,
		activePopups,
		mapViewState,
		setMapViewState,
		searchInputRef,
		hoveredFeature,
		setHoveredFeature,
		selectedFeature,
		setSelectedFeature,
		mousePos,
		setMousePos,
		mouseLonLat,
		setMouseLonLat,
		views,
		layerFilter,
		handleUpdate,
		handleViewStateChange,
		handleMouseMove,
		handleFirstPersonDrag,
		handleClick,
		handleClosePopup,
		handleFocusPopup,
		handleKeyPresses,
		flyTo,
	};
}
