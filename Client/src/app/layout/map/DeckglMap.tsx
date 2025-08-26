import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { DeckGL } from "@deck.gl/react"
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useAppSelector } from "../../../lib/hooks"
import { useState } from "react";
import { Layer, type MapViewState } from "@deck.gl/core";
import { selectMapState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

const INITIAL_VIEW_STATE = {
    longitude: 41.287,
    latitude: 39.8999,
    zoom: 15,
    maxZoom: 25,
    pitch: 60,
    bearing: 0
}

export default function DeckglMap() {
    const [mapViewState, setMapViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

    const mapState = useAppSelector(selectMapState);

    const handleViewStateChange = (viewState: MapViewState) => {
        setMapViewState(viewState);
    }

    const layers: Layer[] = [];

    return (
        <div id="map-page">
            <LayerControl />
            <DeckGL
                controller
                viewState={mapViewState}
                onViewStateChange={(e) => handleViewStateChange(e.viewState as MapViewState)}
                layers={layers}
            >
                <MapLibre
                    reuseMaps
                    mapStyle={mapState.visibility.basemap ? MAP_STYLE : undefined}
                    projection={"globe"}
                    attributionControl={false}
                    maxZoom={25}
                    boxZoom={false}
                />
            </DeckGL>
        </div>
    );
}