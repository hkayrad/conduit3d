import { useEffect, useRef, useState } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlTileLayer from "ol/layer/Tile";
import OlVectorLayer from "ol/layer/Vector";
import OlOSM from "ol/source/OSM";
import OlXYZ from "ol/source/XYZ";
import OlVectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Draw, Modify, Snap, Translate, Select } from "ol/interaction";
import MapBrowserEvent from "ol/MapBrowserEvent";
import type { Type } from "ol/geom/Geometry";
import {
    generateRandomColor,
    createVectorLayer,
    createBuildingLayer,
} from "../../../../../../lib/utils/ol";
import { HatCinsi } from "../../../../../../lib/enums";
import type { C3D_LayerViewState, Config, GeoTiffLayer } from "../../../../../../lib/types";
import OlImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";


export type DrawingMode = "Point" | "LineString" | "Polygon" | "Move" | "Edit" | "None";

export type HoverInfo = {
    x: number;
    y: number;
    properties: Record<string, any>;
} | null;

type UseOlDrawingMapProps = {
    olContainerRef: React.RefObject<HTMLDivElement | null>;
    viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
    };
    onViewStateChange: (viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
    }) => void;
    hatLayerData: any[];
    direkLayerData: any[];
    aydDirekData: any[];
    armaturLayerData: any[];
    yolLayerData: any[];
    adrBina: GeoJSON.FeatureCollection[];
    buildingBina: GeoJSON.FeatureCollection[];
    trafoBina: GeoJSON.FeatureCollection[];
    visibility: C3D_LayerViewState;
    config: Config;
    customLayers: any[];
    geoTiffLayers: GeoTiffLayer[];
};

export function useOlDrawingMap({
    olContainerRef,
    viewState,
    onViewStateChange,
    hatLayerData,
    direkLayerData,
    aydDirekData,
    armaturLayerData,
    yolLayerData,
    adrBina,
    buildingBina,
    trafoBina,
    visibility,
    config,
    customLayers,
    geoTiffLayers,
}: UseOlDrawingMapProps) {
    const mapRef = useRef<OlMap | null>(null);
    const sourceRef = useRef<OlVectorSource>(new OlVectorSource());
    const [drawingMode, setDrawingMode] = useState<DrawingMode>("None");
    const [hasFeatures, setHasFeatures] = useState(false);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
    const [currentGeometryType, setCurrentGeometryType] = useState<
        "Point" | "LineString" | "Polygon" | "None"
    >("None");
    const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);

    const layerRef = useRef<OlVectorLayer | null>(null);
    const viewStateRef = useRef(viewState);
    const onViewStateChangeRef = useRef(onViewStateChange);

    useEffect(() => {
        viewStateRef.current = viewState;
        onViewStateChangeRef.current = onViewStateChange;
    }, [viewState, onViewStateChange]);

    // Initialize Map
    useEffect(() => {
        if (!olContainerRef.current) return;

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
        vectorLayer.setZIndex(100);
        layerRef.current = vectorLayer;

        const map = new OlMap({
            target: olContainerRef.current,
            layers: [
                new OlTileLayer({
                    source: new OlOSM({
                        transition: 0,
                        cacheSize: 512,
                    }),
                    properties: { preload: 0 },
                }),
                vectorLayer,
            ],
            view: new OlView({
                center: fromLonLat([viewState.longitude, viewState.latitude]),
                projection: "EPSG:3857",
                zoom: viewState.zoom,
                enableRotation: false,
            }),
            maxTilesLoading: 8,
        });

        mapRef.current = map;

        const updateFeatureState = () => {
            setHasFeatures(sourceRef.current.getFeatures().length > 0);
        };

        sourceRef.current.on(
            ["addfeature", "removefeature", "clear"],
            updateFeatureState
        );

        const handleMoveEnd = () => {
            const view = map.getView();
            const center = view.getCenter();
            const zoom = view.getZoom();

            if (center && zoom !== undefined) {
                const [longitude, latitude] = toLonLat(center);
                onViewStateChangeRef.current({
                    longitude,
                    latitude,
                    zoom: viewStateRef.current.zoom,
                });
            }
        };

        map.on("moveend", handleMoveEnd);

        return () => {
            map.setTarget(undefined);
            sourceRef.current.un(
                ["addfeature", "removefeature", "clear"],
                updateFeatureState
            );
            map.un("moveend", handleMoveEnd);
        };
    }, []);

    // Manage Interactions
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        setSelectedFeatures([]);

        map.getInteractions().forEach((interaction) => {
            if (
                interaction instanceof Draw ||
                interaction instanceof Modify ||
                interaction instanceof Snap
            ) {
                map.removeInteraction(interaction);
            }
        });

        const handlePointerMove = (evt: MapBrowserEvent<any>) => {
            if (evt.dragging) {
                setHoverInfo(null);
                return;
            }

            const pixel = map.getEventPixel(evt.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);
            const element = map.getTargetElement();
            if (element) {
                element.style.cursor = feature ? "pointer" : "";
            }

            if (feature) {
                const properties = feature.getProperties();
                const filteredProps: Record<string, any> = {};
                Object.keys(properties).forEach((key) => {
                    const value = properties[key];
                    if (
                        key !== "geometry" &&
                        !key.startsWith("ol_") &&
                        typeof value !== "object" &&
                        typeof value !== "function"
                    ) {
                        filteredProps[key] = value;
                    }
                });

                if (Object.keys(filteredProps).length > 0) {
                    setHoverInfo({
                        x: pixel[0],
                        y: pixel[1],
                        properties: filteredProps,
                    });
                } else {
                    setHoverInfo(null);
                }
            } else {
                setHoverInfo(null);
            }
        };

        if (drawingMode === "Edit") {
            const select = new Select();
            select.on("select", (e) => {
                setSelectedFeatures(e.selected);
            });
            map.addInteraction(select);

            const modify = new Modify({
                features: select.getFeatures(),
            });
            modify.on("modifystart", (e) => {
                e.features.forEach((feature) => {
                    if (!modifiedFeaturesRef.current.has(feature)) {
                        modifiedFeaturesRef.current.set(
                            feature,
                            feature.getGeometry()?.clone()
                        );
                    }
                });
            });
            modify.on("modifyend", () => {
                setHasFeatures(true);
            });
            map.addInteraction(modify);
            setHoverInfo(null);
        } else if (drawingMode === "Move") {
            const translate = new Translate();
            translate.on("translatestart", (e) => {
                e.features.forEach((feature) => {
                    if (!modifiedFeaturesRef.current.has(feature)) {
                        modifiedFeaturesRef.current.set(
                            feature,
                            feature.getGeometry()?.clone()
                        );
                    }
                });
            });
            translate.on("translateend", () => {
                setHasFeatures(true);
            });
            map.addInteraction(translate);
            setHoverInfo(null);
        } else if (drawingMode !== "None") {
            const draw = new Draw({
                source: sourceRef.current,
                type: drawingMode as Type,
            });

            draw.on("drawstart", () => {
                sourceRef.current.clear();
            });

            draw.on("drawend", (event) => {
                const feature = event.feature;
                const geometry = feature.getGeometry();
                const type = geometry?.getType();

                if (type === "Point" || type === "LineString" || type === "Polygon") {
                    setCurrentGeometryType(type);
                }

                setTimeout(() => {
                    setDrawingMode("None");
                }, 0);
            });

            map.addInteraction(draw);
            setHoverInfo(null);
        } else {
            map.on("pointermove", handlePointerMove);
        }

        const snap = new Snap({ source: sourceRef.current });
        map.addInteraction(snap);

        return () => {
            map.getInteractions().forEach((interaction) => {
                if (
                    interaction instanceof Draw ||
                    interaction instanceof Modify ||
                    interaction instanceof Snap ||
                    interaction instanceof Translate ||
                    interaction instanceof Select
                ) {
                    map.removeInteraction(interaction);
                }
            });
            map.un("pointermove", handlePointerMove);
        };
    }, [drawingMode]);

    // Render Data Layers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Prevent data refresh while editing or moving to avoid disrupting the interaction
        if (drawingMode === "Edit" || drawingMode === "Move") return;

        const layersToRemove: any[] = [];
        map.getLayers().forEach((layer) => {
            const properties = layer.getProperties();
            if (properties.isDataLayer) {
                layersToRemove.push(layer);
            }
        });
        layersToRemove.forEach((layer) => map.removeLayer(layer));

        const addLayersFromGroups = (
            groups: any[][],
            width: number,
            isPoint: boolean = false
        ) => {
            groups.forEach((group) => {
                group.forEach((layer: any) => {
                    if (layer.visibility) {
                        const color = layer.color || generateRandomColor();
                        let lineDash: number[] | undefined = undefined;
                        if (layer.cinsi) {
                            if (layer.cinsi === HatCinsi.BARA) {
                                lineDash = [10, 10];
                            } else if (layer.cinsi === HatCinsi.YERALTI) {
                                lineDash = [20, 15];
                            }
                        }

                        const vectorLayer = createVectorLayer(
                            layer.data,
                            color,
                            lineDash ? 1.5 : width,
                            isPoint,
                            lineDash
                        );
                        if (vectorLayer) {
                            vectorLayer.setZIndex(10);
                            map.addLayer(vectorLayer);
                        }
                    }
                });
            });
        };

        const addBuildingLayers = (
            chunks: GeoJSON.FeatureCollection[],
            configColor: string | undefined
        ) => {
            chunks.forEach((chunk) => {
                const hexColor = configColor || generateRandomColor();
                const layer = createBuildingLayer(chunk, hexColor);
                if (layer) {
                    layer.setZIndex(10);
                    map.addLayer(layer);
                }
            });
        };

        if (yolLayerData) {
            addLayersFromGroups(yolLayerData, 2);
            if (visibility.adrBina) {
                addBuildingLayers(adrBina, config.ADR_BINA_COLOR);
                addBuildingLayers(buildingBina, config.ADR_BINA_COLOR);
            }
            if (visibility.trafoBina) {
                trafoBina.forEach((chunk) => {
                    const hexColor = config.TRAFO_BINA_COLOR || generateRandomColor();
                    const layer = createVectorLayer(chunk, hexColor, 2, true);
                    if (layer) {
                        layer.setZIndex(10);
                        map.addLayer(layer);
                    }
                });
            }
            addLayersFromGroups(hatLayerData, 2);
            if (direkLayerData) addLayersFromGroups(direkLayerData, 2, true);
            if (aydDirekData) addLayersFromGroups(aydDirekData, 2, true);
            if (armaturLayerData) addLayersFromGroups(armaturLayerData, 2, true);
        }
    }, [
        hatLayerData,
        direkLayerData,
        aydDirekData,
        armaturLayerData,
        yolLayerData,
        adrBina,
        buildingBina,
        trafoBina,
        visibility,
        config,
        drawingMode,
    ]);

    // Render Custom Layers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove existing custom layers
        const layersToRemove: any[] = [];
        map.getLayers().forEach((layer) => {
            const properties = layer.getProperties();
            if (properties.isCustomLayer) {
                layersToRemove.push(layer);
            }
        });
        layersToRemove.forEach((layer) => map.removeLayer(layer));

        if (customLayers) {
            customLayers.forEach((layer) => {
                if (layer.visible) {
                    const tileLayer = new OlTileLayer({
                        source: new OlXYZ({
                            url: layer.url,
                            attributions: layer.attribution,
                        }),
                        opacity: layer.opacity,
                        properties: { isCustomLayer: true },
                        zIndex: 1, // Ensure it's above basemap (0) but below data (10)
                    });
                    map.addLayer(tileLayer);
                }
            });
        }
    }, [customLayers]);

    // Render GeoTiff Layers (Raster)
    // Ref to store active layers and their object URLs: Map<layerId, { layer: OlImageLayer, url: string }>
    const activeLayersRef = useRef<Map<string, { layer: OlImageLayer<Static>; url: string }>>(new Map());

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // 1. Identify layers to remove (active layers that are no longer in geoTiffLayers)
        const currentLayerIds = new Set(geoTiffLayers?.map(l => l.id) || []);
        const layersToRemove: string[] = [];

        activeLayersRef.current.forEach((_, key) => {
            if (!currentLayerIds.has(key)) {
                layersToRemove.push(key);
            }
        });

        // Remove layers and revoke URLs
        layersToRemove.forEach(id => {
            const entry = activeLayersRef.current.get(id);
            if (entry) {
                map.removeLayer(entry.layer);
                URL.revokeObjectURL(entry.url);
                activeLayersRef.current.delete(id);
            }
        });

        // 2. Add or Update layers
        if (geoTiffLayers) {
            geoTiffLayers.forEach(layer => {
                if (!layer.visible || !layer.imageData) {
                    // If layer is hidden or has no data, ensure it's removed from map if it existed
                    const entry = activeLayersRef.current.get(layer.id);
                    if (entry) {
                        map.removeLayer(entry.layer);
                        // We keep the URL valid in case it becomes visible again to avoid regenerating?
                        // Or we can just hide the layer.
                        // Better UX: Just set visible false on the OL layer.
                        entry.layer.setVisible(false);
                    }
                    return;
                }

                const entry = activeLayersRef.current.get(layer.id);

                if (entry) {
                    // Update existing layer
                    const imageLayer = entry.layer;

                    // Update properties if changed
                    if (imageLayer.getOpacity() !== layer.opacity) {
                        imageLayer.setOpacity(layer.opacity);
                    }
                    if (imageLayer.getVisible() !== layer.visible) {
                        imageLayer.setVisible(layer.visible);
                    }
                    // Ensure it's on the map (in case it was re-added or something)
                    // (Usually unnecessary if we don't remove it, but good safety)
                } else {
                    // Create new layer
                    const canvas = document.createElement("canvas");
                    canvas.width = layer.imageData.width;
                    canvas.height = layer.imageData.height;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.putImageData(layer.imageData as ImageData, 0, 0);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                // Double check if layer is still needed (async race condition)
                                const isStillCurrent = geoTiffLayers.some(l => l.id === layer.id);
                                if (!isStillCurrent) return;

                                const newUrl = URL.createObjectURL(blob);

                                // Transform extent from WGS84 to EPSG:3857
                                const extent = layer.bounds;
                                const min = fromLonLat([extent[0], extent[1]]);
                                const max = fromLonLat([extent[2], extent[3]]);
                                const projectedExtent = [min[0], min[1], max[0], max[1]];

                                const imageLayer = new OlImageLayer({
                                    source: new Static({
                                        url: newUrl,
                                        imageExtent: projectedExtent,
                                        projection: "EPSG:3857"
                                    }),
                                    opacity: layer.opacity,
                                    visible: layer.visible,
                                    properties: { isGeoTiffLayer: true, layerId: layer.id },
                                    zIndex: 2,
                                });

                                map.addLayer(imageLayer);
                                activeLayersRef.current.set(layer.id, { layer: imageLayer, url: newUrl });
                            }
                        });
                    }
                }
            });
        }
    }, [geoTiffLayers]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            activeLayersRef.current.forEach((entry) => {
                // We can't easily remove from map here if mapRef is null, but map is being destroyed anyway
                URL.revokeObjectURL(entry.url);
            });
            activeLayersRef.current.clear();
        };
    }, []);

    const modifiedFeaturesRef = useRef<Map<any, any>>(new Map());

    const clearFeatures = () => {
        sourceRef.current.clear();

        // Revert modified features
        modifiedFeaturesRef.current.forEach((geometry, feature) => {
            feature.setGeometry(geometry);
        });
        modifiedFeaturesRef.current.clear();

        setHasFeatures(false);
    };

    const getModifiedFeatures = () => {
        const modified = Array.from(modifiedFeaturesRef.current.keys());
        const newFeatures = sourceRef.current.getFeatures();
        return { modified, new: newFeatures };
    };

    return {
        drawingMode,
        setDrawingMode,
        hasFeatures,
        hoverInfo,
        currentGeometryType,
        clearFeatures,
        getModifiedFeatures,
        selectedFeatures,
    };
}
