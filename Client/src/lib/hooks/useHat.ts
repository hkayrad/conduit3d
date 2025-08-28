import { useMemo } from "react";
import { COLORS } from "../colors";
import { HatCinsi } from "../enums";
import { filterHat } from "../utils/filterFeature";
import type { MapState } from "../../app/layout/map/mapSlice";

export function useHat(
    agHat: GeoJSON.FeatureCollection,
    ogHat: GeoJSON.FeatureCollection,
    rekortman: GeoJSON.FeatureCollection,
    visibility: MapState["visibility"]) {
    const agHatHavai = useMemo(() => ({
        id: "ag-hat-havai",
        color: COLORS.AG_HAT,
        visibility: visibility.agHat,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(agHat, "cinsi", HatCinsi.HAVAI)
    }), [agHat, visibility.agHat]);

    const ogHatHavai = useMemo(() => ({
        id: "og-hat-havai",
        color: COLORS.OG_HAT,
        visibility: visibility.ogHat,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(ogHat, "cinsi", HatCinsi.HAVAI)
    }), [ogHat, visibility.ogHat]);

    const rekortmanHavai = useMemo(() => ({
        id: "rekortman-havai",
        color: COLORS.REKORTMAN,
        visibility: visibility.rekortman,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(rekortman, "tipi", HatCinsi.HAVAI)
    }), [rekortman, visibility.rekortman]);
    const agHatBara = useMemo(() => {
        return {
            id: "ag-hat-bara",
            color: COLORS.AG_HAT,
            visibility: visibility.agHat,
            cinsi: HatCinsi.BARA,
            data: filterHat(agHat, "cinsi", HatCinsi.BARA)
        }
    }, [agHat, visibility.agHat]);
    const ogHatBara = useMemo(() => {
        return {
            id: "og-hat-bara",
            color: COLORS.OG_HAT,
            visibility: visibility.ogHat,
            cinsi: HatCinsi.BARA,
            data: filterHat(ogHat, "cinsi", HatCinsi.BARA)
        }
    }, [ogHat, visibility.ogHat]);

    const agHatYeralti = useMemo(() => {
        return {
            id: "ag-hat-yeralti",
            color: COLORS.AG_HAT,
            visibility: visibility.agHat,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(agHat, "cinsi", HatCinsi.YERALTI)
        }
    }, [agHat, visibility.agHat]);
    const ogHatYeralti = useMemo(() => {
        return {
            id: "og-hat-yeralti",
            color: COLORS.OG_HAT,
            visibility: visibility.ogHat,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(ogHat, "cinsi", HatCinsi.YERALTI)
        }
    }, [ogHat, visibility.ogHat]);
    const rekortmanYeralti = useMemo(() => {
        return {
            id: "rekortman-yeralti",
            color: COLORS.REKORTMAN,
            visibility: visibility.rekortman,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(rekortman, "tipi", HatCinsi.YERALTI)
        }
    }, [rekortman, visibility.rekortman]);

    return { hatLayerData: [agHatHavai, ogHatHavai, rekortmanHavai, agHatBara, ogHatBara, agHatYeralti, ogHatYeralti, rekortmanYeralti] };
}