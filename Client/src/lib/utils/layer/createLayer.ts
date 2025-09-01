import { BitmapLayer, ColumnLayer, PathLayer, TileLayer } from "deck.gl";
import { PathStyleExtension } from "@deck.gl/extensions";
import { HatCinsi } from "../../enums";
import { COLORS } from "../../constants";

/**
 * Class for creating different types of layers.
 */
export class CreateLayer {
    /**
     * Create local tile layers for the specified cities.
     * @param visibility Whether the layers should be visible.
     * @returns An array of TileLayer instances.
     */
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

    /**
     * Create a path layer for the specified hat feature.
     * @param id The layer ID.
     * @param data The feature data.
     * @param color The line color.
     * @param lineWidth The line width.
     * @param visibility Whether the layer should be visible.
     * @param type The hat type.
     * @returns A PathLayer instance.
     */
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

    /**
     * Create a column layer for the specified direk feature.
     * @param id The layer ID.
     * @param data The feature data.
     * @param color The fill color.
     * @param visibility Whether the layer should be visible.
     * @returns A ColumnLayer instance.
     */
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