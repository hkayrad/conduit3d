import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { DeckGL } from "@deck.gl/react"
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useAppSelector } from "../../../lib/hooks"
import { useCallback, useMemo, useState } from "react";
import { Layer, MapView, type MapViewState, type PickingInfo } from "@deck.gl/core";
import { selectMapState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import { ColumnLayer, GeoJsonLayer, PathLayer } from "deck.gl"
import AdrBinaComponent from "./data/buildings/AdrBinaComponent"
import TrafoBinaComponent from "./data/buildings/TrafoBinaComponent"
import AgDirekComponent from "./data/poles/AgDirekComponent"
import OgMusDirekComponent from "./data/poles/OgMusDirekComponent"
import AydDirekComponent from "./data/poles/AydDirekComponent"
import AgHatComponent from "./data/lines/AgHatComponent"
import OgHatComponent from "./data/lines/OgHatComponent"
import { PathStyleExtension } from "@deck.gl/extensions"

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
    TRAFO_BINA: [200, 200, 200, 128],
    AG_DIREK: [100, 100, 255, 255],
    AYD_DIREK: [100, 255, 100, 255],
    OG_MUS_DIREK: [255, 100, 100, 255],
    AG_HAT: [255, 200, 100, 255],
    OG_HAT: [200, 100, 255, 255],
    REKORTMAN: [255, 100, 200, 255],
}

export default function DeckglMap() {
    const [mapViewState, setMapViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
    const [lineWidth, setLineWidth] = useState<number>(.5);
    const mapState = useAppSelector(selectMapState);

    // Map data
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection>(null!);

    const handleViewStateChange = (viewState: MapViewState) => {
        setMapViewState(viewState);
        setLineWidth(Number(Math.max((23 - viewState.zoom) / 10, 0.01).toFixed(4)));
    }

    const agHatHavai = useMemo(() => {
        return agHat && agHat.features.filter(f => f.properties && f.properties.cinsi === "HAVAİ");
    }, [agHat]);

    const agHatBara = useMemo(() => {
        return agHat && agHat.features.filter(f => f.properties && f.properties.cinsi === "BARA");
    }, [agHat]);

    const agHatYeralti = useMemo(() => {
        return agHat && agHat.features.filter(f => f.properties && f.properties.cinsi === "YERALTI");
    }, [agHat]);

    const ogHatHavai = useMemo(() => {
        return ogHat && ogHat.features.filter(f => f.properties && f.properties.cinsi === "HAVAİ");
    }, [ogHat]);

    const ogHatBara = useMemo(() => {
        return ogHat && ogHat.features.filter(f => f.properties && f.properties.cinsi === "BARA");
    }, [ogHat]);

    const ogHatYeralti = useMemo(() => {
        return ogHat && ogHat.features.filter(f => f.properties && f.properties.cinsi === "YERALTI");
    }, [ogHat]);

    const layers: Layer[] = [

        new PathLayer({
            id: "ag-hat-havai-layer",
            data: agHatHavai ? agHatHavai : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.AG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
        }),
        new PathLayer({
            id: "ag-hat-bara-layer",
            data: agHatBara ? agHatBara : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.AG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: false,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [4, 2]
        }),
        new PathLayer({
            id: "ag-hat-yeralti-layer",
            data: agHatYeralti ? agHatYeralti : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.AG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: false,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [4, 2]
        }),
        new PathLayer({
            id: "og-hat-havai-layer",
            data: ogHatHavai ? ogHatHavai : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.OG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
        }),
        new PathLayer({
            id: "og-hat-bara-layer",
            data: ogHatBara ? ogHatBara : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.OG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: false,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [4, 2]
        }),
        new PathLayer({
            id: "og-hat-yeralti-layer",
            data: ogHatYeralti ? ogHatYeralti : [],
            getPath: d => d.geometry.coordinates,
            getColor: COLORS.OG_HAT,
            getWidth: lineWidth,
            pickable: true,
            billboard: false,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.agHat,
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [4, 2]
        }),
        new ColumnLayer({
            id: "ag-direk-layer",
            data: agDirek ? agDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.AG_DIREK,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            elevationScale: 1,
            radius: .5,
            visible: mapState.visibility.agDirek,
        }),
        new ColumnLayer({
            id: "og-mus-direk-layer",
            data: ogMusDirek ? ogMusDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.OG_MUS_DIREK,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            radius: .5,
            elevationScale: 1,
            visible: mapState.visibility.ogMusDirek,
        }),
        new ColumnLayer({
            id: "ayd-direk-layer",
            data: aydDirek ? aydDirek.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.AYD_DIREK,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            radius: .5,
            elevationScale: 1,
            visible: mapState.visibility.aydDirek,
        }),
        new GeoJsonLayer({
            id: "adr-bina-layer",
            data: adrBina,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.ADR_BINA,
            filled: true,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            visible: mapState.visibility.adrBina,
        }),
        new ColumnLayer({
            id: "trafo-bina-layer",
            data: trafoBina ? trafoBina.features : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: COLORS.TRAFO_BINA,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            radius: 1,
            elevationScale: 1,
            diskResolution: 4,
            visible: mapState.visibility.trafoBina,
        })
    ]

    const onClick = useCallback((info: PickingInfo, event: any) => {
        console.log('Clicked:', info, event);
    }, []);

    return (
        <>
            <AdrBinaComponent
                setData={setAdrBina}
            />
            <TrafoBinaComponent
                setData={setTrafoBina}
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
            <AgHatComponent
                setData={setAgHat}
                agDirek={agDirek}
                ogMusDirek={ogMusDirek}
                aydDirek={aydDirek}
            />
            <OgHatComponent
                setData={setOgHat}
                agDirek={agDirek}
                ogMusDirek={ogMusDirek}
                aydDirek={aydDirek}
            />
            <div id="map-page">
                <LayerControl />
                <DeckGL
                    controller
                    views={new MapView()}
                    viewState={mapViewState}
                    onViewStateChange={(e) => handleViewStateChange(e.viewState as MapViewState)}
                    layers={layers}
                    widgets={[new ZoomWidget(), new CompassWidget({})]}
                    onClick={onClick}
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