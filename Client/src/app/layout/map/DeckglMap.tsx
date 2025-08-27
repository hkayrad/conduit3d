import "@deck.gl/widgets/stylesheet.css"
import "deck.gl/stylesheet.css"
import "maplibre-gl/dist/maplibre-gl.css"
import "./style/deckglMap.css"

import { DeckGL } from "@deck.gl/react"
import { CompassWidget, ZoomWidget } from "@deck.gl/widgets";
import { Map as MapLibre } from 'react-map-gl/maplibre';
import { useAppSelector } from "../../../lib/hooks/reduxHooks"
import { useCallback, useEffect, useState } from "react";
import { Layer, MapView, type MapViewState, type PickingInfo } from "@deck.gl/core";
import { selectMapState } from "./mapSlice";
import LayerControl from "./layerControl/LayerControl";
import { ColumnLayer, GeoJsonLayer } from "deck.gl"
import { CreateLayer } from "../../../lib/utils/createLayer"
import { COLORS } from "../../../lib/colors"
import DataComponent from "./data/DataComponent"
import { useHat } from "../../../lib/hooks/useHat"
import useDirek from "../../../lib/hooks/useDirek"
import MousePosition from "./mousePosition/MousePosition"
import Attribution from "./attribution/Attribution"
import { useSearchParams } from "react-router"

// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
// const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright"
// const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

export default function DeckglMap() {
    var [searchParams, setSearchParams] = useSearchParams();

    const [mapViewState, setMapViewState] = useState<MapViewState>({
        longitude: searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : 41.287,
        latitude: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 39.9,
        zoom: searchParams.get("z") ? parseFloat(searchParams.get("z")!) : 15,
        maxZoom: 25,
        pitch: searchParams.get("p") ? parseFloat(searchParams.get("p")!) : 60,
        bearing: searchParams.get("b") ? parseFloat(searchParams.get("b")!) : 0
    });

    const [lineWidth, setLineWidth] = useState<number>(1);
    const mapState = useAppSelector(selectMapState);

    // Map data
    const [adrBina, setAdrBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [trafoBina, setTrafoBina] = useState<GeoJSON.FeatureCollection>(null!);
    const [agDirek, setAgDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogMusDirek, setOgMusDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [aydDirek, setAydDirek] = useState<GeoJSON.FeatureCollection>(null!);
    const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection>(null!);
    const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection>(null!);

    const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);

    const [mouseLonLat, setMouseLonLat] = useState<number[]>([0, 0]);

    const { hatLayerData } = useHat(agHat, ogHat, rekortman, mapState);
    const { direkLayerData, allPoles } = useDirek(agDirek, ogMusDirek, aydDirek, mapState);

    const layers: Layer[] = [
        ...CreateLayer.LocalTiles(mapState.visibility.basemap),
        ...hatLayerData.map(hat =>
            CreateLayer.Hat(
                `${hat.id}-layer`,
                hat.data,
                hat.color,
                lineWidth,
                hat.visibility,
                hat.cinsi
            )
        ),
        ...direkLayerData.map(direk =>
            CreateLayer.Direk(
                `${direk.id}-layer`,
                direk.data,
                direk.color,
                direk.visibility
            )
        ),

        new GeoJsonLayer({
            id: "adr-bina-layer",
            data: adrBina ?? { type: "FeatureCollection", features: [] },
            getElevation: (d) => d.properties.height,
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

    const handleViewStateChange = useCallback((viewState: MapViewState) => {
        setMapViewState(viewState);
        setLineWidth(Number(Math.max((23.5 - viewState.zoom) / 10, 0.01).toFixed(4)));
    }, []);

    const handleMouseMove = useCallback((info: PickingInfo) => {
        setHoveredFeature(info.object);
        setMouseLonLat(info.coordinate ? info.coordinate : [0, 0]);
    }, []);

    const onClick = useCallback((info: PickingInfo, event: any) => {
        console.log('Clicked:', info, event);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchParams(
                {
                    lon: mapViewState.longitude.toString(),
                    lat: mapViewState.latitude.toString(),
                    z: mapViewState.zoom.toFixed(2),
                    p: mapViewState.pitch!.toFixed(2),
                    b: mapViewState.bearing!.toFixed(2),
                },
                {
                    preventScrollReset: true,
                    replace: true
                }
            );
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [mapViewState])

    return (
        <>
            <DataComponent
                allPoles={allPoles}
                setAdrBina={setAdrBina}
                setTrafoBina={setTrafoBina}
                setAgDirek={setAgDirek}
                setOgMusDirek={setOgMusDirek}
                setAydDirek={setAydDirek}
                setAgHat={setAgHat}
                setOgHat={setOgHat}
                setRekortman={setRekortman}
            />
            <div id="map-page">
                <LayerControl />
                <MousePosition mouseLonLat={mouseLonLat} />
                <Attribution />
                <DeckGL
                    controller
                    views={new MapView()}
                    viewState={mapViewState}
                    onViewStateChange={(e) => handleViewStateChange(e.viewState as MapViewState)}
                    layers={layers}
                    widgets={[new ZoomWidget(), new CompassWidget({})]}
                    onClick={onClick}
                    onHover={info => handleMouseMove(info)}
                >
                    <MapLibre
                        reuseMaps
                        // mapStyle={mapState.visibility.basemap ? MAP_STYLE : undefined}
                        attributionControl={false}
                        maxZoom={25}
                        boxZoom={false}
                        cursor={hoveredFeature ? "pointer" : "default"}
                    />
                </DeckGL>
            </div>
        </>
    );
}