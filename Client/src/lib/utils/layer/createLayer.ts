import { BitmapLayer, ColumnLayer, PathLayer, SimpleMeshLayer, TileLayer } from "deck.gl";
import { PathStyleExtension } from "@deck.gl/extensions";
import { C3D_MapViewType, HatCinsi } from "../../enums";
import { OBJLoader } from "@loaders.gl/obj";

/**
 * Class for creating different types of layers.
 */
export class CreateLayer {
	/**
	 * Create local tile layers for the specified cities.
	 * @param visibility Whether the layers should be visible.
	 * @returns An array of TileLayer instances.
	 */
	static LocalTiles(layerFor: C3D_MapViewType, visibility: boolean) {
		return ["turkey", "eskisehir", "erzurum"].map(
			(city) =>
				new TileLayer<ImageBitmap>({
					id: `${layerFor}-${city}-basemap`,
					data: [`${import.meta.env.VITE_TILE_SERVER_URL}/${city}/{z}/{x}/{y}`],
					minZoom: 16,
					maxZoom: city === "turkey" ? 12 : 18,
					tileSize: 256,
					zoomOffset: devicePixelRatio === 1 ? -1 : 0,
					renderSubLayers: (props) => {
						const [[west, south], [east, north]] = props.tile.boundingBox;
						const { data, ...otherProps } = props;

						return [
							new BitmapLayer(otherProps, {
								image: data,
								bounds: [west, south, east, north],
								pickable: false,
							}),
						];
					},
					visible: visibility,
					pickable: false,
				}),
		);
	}

	static OsmTiles(visibility: boolean, opacity: number) {
		return new TileLayer<ImageBitmap>({
			// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
			data: ["https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
			id: "osm-raster-layer",
			// Since these OSM tiles support HTTP/2, we can make many concurrent requests
			// and we aren't limited by the browser to a certain number per domain.
			maxRequests: 20,

			pickable: true,
			highlightColor: [60, 60, 60, 40],
			// https://wiki.openstreetmap.org/wiki/Zoom_levels
			minZoom: 0,
			// maxZoom: 18,
			tileSize: 256,
			visible: visibility,
			opacity: opacity,
			zoomOffset: devicePixelRatio === 1 ? -1 : 0,
			renderSubLayers: (props) => {
				const [[west, south], [east, north]] = props.tile.boundingBox;
				const { data, ...otherProps } = props;

				return [
					new BitmapLayer(otherProps, {
						image: data,
						bounds: [west, south, east, north],
					}),
				];
			},
		});
	}

	/**
	 * Create a path layer for the specified hat feature.
	 * @param id The layer ID.
	 * @param data The feature data.
	 * @param color The line color.
	 * @param lineWidth The line width.
	 * @param visibility Whether the layer should be visible.
	 * @param type The hat type.
	 * @param selectedFeature The currently selected feature for highlighting.
	 * @returns A PathLayer instance.
	 */
	static Hat(
		id: string,
		data: GeoJSON.Feature[],
		color: [number, number, number, number],
		highlightColor: [number, number, number, number],
		lineWidth: number,
		visibility: boolean,
		type: string,
		selectedFeature: GeoJSON.Feature | null = null,
	) {
		const dashArray = type == HatCinsi.BARA ? [4, 2] : [10, 2];
		const isSelected = (d: GeoJSON.Feature) => selectedFeature && d.properties?.id === selectedFeature.properties?.id;

		if (type == HatCinsi.HAVAI)
			return new PathLayer({
				id: id,
				data: data ?? [],
				getPath: (d) => d.geometry.coordinates,
				getColor: (d) => (isSelected(d) ? highlightColor : color),
				getWidth: lineWidth,
				pickable: true,
				billboard: true,
				autoHighlight: true,
				highlightColor: highlightColor,
				visible: visibility,
				updateTriggers: {
					getColor: selectedFeature,
				},
			});
		else
			return new PathLayer({
				id: id,
				data: data ?? [],
				getPath: (d) => d.geometry.coordinates,
				getColor: (d) => (isSelected(d) ? highlightColor : color),
				getWidth: lineWidth,
				pickable: true,
				billboard: true,
				autoHighlight: true,
				highlightColor: highlightColor,
				visible: visibility,
				extensions: [new PathStyleExtension({ dash: true })],
				getDashArray: dashArray,
				dashJustified: true,
				dashGapPickable: true,
				updateTriggers: {
					getColor: selectedFeature,
				},
			});
	}

	/**
	 * Create a column layer for the specified direk feature.
	 * @param id The layer ID.
	 * @param data The feature data.
	 * @param color The fill color.
	 * @param visibility Whether the layer should be visible.
	 * @param selectedFeature The currently selected feature for highlighting.
	 * @returns A ColumnLayer instance.
	 */
	static Direk(
		id: string,
		data: GeoJSON.Feature[],
		color: [number, number, number, number],
		highlightColor: [number, number, number, number],
		visibility: boolean,
		wireframe: boolean = false,
		selectedFeature: GeoJSON.Feature | null = null,
	) {
		const isSelected = (d: GeoJSON.Feature) => selectedFeature && d.properties?.id === selectedFeature.properties?.id;

		return new ColumnLayer({
			id: id,
			data: data ?? [],
			getPosition: (d) => d.geometry.coordinates,
			getElevation: (d) => d.properties.yukseklik,
			getFillColor: wireframe ? [0, 0, 0, 0] : (d) => (isSelected(d) ? highlightColor : color),
			extruded: true,
			pickable: !wireframe,
			autoHighlight: true,
			highlightColor: highlightColor,
			radius: 0.5,
			elevationScale: 1,
			diskResolution: wireframe ? 4 : 12,
			visible: visibility,
			wireframe: wireframe,
			updateTriggers: {
				getFillColor: [selectedFeature, wireframe],
			},
		});
	}

	static AydDirek(
		id: string,
		data: GeoJSON.Feature[],
		color: [number, number, number, number],
		highlightColor: [number, number, number, number],
		visibility: boolean,
		wireframe: boolean = false,
		selectedFeature: GeoJSON.Feature | null = null,
	) {
		const isSelected = (d: GeoJSON.Feature) => selectedFeature && d.properties?.id === selectedFeature.properties?.id;

		return new SimpleMeshLayer({
			id: id,
			data: data ?? [],
			getPosition: (d) => d.geometry.coordinates,
			getColor: (d) => (wireframe ? [0, 0, 0, 128] : isSelected(d) ? highlightColor : color),
			pickable: !wireframe,
			autoHighlight: true,
			highlightColor: highlightColor,
			visible: visibility,
			wireframe: wireframe,
			getScale: (d) => [d.properties.yukseklik, d.properties.yukseklik, d.properties.yukseklik],
			mesh: "/aydDirek.obj",
			loaders: [OBJLoader],
			updateTriggers: {
				getColor: [selectedFeature, wireframe],
			},
		});
	}

	static Yol(
		id: string,
		data: GeoJSON.Feature[],
		color: [number, number, number, number],
		highlightColor: [number, number, number, number],
		lineWidth: number,
		visibility: boolean,
		selectedFeature: GeoJSON.Feature | null = null,
	) {
		const isSelected = (d: GeoJSON.Feature) => selectedFeature && d.properties?.id === selectedFeature.properties?.id;

		return new PathLayer({
			id: id,
			data: data ?? [],
			getPath: (d) => d.geometry.coordinates,
			getColor: (d) => (isSelected(d) ? highlightColor : color),
			getWidth: lineWidth,
			pickable: true,
			autoHighlight: true,
			highlightColor: highlightColor,
			visible: visibility,
			updateTriggers: {
				getColor: selectedFeature,
			},
		});
	}
}
