import OlVectorLayer from "ol/layer/Vector";
import OlVectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { normalizeGeoJSONData } from "./data";
import { normalizeColor } from "./color";

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
