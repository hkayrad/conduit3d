import { useMemo } from "react";

export function usePoles(
    agDirek: GeoJSON.FeatureCollection,
    ogMusDirek: GeoJSON.FeatureCollection,
    aydDirek: GeoJSON.FeatureCollection
) {
    const allPoles: GeoJSON.Feature[] = useMemo(() => {
        if (agDirek && ogMusDirek && aydDirek)
            return [...agDirek.features, ...ogMusDirek.features, ...aydDirek.features]
        else return [];
    }, [agDirek, ogMusDirek, aydDirek])

    return { allPoles }
}