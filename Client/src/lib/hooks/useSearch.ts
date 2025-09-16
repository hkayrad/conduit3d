import { useState } from "react";
import { findAverageLonLat, InputSanitizer, wkbToGeoJSON } from "../utils";
import { AdrBinaApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from "../api";
import { FeatureType } from "../enums";
import type { Direk } from "../types";
import { Logger } from "../utils/logger";

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
        AG_DIREK = "agdirek",
        AYD_DIREK = "ayddirek",
        OG_MUS_DIREK = "ogmusdirek",
        HAT = "hat",
        AG_HAT = "aghat",
        OG_HAT = "oghat",
        REKORTMAN = "rekortman"
    }

    const _wrapInFeature = (geometry: GeoJSON.Geometry): GeoJSON.Feature => {
        return {
            type: "Feature",
            geometry,
            properties: {}
        };
    }

    // Feature Converters
    const _convertToDirekFeature = (direkType: string, direk: Direk) => {
        const geometry: GeoJSON.Geometry = wkbToGeoJSON(direk.wkb);
        return {
            id: `direk-${direkType}-${direk.id}`,
            title: `${direk.cinsi} ${direk.tipi} (${direk.boyOzellik})`,
            subtitle: direk.direkNo,
            type: FeatureType.POLE,
            position: findAverageLonLat(geometry, 2),
            feature: _wrapInFeature(geometry)
        }
    }

    // Search handlers
    const _handleAdrBinaSearch = async (query: string) => {
        const response = await AdrBinaApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("Bina API error:", response.message);
            return [];
        }

        const results = response.data.map(bina => {
            const geometry: GeoJSON.Geometry = wkbToGeoJSON(bina.wkb);

            return {
                id: `bina-${bina.id}`,
                title: bina.adi || "İsimsiz Bina",
                subtitle: bina.siteAdi || "Sitesiz Bina",
                type: FeatureType.BUILDING,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return results;
    }

    const _handleTrafoSearch = async (query: string) => {
        const response = await TrafoBinaApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("Trafo API error:", response.message);
            return [];
        }

        const results = response.data.map(trafo => {
            const geometry: GeoJSON.Geometry = wkbToGeoJSON(trafo.wkb);
            return {
                id: `trafo-${trafo.id}`,
                title: trafo.adi || "İsimsiz Trafo",
                subtitle: trafo.kodu || "Kodsuz Trafo",
                type: FeatureType.TRAFO,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return results;
    }

    const _handleAgDirekSearch = async (query: string) => {
        const response = await AgDirekApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("AG Direk API error:", response.message);
            return [];
        }

        const results = response.data.map(direk => _convertToDirekFeature("ag", direk));

        return results;
    }

    const _handleOgMusDirekSearch = async (query: string) => {
        const response = await OgMusDirekApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("OG Mus Direk API error:", response.message);
            return [];
        }

        const results = response.data.map(direk => _convertToDirekFeature("og", direk));

        return results;
    }

    const _handleAydDirekSearch = async (query: string) => {
        const response = await AydDirekApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("AYD Direk API error:", response.message);
            return [];
        }

        const results = response.data.map(direk => _convertToDirekFeature("ayd", direk));

        return results;
    }

    const _handleDirekSearch = async (query: string) => {
        const [agResult, aydResult, ogResult] = await Promise.all([
            _handleAgDirekSearch(query),
            _handleAydDirekSearch(query),
            _handleOgMusDirekSearch(query)
        ]);

        const results: any[] = [];

        if (agResult.length > 0)
            results.push(...agResult);

        if (ogResult.length > 0)
            results.push(...ogResult);

        if (aydResult.length > 0)
            results.push(...aydResult);

        return results;
    }

    const _handleAgHatSearch = async (query: string) => {
        const response = await AgHatApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("AG Hat API error:", response.message);
            return [];
        }

        const results = response.data.map(hat => {
            const geometry: GeoJSON.Geometry = wkbToGeoJSON(hat.wkb);
            return {
                id: `hat-ag-${hat.id}`,
                title: `${hat.tipi} ${hat.cinsi}`,
                subtitle: hat.kesit,
                type: FeatureType.LINE,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return results;
    }

    const _handleOgHatSearch = async (query: string) => {
        const response = await OgHatApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("OG Hat API error:", response.message);
            return [];
        }

        const results = response.data.map(hat => {
            const geometry: GeoJSON.Geometry = wkbToGeoJSON(hat.wkb);
            return {
                id: `hat-og-${hat.id}`,
                title: `${hat.tipi} ${hat.cinsi}`,
                subtitle: hat.kesit,
                type: FeatureType.LINE,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return results;
    }

    const _handleRekortmanSearch = async (query: string) => {
        const response = await RekortmanApi.fetchAll(maxResults, 1, 'id', true, query);

        if (!response.isSuccess) {
            Logger.error("Rekortman API error:", response.message);
            return [];
        }

        const results = response.data.map(hat => {
            const geometry: GeoJSON.Geometry = wkbToGeoJSON(hat.wkb);
            return {
                id: `hat-rekortman-${hat.id}`,
                title: `Rekortman: ${hat.tipi}`,
                subtitle: hat.kesit,
                type: FeatureType.REKORTMAN,
                position: findAverageLonLat(geometry, 2),
                feature: _wrapInFeature(geometry)
            }
        });

        return results;
    }

    const _handleHatSearch = async (hatQuery: string) => {
        const [agResults, ogResults, rekortmanResults] = await Promise.all([
            _handleAgHatSearch(hatQuery),
            _handleOgHatSearch(hatQuery),
            _handleRekortmanSearch(hatQuery)
        ]);

        const results: any[] = [];

        if (agResults.length > 0)
            results.push(...agResults);

        if (ogResults.length > 0)
            results.push(...ogResults);

        if (rekortmanResults.length > 0)
            results.push(...rekortmanResults);

        return results;
    }

    const handleSearch = async () => {
        
        if (query.trim() === "") {
            setResults([]);
            return;
        }
        
        const sanitizedQuery = InputSanitizer.sanitizeSearchQuery(query).toLowerCase();

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

                case QueryKeywords.AG_DIREK:
                    const agDirekResults = await _handleAgDirekSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(agDirekResults);
                    break;

                case QueryKeywords.OG_MUS_DIREK:
                    const ogMusDirekResults = await _handleOgMusDirekSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(ogMusDirekResults);
                    break;

                case QueryKeywords.AYD_DIREK:
                    const aydDirekResults = await _handleAydDirekSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(aydDirekResults);
                    break;

                case QueryKeywords.DIREK:
                    const direkResults = await _handleDirekSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(direkResults);
                    break;

                case QueryKeywords.AG_HAT:
                    const agHatResults = await _handleAgHatSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(agHatResults);
                    break;

                case QueryKeywords.OG_HAT:
                    const ogHatResults = await _handleOgHatSearch(queryPart);
                    aggregatedResults = aggregatedResults.concat(ogHatResults);
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
            Logger.error("Search error:", error);
            setResults([]);
        }
    }
    return { results, handleSearch };
}