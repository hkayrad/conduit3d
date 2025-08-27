import { useMemo } from "react";
import { COLORS } from "../colors";
import { HatCinsi } from "../enums";
import { filterHat } from "../utils/filterFeature";
import type { MapState } from "../../app/layout/map/mapSlice";

export function useHat(
    agHat: GeoJSON.FeatureCollection,
    ogHat: GeoJSON.FeatureCollection,
    rekortman: GeoJSON.FeatureCollection,
    mapState: MapState) {
    const agHatHavai = useMemo(() => ({
        id: "ag-hat-havai",
        color: COLORS.AG_HAT,
        visibility: mapState.visibility.agHat,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(agHat, "cinsi", HatCinsi.HAVAI)
    }), [agHat, mapState.visibility.agHat]);

    const ogHatHavai = useMemo(() => ({
        id: "og-hat-havai",
        color: COLORS.OG_HAT,
        visibility: mapState.visibility.ogHat,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(ogHat, "cinsi", HatCinsi.HAVAI)
    }), [ogHat, mapState.visibility.ogHat]);

    const rekortmanHavai = useMemo(() => ({
        id: "rekortman-havai",
        color: COLORS.REKORTMAN,
        visibility: mapState.visibility.rekortman,
        cinsi: HatCinsi.HAVAI,
        data: filterHat(rekortman, "tipi", HatCinsi.HAVAI)
    }), [rekortman, mapState.visibility.rekortman]);
    const agHatBara = useMemo(() => {
        return {
            id: "ag-hat-bara",
            color: COLORS.AG_HAT,
            visibility: mapState.visibility.agHat,
            cinsi: HatCinsi.BARA,
            data: filterHat(agHat, "cinsi", HatCinsi.BARA)
        }
    }, [agHat, mapState.visibility.agHat]);
    const ogHatBara = useMemo(() => {
        return {
            id: "og-hat-bara",
            color: COLORS.OG_HAT,
            visibility: mapState.visibility.ogHat,
            cinsi: HatCinsi.BARA,
            data: filterHat(ogHat, "cinsi", HatCinsi.BARA)
        }
    }, [ogHat, mapState.visibility.ogHat]);

    const agHatYeralti = useMemo(() => {
        return {
            id: "ag-hat-yeralti",
            color: COLORS.AG_HAT,
            visibility: mapState.visibility.agHat,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(agHat, "cinsi", HatCinsi.YERALTI)
        }
    }, [agHat, mapState.visibility.agHat]);
    const ogHatYeralti = useMemo(() => {
        return {
            id: "og-hat-yeralti",
            color: COLORS.OG_HAT,
            visibility: mapState.visibility.ogHat,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(ogHat, "cinsi", HatCinsi.YERALTI)
        }
    }, [ogHat, mapState.visibility.ogHat]);
    const rekortmanYeralti = useMemo(() => {
        return {
            id: "rekortman-yeralti",
            color: COLORS.REKORTMAN,
            visibility: mapState.visibility.rekortman,
            cinsi: HatCinsi.YERALTI,
            data: filterHat(rekortman, "tipi", HatCinsi.YERALTI)
        }
    }, [rekortman, mapState.visibility.rekortman]);

    return { hatLayerData: [agHatHavai, ogHatHavai, rekortmanHavai, agHatBara, ogHatBara, agHatYeralti, ogHatYeralti, rekortmanYeralti] };
}