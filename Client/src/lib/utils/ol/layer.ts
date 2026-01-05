import OlVectorLayer from "ol/layer/Vector";
import OlVectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { normalizeGeoJSONData } from "./data";
import { normalizeColor } from "./color";

/**
 * Creates an OpenLayers VectorLayer from various data formats (GeoJSON object, string, or feature array).
 * 
 * @param data - The input data (GeoJSON object, JSON string, or array of features)
 * @param color - The color for the layer styling (hex string or RGBA array)
 * @param width - Stroke width for lines (default: 2)
 * @param isPoint - Whether to style features as points (circles) or lines/polygons
 * @param lineDash - Optional line dash pattern [dash, gap]
 * @returns An OpenLayers VectorLayer configured with the source and style, or null if data is invalid
 */
export const createVectorLayer = (
    data: any,
    color: string | [number, number, number, number],
    width: number = 2,
    isPoint: boolean = false,
    lineDash?: number[],
): OlVectorLayer<OlVectorSource> | null => {
    const geojsonData = normalizeGeoJSONData(data);
    if (!geojsonData) return null;

    const olColor = normalizeColor(color);

    const vectorSource = new OlVectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        }),
    });

    const style = isPoint
        ? new Style({
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({ color: olColor }),
                stroke: new Stroke({ color: "#fff", width: 1 }),
            }),
        })
        : new Style({
            stroke: new Stroke({
                color: olColor,
                width: width,
                lineDash: lineDash,
            }),
            fill: new Fill({
                color: olColor,
            }),
        });

    const vectorLayer = new OlVectorLayer({
        source: vectorSource,
        style: style,
    });
    vectorLayer.setProperties({ isDataLayer: true });
    return vectorLayer;
};

/**
 * Creates a specialized OpenLayers VectorLayer for buildings with a semi-transparent fill.
 * 
 * @param data - The building data (GeoJSON)
 * @param hexColor - The base color for the building stroke (hex string)
 * @returns An OpenLayers VectorLayer with building specific styling, or null if data is invalid
 */
export const createBuildingLayer = (
    data: any,
    hexColor: string,
): OlVectorLayer<OlVectorSource> | null => {
    const layer = createVectorLayer(data, hexColor, 2);
    if (!layer) return null;

    // Darken the color for fill
    const r = Math.floor(parseInt(hexColor.slice(1, 3), 16) * 0.7);
    const g = Math.floor(parseInt(hexColor.slice(3, 5), 16) * 0.7);
    const b = Math.floor(parseInt(hexColor.slice(5, 7), 16) * 0.7);
    const darkenedColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

    // Override style for buildings with semi-transparent fill
    layer.setStyle(
        new Style({
            stroke: new Stroke({
                color: hexColor,
                width: 2,
            }),
            fill: new Fill({
                color: darkenedColor,
            }),
        }),
    );
    return layer;
};
