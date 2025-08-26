import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { DeckGL } from "@deck.gl/react"
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useAppSelector } from "../../../lib/hooks"
import { useEffect, useState } from "react";
import { Layer, type MapViewState } from "@deck.gl/core";
import { selectMapState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import AdrBinaComponent from "./data/AdrBinaComponent"
import { ColumnLayer, GeoJsonLayer } from "deck.gl"
import AgDirekComponent from "./data/AgDirekComponent"
import OgMusDirekComponent from "./data/OgMusDirekComponent"
import AydDirekComponent from "./data/AydDirekComponent"

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

const COLORS: { [name: string]: [number, number, number, number] } = {
    HOVER: [222, 98, 27, 128],
    ADR_BINA: [200, 200, 200, 255],
    AG_DIREK: [100, 100, 255, 255],
    AYD_DIREK: [100, 255, 100, 255],
    OG_MUS_DIREK: [255, 100, 100, 255],
}

export default function DeckglMap() {
    const [mapViewState, setMapViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
    const mapState = useAppSelector(selectMapState);

    // Map data
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection>(null!);

    const handleViewStateChange = (viewState: MapViewState) => {
        setMapViewState(viewState);
    }

    const layers: Layer[] = [
        new GeoJsonLayer({
            id: "adr-bina-layer",
            data: adrBina,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.ADR_BINA,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.adrBina,
            pickable: true,
            extruded: true,
            filled: true,
        }),
        new ColumnLayer({
            id: "ag-direk-layer",
            data: agDirek ? agDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.AG_DIREK,
            radius: .5,
            elevationScale: 1,
            extruded: true,
            visible: mapState.visibility.agDirek,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
        }),
        new ColumnLayer({
            id: "og-mus-direk-layer",
            data: ogMusDirek ? ogMusDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.OG_MUS_DIREK,
            radius: .5,
            elevationScale: 1,
            extruded: true,
            visible: mapState.visibility.ogMusDirek,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
        }),
        new ColumnLayer({
            id: "ayd-direk-layer",
            data: aydDirek ? aydDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.AYD_DIREK,
            radius: .5,
            elevationScale: 1,
            extruded: true,
            visible: mapState.visibility.aydDirek,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
        })
    ]

    useEffect(() => {
        console.log(adrBina);
    }, [adrBina]);

    return (
        <>
            <AdrBinaComponent
                setData={setAdrBina}
            />
            <AgDirekComponent
                setData={setAgDirek}
            />
            <OgMusDirekComponent
                setData={setOgMusDirek}
            />
            <AydDirekComponent
                setData={setAydDirek}
            />
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
        </>
    );
}