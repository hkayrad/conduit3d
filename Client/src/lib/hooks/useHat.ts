import { useMemo, useState } from "react";
import { filterFeature } from "../utils/geometry/filterFeature";
import { selectMapState } from "../../app/layout/map/mapSlice";
import { COLORS } from "../constants";
import { useAppSelector } from "./reduxHooks";
import { selectConfig } from "../../app/configSlice";
import { hexToRgba } from "../utils";

/**
 * Format the AG Hat feature collection.
 * @returns The formatted AG Hat feature collection.
 */
export function useHat() {
	const { visibility, filters, types } = useAppSelector(selectMapState);
	const config = useAppSelector(selectConfig);

	const [agHat, setAgHat] = useState<GeoJSON.FeatureCollection[]>([]);
	const [ogHat, setOgHat] = useState<GeoJSON.FeatureCollection[]>([]);
	const [rekortman, setRekortman] = useState<GeoJSON.FeatureCollection[]>([]);

	const [overgroundLineWidth, setOvergroundLineWidth] = useState<number>(1);
	const [undergroundLineWidth, setUndergroundLineWidth] = useState<number>(1);

	/**
	 * Formatted AG Hat data for rendering on the map.
	 * @memoized to optimize performance and avoid unnecessary recalculations.
	 */
	const agHatFormatted = useMemo(() => {
		if (!agHat) return [];

		const combinedFeatures = agHat.flatMap((chunk) => chunk?.features ?? []);
		const combinedCollection: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: combinedFeatures,
		};

		const layers = types.agHat.map((type) => {
			return {
				id: `ag-hat-${type}`,
				color: hexToRgba(config[`AG_HAT_${type}_COLOR`] || "#ffffff") || COLORS.AG_HAT,
				visibility: visibility.agHat && (filters.agHat.tipi.includes(type) || filters.agHat.tipi.length === 0),
				cinsi: type,
				data: filterFeature(combinedCollection, "cinsi", type),
			};
		});

		const knownTypes = new Set(types.agHat);
		const otherFeatures = combinedFeatures.filter((f) => !knownTypes.has(f.properties?.cinsi));

		if (otherFeatures.length > 0) {
			layers.push({
				id: `ag-hat-other`,
				color: COLORS.AG_HAT,
				visibility: visibility.agHat,
				cinsi: "Other",
				data: otherFeatures,
			});
		}

		return layers;
	}, [agHat, visibility.agHat, filters.agHat.tipi, config, types.agHat]);

	/**
	 * Formatted OG Hat data for rendering on the map.
	 * @memoized to optimize performance and avoid unnecessary recalculations.
	 */
	const ogHatFormatted = useMemo(() => {
		if (!ogHat) return [];

		const combinedFeatures = ogHat.flatMap((chunk) => chunk?.features ?? []);
		const combinedCollection: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: combinedFeatures,
		};

		const layers = types.ogHat.map((type) => {
			return {
				id: `og-hat-${type}`,
				color: hexToRgba(config[`OG_HAT_${type}_COLOR`] || "#ffffff") || COLORS.OG_HAT,
				visibility: visibility.ogHat && (filters.ogHat.tipi.includes(type) || filters.ogHat.tipi.length === 0),
				cinsi: type,
				data: filterFeature(combinedCollection, "cinsi", type),
			};
		});

		const knownTypes = new Set(types.ogHat);
		const otherFeatures = combinedFeatures.filter((f) => !knownTypes.has(f.properties?.cinsi));

		if (otherFeatures.length > 0) {
			layers.push({
				id: `og-hat-other`,
				color: COLORS.OG_HAT,
				visibility: visibility.ogHat,
				cinsi: "Other",
				data: otherFeatures,
			});
		}

		return layers;
	}, [ogHat, visibility.ogHat, filters.ogHat.tipi, config, types.ogHat]);

	/**
	 * Formatted Rekortman data for rendering on the map.
	 * @memoized to optimize performance and avoid unnecessary recalculations.
	 */
	const rekortmanFormatted = useMemo(() => {
		if (!rekortman) return [];

		const combinedFeatures = rekortman.flatMap((chunk) => chunk?.features ?? []);
		const combinedCollection: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: combinedFeatures,
		};

		const layers = types.rekortman.map((type) => {
			return {
				id: `rekortman-${type}`,
				color: hexToRgba(config[`REKORTMAN_${type}_COLOR`] || "#ffffff") || COLORS.REKORTMAN,
				visibility:
					visibility.rekortman && (filters.rekortman.tipi.includes(type) || filters.rekortman.tipi.length === 0),
				cinsi: type,
				data: filterFeature(combinedCollection, "tipi", type),
			};
		});

		const knownTypes = new Set(types.rekortman);
		const otherFeatures = combinedFeatures.filter((f) => !knownTypes.has(f.properties?.tipi));

		if (otherFeatures.length > 0) {
			layers.push({
				id: `rekortman-other`,
				color: COLORS.REKORTMAN,
				visibility: visibility.rekortman,
				cinsi: "Other",
				data: otherFeatures,
			});
		}

		return layers;
	}, [rekortman, visibility.rekortman, filters.rekortman.tipi, config, types.rekortman]);

	return {
		agHat,
		setAgHat,
		ogHat,
		setOgHat,
		rekortman,
		setRekortman,
		hatLayerData: [agHatFormatted, ogHatFormatted, rekortmanFormatted],
		overgroundLineWidth,
		setOvergroundLineWidth,
		undergroundLineWidth,
		setUndergroundLineWidth,
	};
}
