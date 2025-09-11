import { FlyToInterpolator, WebMercatorViewport, type MapViewState } from "@deck.gl/core";
import { C3D_MapViewType, FeatureType } from "../../enums";
import { bbox } from "@turf/turf";
import { easeInOutCubic } from "..";
import { MAX_ZOOM } from "../../constants";
import type { C3D_ViewState } from "../../types";

/**
 * Fly to a specific feature on the map.
 * @param feature The GeoJSON feature to fly to.
 * @param mapViewState The current map view state.
 * @param setMapViewState The function to update the map view state.
 */
export function flyToFeature(
    feature: GeoJSON.Feature,
    mapViewState: MapViewState,
    setMapViewState: React.Dispatch<React.SetStateAction<C3D_ViewState>>) {
    if (!feature) return;

    // Get the bounding box of the feature using turf.bbox
    const [minLng, minLat, maxLng, maxLat] = bbox(feature);

    // Calculate the new center and zoom level to fit the feature within the viewport
    const { longitude, latitude, zoom } = new WebMercatorViewport(mapViewState).fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        {
            padding: 300
        }
    );

    const dataType = feature.properties!.dataType as FeatureType;

    const zoomLevel = dataType === FeatureType.POLE ? 20 :
        dataType === FeatureType.TRAFO ? 23 :
            dataType === FeatureType.LINE || dataType === FeatureType.REKORTMAN ? 20 : zoom;

    setMapViewState((prevState) => ({
        ...prevState,
        [C3D_MapViewType.Cartesian]: {
            ...mapViewState,
            longitude,
            latitude,
            zoom: zoomLevel,
            maxZoom: MAX_ZOOM,
            transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
            transitionDuration: 2000,
            transitionEasing: t => easeInOutCubic(t),
        }
    }))
}