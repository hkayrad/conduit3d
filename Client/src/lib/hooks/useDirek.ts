import { useMemo } from "react"
import { COLORS } from "../colors"
import type { MapState } from "../../app/layout/map/mapSlice"

export default function useDirek(
    agDirek: GeoJSON.FeatureCollection,
    ogMusDirek: GeoJSON.FeatureCollection,
    aydDirek: GeoJSON.FeatureCollection,
    types: MapState["types"],
    filters: MapState["filters"],
    visibility: MapState["visibility"]
) {
    const agDirekFormatted = useMemo(() => {
        if (agDirek)
            return types.agDirek.map(type => {
                return {
                    id: `ag-direk-${type}`,
                    data: agDirek.features.filter(f => f.properties!.tipi === type),
                    color: COLORS.AG_DIREK,
                    visibility:
                        visibility.agDirek &&
                        (filters.agDirek.tipi.includes(type)/*  || filters.agDirek.tipi.length === 0 */),
                }
            });
        else
            return [];
    }, [agDirek, visibility.agDirek, filters.agDirek.tipi]);
    const ogMusDirekFormatted = useMemo(() => {
        if (ogMusDirek)
            return types.ogMusDirek.map(type => {
                return {
                    id: `og-mus-direk-${type}`,
                    data: ogMusDirek.features.filter(f => f.properties!.tipi === type),
                    color: COLORS.OG_MUS_DIREK,
                    visibility:
                        visibility.ogMusDirek &&
                        (filters.ogMusDirek.tipi.includes(type)/*  || filters.ogMusDirek.tipi.length === 0 */),
                }
            });
        else
            return [];
    }, [ogMusDirek, visibility.ogMusDirek, filters.ogMusDirek.tipi]);
    const aydDirekFormatted = useMemo(() => {
        if (aydDirek)
            return types.aydDirek.map(type => {
                return {
                    id: `ayd-direk-${type}`,
                    data: aydDirek.features.filter(f => f.properties!.tipi === type),
                    color: COLORS.AYD_DIREK,
                    visibility:
                        visibility.aydDirek &&
                        (filters.aydDirek.tipi.includes(type)/*  || filters.aydDirek.tipi.length === 0 */),
                }
            });
        else
            return [];
    }, [aydDirek, visibility.aydDirek, filters.aydDirek.tipi]);

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