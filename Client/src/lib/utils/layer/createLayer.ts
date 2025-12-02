import { BitmapLayer, ColumnLayer, PathLayer, SimpleMeshLayer, TileLayer, MVTLayer } from "deck.gl";
import { TileJSONLoader } from "@loaders.gl/mvt";
import { PathStyleExtension } from "@deck.gl/extensions";
import { C3D_MapViewType, HatCinsi } from "../../enums";
import { OBJLoader } from "@loaders.gl/obj";
import { OFFSET_CUBE_MESH } from "../../utils";
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

	static OsmTiles(visibility: boolean) {
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
			minZoom: 16,
			maxZoom: 18,
			tileSize: 256,
			visible: visibility,
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

	static CustomRaster(id: string, url: string, visibility: boolean, opacity: number) {
		return new TileLayer<ImageBitmap>({
			data: [url],
			id: `${id}-custom-layer`,
			maxRequests: 20,
			pickable: false,
			minZoom: 0,
			maxZoom: 19,
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
		flattenUnderground: boolean = false,
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
				getPath: (d) => {
					if (flattenUnderground) {
						// @ts-ignore
						return d.geometry.coordinates.map((coord) => [coord[0], coord[1], 0.1]);
					}
					return d.geometry.coordinates;
				},
				getColor: (d) => (isSelected(d) ? highlightColor : color),
				getWidth: lineWidth,
				pickable: true,
				billboard: !flattenUnderground,
				autoHighlight: true,
				highlightColor: highlightColor,
				visible: visibility,
				extensions: [new PathStyleExtension({ dash: true })],
				getDashArray: dashArray,
				dashJustified: true,
				dashGapPickable: true,
				updateTriggers: {
					getColor: selectedFeature,
					getPath: flattenUnderground,
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

		if (wireframe) {
			return new ColumnLayer({
				id: `${id}-wireframe`,
				data: data ?? [],
				getPosition: (d) => d.geometry.coordinates,
				getElevation: (d) => d.properties.yukseklik,
				getFillColor: [0, 0, 0, 0],
				getLineWidth: 2,
				getLineColor: (d) => (isSelected(d) ? highlightColor : color),
				extruded: true,
				pickable: false,
				radius: 0.5,
				elevationScale: 1,
				diskResolution: 6,
				visible: visibility,
				wireframe: true,
				updateTriggers: {
					getLineColor: [selectedFeature],
				},
			});
		}

		const mesh = id.includes("ag-direk") ? "/obj/lv.obj" : "/obj/mv.obj";
		const scale = id.includes("ag-direk") ? 0.01 : 0.01; // Adjust scale if needed
		const rotation: [number, number, number] = id.includes("ag-direk") ? [0, -45, 0] : [0, 0, 0]; // Adjust rotation if needed

		return new SimpleMeshLayer({
			id: id,
			data: data ?? [],
			getPosition: (d) => d.geometry.coordinates,
			getColor: (d) => (isSelected(d) ? highlightColor : color),
			pickable: true,
			autoHighlight: true,
			highlightColor: highlightColor,
			visible: visibility,
			wireframe: false,
			getScale: (d) => [d.properties.yukseklik * scale, d.properties.yukseklik * scale, d.properties.yukseklik * scale],
			getOrientation: rotation,
			mesh: mesh,
			loaders: [OBJLoader],
			updateTriggers: {
				getColor: [selectedFeature],
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

		if (wireframe) {
			return new ColumnLayer({
				id: `${id}-wireframe`,
				data: data ?? [],
				getPosition: (d) => d.geometry.coordinates,
				getElevation: (d) => d.properties.yukseklik,
				getFillColor: [0, 0, 0, 0],
				getLineWidth: 2,
				getLineColor: (d) => (isSelected(d) ? highlightColor : color),
				extruded: true,
				pickable: false,
				radius: 0.3,
				elevationScale: 1,
				diskResolution: 6,
				visible: visibility,
				wireframe: true,
				updateTriggers: {
					getLineColor: [selectedFeature],
				},
			});
		}

		return new SimpleMeshLayer({
			id: id,
			data: data ?? [],
			getPosition: (d) => d.geometry.coordinates,
			getColor: (d) => (isSelected(d) ? highlightColor : color),
			pickable: true,
			autoHighlight: true,
			highlightColor: highlightColor,
			visible: visibility,
			wireframe: false,
			getScale: (d) => [d.properties.yukseklik, d.properties.yukseklik, d.properties.yukseklik],
			mesh: "/obj/aydDirek.obj",
			loaders: [OBJLoader],
			updateTriggers: {
				getColor: [selectedFeature],
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

	static Armatur(
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
			getPosition: (d: any) => [d.geometry.coordinates[0], d.geometry.coordinates[1], d.properties.poleHeight - 1 || 9],
			getColor: (d) => (isSelected(d) ? highlightColor : color),
			pickable: !wireframe,
			autoHighlight: true,
			highlightColor: highlightColor,
			mesh: wireframe ? OFFSET_CUBE_MESH : "/obj/armatur.obj",
			loaders: wireframe ? undefined : [OBJLoader],
			getScale: wireframe ? [1, 3.0, 0.3] : [0.01, 0.01, 0.01], // Longer rectangular prism for wireframe, scaled obj otherwise
			getOrientation: wireframe ? [0, 315, 0] : [0, 45, 0], // Rotate 90 degrees in wireframe
			visible: visibility,
			wireframe: wireframe,
			updateTriggers: {
				getColor: [selectedFeature, wireframe],
				getPosition: [data],
				getScale: [wireframe],
				getMesh: [wireframe],
			},
		});
	}
	static Buildings(
		id: string,
		data: string | string[],
		color: [number, number, number, number],
		highlightColor: [number, number, number, number],
		visibility: boolean,
		selectedFeature: GeoJSON.Feature | null = null,
		scheme: "xyz" | "tms" = "xyz",
	) {
		const isSelected = (d: any) => selectedFeature && d.properties?.id === selectedFeature.properties?.id;

		return new MVTLayer({
			id,
			data,

			minZoom: 0,
			maxZoom: 16,
			getFillColor: (d: any) => (isSelected(d) ? highlightColor : color),
			getElevation: 12.5,
			extruded: true,
			filled: true,
			pickable: true,
			autoHighlight: true,
			highlightColor,
			visible: visibility,
			loaders: [TileJSONLoader],
			updateTriggers: {
				getFillColor: [selectedFeature],
			},
			getTileData: async (tile: any) => {
				const { x, y, z } = tile.index;
				const urlTemplate = Array.isArray(data) ? data[0] : data;
				const isTms = scheme === "tms" || urlTemplate.includes("/tms/");

				// For TMS, flip the Y coordinate
				const yPos = isTms ? (1 << z) - 1 - y : y;

				console.log(`[DeckGL] Requesting tile: x=${x}, y=${y}, z=${z}, scheme=${scheme}, isTms=${isTms}, yPos=${yPos}`);

				const url = urlTemplate
					.replace("{x}", String(x))
					.replace("{y}", String(yPos))
					.replace("{z}", String(z));

				try {
					const response = await fetch(url);
					if (!response.ok) {
						console.warn(`Failed to fetch tile: ${url}`);
						return null;
					}
					return response.arrayBuffer() as any;
				} catch (error) {
					console.warn(`Error fetching tile: ${url}`, error);
					return null;
				}
			},
		});
	}
}
