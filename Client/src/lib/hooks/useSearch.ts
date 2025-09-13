import { useState } from "react";
import { findAverageLonLat, InputSanitizer } from "../utils";
import { AdrBinaApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from "../api";
import { FeatureType } from "../enums";

export function useSearch(query: string, maxResults: number = 10) {
    const [results, setResults] = useState<
        Array<{
            id: string;
            title: string;
            subtitle: string;
            type: FeatureType;
            position: string;
            feature: GeoJSON.Feature;
        }>>([]);

    enum QueryKeywords {
        BINA = "bina",
        TRAFO = "trafo",
        DIREK = "direk",
        HAT = "hat",
        REKORTMAN = "rekortman"
    }

    const _wrapInFeature = (geometry: GeoJSON.Geometry): GeoJSON.Feature => {
        return {
            type: "Feature",
            geometry,
            properties: {}
        };
    }

    const _handleAdrBinaSearch = async (binaQuery: string) => {
        const binaResponse = await AdrBinaApi.fetchAll(maxResults, 1, 'id', true, binaQuery);

        if (!binaResponse.isSuccess) {
            console.error("Bina API error:", binaResponse.message);
            return [];
        }

        const binaResults = binaResponse.data.map(bina => {
            const geometry: GeoJSON.Geometry = JSON.parse(bina.geoJson);
            console.log(geometry);

            return {
                id: `bina-${bina.id}`,
                title: bina.adi || "İsimsiz Bina",
                subtitle: bina.siteAdi || "Sitesiz Bina",
                type: FeatureType.BUILDING,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return binaResults;
    }

    const _handleTrafoSearch = async (trafoQuery: string) => {
        const trafoResponse = await TrafoBinaApi.fetchAll(maxResults, 1, 'id', true, trafoQuery);

        if (!trafoResponse.isSuccess) {
            console.error("Trafo API error:", trafoResponse.message);
            return [];
        }

        const trafoResults = trafoResponse.data.map(trafo => {
            const geometry: GeoJSON.Geometry = JSON.parse(trafo.geoJson);
            return {
                id: `trafo-${trafo.id}`,
                title: trafo.adi || "İsimsiz Trafo",
                subtitle: trafo.kodu || "Kodsuz Trafo",
                type: FeatureType.TRAFO,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return trafoResults;
    }

    const _handleDirekSearch = async (direkQuery: string) => {
        const [agResponse, aydResponse, ogResponse] = await Promise.all([
            AgDirekApi.fetchAll(maxResults, 1, 'id', true, direkQuery),
            AydDirekApi.fetchAll(maxResults, 1, 'id', true, direkQuery),
            OgMusDirekApi.fetchAll(maxResults, 1, 'id', true, direkQuery)
        ]);

        const direkResults: any[] = [];

        if (agResponse.isSuccess) {
            const agDirekResults = agResponse.data.map(direk => {
                const geometry: GeoJSON.Geometry = JSON.parse(direk.geoJson);
                return {
                    id: `direk-ag-${direk.id}`,
                    title: `${direk.cinsi} ${direk.tipi} (${direk.boyOzellik})`,
                    subtitle: direk.direkNo,
                    type: FeatureType.POLE,
                    position: findAverageLonLat(geometry, 2),
                    feature: _wrapInFeature(geometry)
                }
            });
            direkResults.push(...agDirekResults);
        } else {
            console.error("AG Direk API error:", agResponse.message);
        }

        if (aydResponse.isSuccess) {
            const aydDirekResults = aydResponse.data.map(direk => {
                const geometry: GeoJSON.Geometry = JSON.parse(direk.geoJson);
                return {
                    id: `direk-ayd-${direk.id}`,
                    title: `${direk.cinsi} ${direk.tipi} (${direk.boyOzellik})`,
                    subtitle: direk.direkNo,
                    type: FeatureType.POLE,
                    position: findAverageLonLat(geometry, 2),
                    feature: _wrapInFeature(geometry)
                }
            });
            direkResults.push(...aydDirekResults);
        } else {
            console.error("AYD Direk API error:", aydResponse.message);
        }

        if (ogResponse.isSuccess) {
            const ogDirekResults = ogResponse.data.map(direk => {
                const geometry: GeoJSON.Geometry = JSON.parse(direk.geoJson);
                return {
                    id: `direk-og-${direk.id}`,
                    title: `${direk.cinsi} ${direk.tipi} (${direk.boyOzellik})`,
                    subtitle: direk.direkNo,
                    type: FeatureType.POLE,
                    position: findAverageLonLat(geometry, 2),
                    feature: _wrapInFeature(geometry)
                }
            });
            direkResults.push(...ogDirekResults);
        } else {
            console.error("OG Direk API error:", ogResponse.message);
        }

        return direkResults;
    }

    const _handleRekortmanSearch = async (rekortmanQuery: string) => {
        const rekortmanResponse = await RekortmanApi.fetchAll(maxResults, 1, 'id', true, rekortmanQuery);

        if (!rekortmanResponse.isSuccess) {
            console.error("Rekortman API error:", rekortmanResponse.message);
            return [];
        }

        const rekortmanResults = rekortmanResponse.data.map(hat => {
            const geometry: GeoJSON.Geometry = JSON.parse(hat.geoJson);
            return {
                id: `hat-ag-${hat.id}`,
                title: `Rekortman: ${hat.tipi}`,
                subtitle: hat.kesit,
                type: FeatureType.REKORTMAN,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return rekortmanResults;
    }

    const _handleHatSearch = async (hatQuery: string) => {
        const [agResponse, ogResponse] = await Promise.all([
            AgHatApi.fetchAll(maxResults, 1, 'id', true, hatQuery),
            OgHatApi.fetchAll(maxResults, 1, 'id', true, hatQuery)
        ]);
        const rekortmanResults = await _handleRekortmanSearch(hatQuery);

        const hatResults: any[] = [];

        if (agResponse.isSuccess) {
            const agHatResults = agResponse.data.map(hat => {
                const geometry: GeoJSON.Geometry = JSON.parse(hat.geoJson);
                return {
                    id: `hat-ag-${hat.id}`,
                    title: `${hat.tipi} ${hat.cinsi}`,
                    subtitle: hat.kesit,
                    type: FeatureType.LINE,
                    position: findAverageLonLat(geometry, 2),
                    feature: _wrapInFeature(geometry)
                }
            });
            hatResults.push(...agHatResults);
        } else {
            console.error("AG Hat API error:", agResponse.message);
        }

        if (ogResponse.isSuccess) {
            const ogHatResults = ogResponse.data.map(hat => {
                const geometry: GeoJSON.Geometry = JSON.parse(hat.geoJson);
                return {
                    id: `hat-og-${hat.id}`,
                    title: `${hat.tipi} ${hat.cinsi}`,
                    subtitle: hat.kesit,
                    type: FeatureType.LINE,
                    position: findAverageLonLat(geometry, 2),
                    feature: _wrapInFeature(geometry)
                }
            });
            hatResults.push(...ogHatResults);
        } else {
            console.error("OG Hat API error:", ogResponse.message);
        }

        if (rekortmanResults.length > 0) {
            hatResults.push(...rekortmanResults);
        }

        return hatResults;
    }

    const handleSearch = async () => {
        const sanitizedQuery = InputSanitizer.sanitizeSearchQuery(query).toLowerCase();

        if (sanitizedQuery.length === 0) {
            setResults([]);
            return;
        }

        try {
            let aggregatedResults: any[] = [];

            if (!sanitizedQuery.includes(":")) {
                const binaResults = await _handleAdrBinaSearch(sanitizedQuery);
                const trafoResults = await _handleTrafoSearch(sanitizedQuery);
                const direkResults = await _handleDirekSearch(sanitizedQuery);
                const hatResults = await _handleHatSearch(sanitizedQuery);

                aggregatedResults = aggregatedResults
                    .concat(binaResults)
                    .concat(trafoResults)
                    .concat(direkResults)
                    .concat(hatResults);
                setResults(aggregatedResults.slice(0, maxResults));
                return;
            }

            const queryPart = sanitizedQuery.split(":")[1].trim();
            switch (sanitizedQuery.split(":")[0]) {
                case QueryKeywords.BINA:
                    const binaResults = await _handleAdrBinaSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(binaResults);
                    break;

                case QueryKeywords.TRAFO:
                    const trafoResults = await _handleTrafoSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(trafoResults);
                    break;

                case QueryKeywords.DIREK:
                    const direkResults = await _handleDirekSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(direkResults);
                    break;

                case QueryKeywords.REKORTMAN:
                    const rekortmanResults = await _handleRekortmanSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(rekortmanResults);
                    break;

                case QueryKeywords.HAT:
                    const hatResults = await _handleHatSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(hatResults);
                    break;
            }
            setResults(aggregatedResults.slice(0, maxResults));

        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
    }
    return { results, handleSearch };
}