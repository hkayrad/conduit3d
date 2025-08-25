import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"

import { DeckGL } from "@deck.gl/react"
import { Map as MapLibre } from 'react-map-gl/maplibre';
import TrafoBina from "./trafoBina/TrafoBina";
import AdrBina from "./adrBina/AdrBina";
import { useAppSelector } from "../../../lib/hooks"
import { useEffect, useState } from "react";
import { Layer, type MapViewState } from "@deck.gl/core";
import { selectTrafoBina } from "./trafoBina/trafoBinaSlice";
import { selectAdrBina } from "./adrBina/adrBinaSlice";
import { selectMapState, type MapState } from "./mapSlice";
import { useDispatch } from "react-redux";

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
    const [mapViewState, setMapViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
    const [layers, setLayers] = useState<Layer[]>([]);

    const dispatch = useDispatch();
    const mapState = useAppSelector(selectMapState);
    const trafoBina = useAppSelector(selectTrafoBina);
    const adrBina = useAppSelector(selectAdrBina);

    const handleViewStateChange = (viewState: MapViewState) => {
        setMapViewState(viewState);
    }

    const handleLayerToggle = (layer: keyof MapState) => {
        const isVisible = mapState[layer];
        dispatch({ type: "map/setMapLayerVisibility", payload: { layer, visible: !isVisible } });
    }

    return (
        <>
            <div style={{ position: "absolute", top: '64px', left: 0, zIndex: 1, display: "flex", flexDirection: "column" }}>
                {Object.keys(mapState).map((layer) => (
                    <button key={layer} onClick={() => handleLayerToggle(layer as keyof MapState)}>
                        Toggle {layer}
                    </button>
                ))}
            </div>
            <DeckGL
                controller
                viewState={mapViewState}
                onViewStateChange={(e) => handleViewStateChange(e.viewState as MapViewState)}
                layers={layers}
            >
                <AdrBina />
                <TrafoBina />
                <MapLibre
                    reuseMaps
                    mapStyle={mapState.isBasemapVisible ? MAP_STYLE : undefined}
                    projection={"globe"}
                    attributionControl={false}
                    maxZoom={25}
                    boxZoom={false}
                />
            </DeckGL>
        </>
    );
}