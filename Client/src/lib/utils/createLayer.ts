import { BitmapLayer, ColumnLayer, PathLayer, TileLayer } from "deck.gl";
import { COLORS } from "../colors";
import { PathStyleExtension } from "@deck.gl/extensions";
import { HatCinsi } from "../enums";

export class CreateLayer {
    static LocalTiles(
        visibility: boolean
    ) {
        return ["turkey", "eskisehir", "erzurum"].map(city =>
            new TileLayer<ImageBitmap>({
                id: `${city}-basemap`,
                data: [`http://localhost:3001/${city}/{z}/{x}/{y}`],
                minZoom: 0,
                maxZoom: city === "turkey" ? 12 : 18,
                tileSize: 256,
                zoomOffset: devicePixelRatio === 1 ? -1 : 0,
                renderSubLayers: props => {
                    const [[west, south], [east, north]] = props.tile.boundingBox;
                    const { data, ...otherProps } = props;

                    return [
                        new BitmapLayer(otherProps, {
                            image: data,
                            bounds: [west, south, east, north]
                        })
                    ];
                },
                visible: visibility,
            })
        )
    }
    static Hat(
        id: string,
        data: GeoJSON.Feature[],
        color: [number, number, number, number],
        lineWidth: number,
        visibility: boolean,
        type: string) {
        const dashArray = type == HatCinsi.BARA ? [4, 2] : [10, 2];
        if (type == HatCinsi.HAVAI)
            return new PathLayer({
                id: id,
                data: data ? data : [],
                getPath: d => d.geometry.coordinates,
                getColor: color,
                getWidth: lineWidth,
                pickable: true,
                billboard: true,
                autoHighlight: true,
                highlightColor: COLORS.HOVER,
                visible: visibility,
            })
        else
            return new PathLayer({
                id: id,
                data: data ? data : [],
                getPath: d => d.geometry.coordinates,
                getColor: color,
                getWidth: lineWidth,
                pickable: true,
                billboard: false,
                autoHighlight: true,
                highlightColor: COLORS.HOVER,
                visible: visibility,
                extensions: [new PathStyleExtension({ dash: true })],
                getDashArray: dashArray,
                dashJustified: true,
                dashGapPickable: true,
            })
    }

    static Direk(
        id: string,
        data: GeoJSON.Feature[],
        color: [number, number, number, number],
        visibility: boolean,
    ) {
        return new ColumnLayer({
            id: id,
            data: data ? data : [],
            getPosition: d => d.geometry.coordinates,
            getElevation: d => d.properties.height,
            getFillColor: color,
            extruded: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: COLORS.HOVER,
            radius: .5,
            elevationScale: 1,
            visible: visibility,
        })
    }
}