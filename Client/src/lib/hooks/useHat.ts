import { useMemo } from "react";
import { COLORS } from "../colors";
import { filterFeature } from "../utils/filterFeature";
import type { MapState } from "../../app/layout/map/mapSlice";

export function useHat(
    agHat: GeoJSON.FeatureCollection,
    ogHat: GeoJSON.FeatureCollection,
    rekortman: GeoJSON.FeatureCollection,
    types: MapState["types"],
    filters: MapState["filters"],
    visibility: MapState["visibility"]) {
    const agHatFormatted = useMemo(() => {
        if (agHat)
            return types.agHat.map(type => {
                return {
                    id: `ag-hat-${type}`,
                    color: COLORS.AG_HAT,
                    visibility:
                        visibility.agHat &&
                        (filters.agHat.tipi.includes(type) || filters.agHat.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(agHat, "cinsi", type)
                }
            })
        else
            return [];
    }, [agHat, visibility.agHat, filters.agHat.tipi]);

    const ogHatFormatted = useMemo(() => {
        if (ogHat)
            return types.ogHat.map(type => {
                return {
                    id: `og-hat-${type}`,
                    color: COLORS.OG_HAT,
                    visibility:
                        visibility.ogHat &&
                        (filters.ogHat.tipi.includes(type) || filters.ogHat.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(ogHat, "cinsi", type)
                }
            })
        else
            return [];
    }, [ogHat, visibility.ogHat, filters.ogHat.tipi]);

    const rekortmanFormatted = useMemo(() => {
        if (rekortman)
            return types.rekortman.map(type => {
                return {
                    id: `rekortman-${type}`,
                    color: COLORS.REKORTMAN,
                    visibility:
                        visibility.rekortman &&
                        (filters.rekortman.tipi.includes(type) || filters.rekortman.tipi.length === 0),
                    cinsi: type,
                    data: filterFeature(rekortman, "tipi", type)
                }
            })
        else
            return [];
    }, [rekortman, visibility.rekortman, filters.rekortman.tipi]);

    // const ogHatHavai = useMemo(() => ({
    //     id: "og-hat-havai",
    //     color: COLORS.OG_HAT,
    //     visibility: visibility.ogHat,
    //     cinsi: HatCinsi.HAVAI,
    //     data: filterHat(ogHat, "cinsi", HatCinsi.HAVAI)
    // }), [ogHat, visibility.ogHat]);

    // const rekortmanHavai = useMemo(() => ({
    //     id: "rekortman-havai",
    //     color: COLORS.REKORTMAN,
    //     visibility: visibility.rekortman,
    //     cinsi: HatCinsi.HAVAI,
    //     data: filterHat(rekortman, "tipi", HatCinsi.HAVAI)
    // }), [rekortman, visibility.rekortman]);
    // const agHatBara = useMemo(() => {
    //     return {
    //         id: "ag-hat-bara",
    //         color: COLORS.AG_HAT,
    //         visibility: visibility.agHat,
    //         cinsi: HatCinsi.BARA,
    //         data: filterHat(agHat, "cinsi", HatCinsi.BARA)
    //     }
    // }, [agHat, visibility.agHat]);
    // const ogHatBara = useMemo(() => {
    //     return {
    //         id: "og-hat-bara",
    //         color: COLORS.OG_HAT,
    //         visibility: visibility.ogHat,
    //         cinsi: HatCinsi.BARA,
    //         data: filterHat(ogHat, "cinsi", HatCinsi.BARA)
    //     }
    // }, [ogHat, visibility.ogHat]);

    // const agHatYeralti = useMemo(() => {
    //     return {
    //         id: "ag-hat-yeralti",
    //         color: COLORS.AG_HAT,
    //         visibility: visibility.agHat,
    //         cinsi: HatCinsi.YERALTI,
    //         data: filterHat(agHat, "cinsi", HatCinsi.YERALTI)
    //     }
    // }, [agHat, visibility.agHat]);
    // const ogHatYeralti = useMemo(() => {
    //     return {
    //         id: "og-hat-yeralti",
    //         color: COLORS.OG_HAT,
    //         visibility: visibility.ogHat,
    //         cinsi: HatCinsi.YERALTI,
    //         data: filterHat(ogHat, "cinsi", HatCinsi.YERALTI)
    //     }
    // }, [ogHat, visibility.ogHat]);
    // const rekortmanYeralti = useMemo(() => {
    //     return {
    //         id: "rekortman-yeralti",
    //         color: COLORS.REKORTMAN,
    //         visibility: visibility.rekortman,
    //         cinsi: HatCinsi.YERALTI,
    //         data: filterHat(rekortman, "tipi", HatCinsi.YERALTI)
    //     }
    // }, [rekortman, visibility.rekortman]);

    return { hatLayerData: [agHatFormatted, ogHatFormatted, rekortmanFormatted] };
}