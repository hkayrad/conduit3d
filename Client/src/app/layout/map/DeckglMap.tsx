import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"

import { DeckGL } from "@deck.gl/react"
import { Map as MapLibre } from 'react-map-gl/maplibre';

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright"
const INITIAL_VIEW_STATE = {
    longitude: 41.287,
    latitude: 39.8999,
    zoom: 15,
    maxZoom: 25,
    pitch: 60,
    bearing: 0
}

export default function DeckglMap() {

    return (
        <DeckGL
            controller
            initialViewState={INITIAL_VIEW_STATE}
        >
            <MapLibre
                reuseMaps
                mapStyle={MAP_STYLE}
                projection={"globe"}
                attributionControl={false}
                maxZoom={25}
                boxZoom={false}
            />
        </DeckGL>
    );
}