import { useMemo } from "react"
import { COLORS } from "../colors"
import type { MapState } from "../../app/layout/map/mapSlice"

export default function useDirek(
    agDirek: GeoJSON.FeatureCollection,
    ogMusDirek: GeoJSON.FeatureCollection,
    aydDirek: GeoJSON.FeatureCollection,
    mapState: MapState) {
    const agDirekFormatted = useMemo(() => {
        return {
            id: "ag-direk",
            data: agDirek,
            color: COLORS.AG_DIREK,
            visibility: mapState.visibility.agDirek,
        }
    }, [agDirek, mapState.visibility.agDirek]);
    const ogMusDirekFormatted = useMemo(() => {
        return {
            id: "og-mus-direk",
            data: ogMusDirek,
            color: COLORS.OG_MUS_DIREK,
            visibility: mapState.visibility.ogMusDirek,
        }
    }, [ogMusDirek, mapState.visibility.ogMusDirek]);
    const aydDirekFormatted = useMemo(() => {
        return {
            id: "ayd-direk",
            data: aydDirek,
            color: COLORS.AYD_DIREK,
            visibility: mapState.visibility.aydDirek,
        }
    }, [aydDirek, mapState.visibility.aydDirek]);

    const allPoles: GeoJSON.Feature[] = useMemo(() => {
        if (agDirek && ogMusDirek && aydDirek)
            return [...agDirek.features, ...ogMusDirek.features, ...aydDirek.features]
        else return [];
    }, [agDirek, ogMusDirek, aydDirek])

    return {
        direkLayerData: [agDirekFormatted, ogMusDirekFormatted, aydDirekFormatted],
        allPoles
    };
}