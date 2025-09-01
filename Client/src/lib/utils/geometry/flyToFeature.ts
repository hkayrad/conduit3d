import { FlyToInterpolator, WebMercatorViewport, type MapViewState } from "@deck.gl/core";
import { DataType } from "../../enums";
import { bbox } from "@turf/turf";
import { easeInOutCubic } from "..";
import { MAX_ZOOM } from "../../constants";

/**
 * Fly to a specific feature on the map.
 * @param feature The GeoJSON feature to fly to.
 * @param mapViewState The current map view state.
 * @param setMapViewState The function to update the map view state.
 */
export function flyToFeature(
    feature: GeoJSON.Feature,
    mapViewState: MapViewState,
    setMapViewState: React.Dispatch<React.SetStateAction<MapViewState>>) {
    if (!feature) return;

    const [minLng, minLat, maxLng, maxLat] = bbox(feature);

    const { longitude, latitude, zoom } = new WebMercatorViewport(mapViewState).fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        {
            padding: 300
        }
    );

    const zoomLevel = feature.properties!.dataType === DataType.POLE ? 20 :
        feature.properties!.dataType === DataType.TRAFO ? 23 :
            feature.properties!.dataType === DataType.LINE || feature.properties!.dataType === DataType.REKORTMAN ? 20 : zoom;

    setMapViewState({
        ...mapViewState,
        longitude,
        latitude,
        zoom: zoomLevel,
        maxZoom: MAX_ZOOM,
        transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
        transitionDuration: 2000,
        transitionEasing: t => easeInOutCubic(t),
    })
}