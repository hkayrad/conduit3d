import { AdrBinaApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from "../api";
import { ListDataType } from "../enums";

export function useList(
    itemsPerPage: number,
    pageNumber: number,
    sortBy: string,
    ascending: boolean,
    query: string,
    setFeatures: React.Dispatch<React.SetStateAction<any[]>>,
    setFeatureCount: React.Dispatch<React.SetStateAction<number>>,
) {
    const apiMap = {
        [ListDataType.AdrBina]: AdrBinaApi,
        [ListDataType.TrafoBina]: TrafoBinaApi,
        [ListDataType.AgDirek]: AgDirekApi,
        [ListDataType.OgMusDirek]: OgMusDirekApi,
        [ListDataType.AydDirek]: AydDirekApi,
        [ListDataType.AgHat]: AgHatApi,
        [ListDataType.OgHat]: OgHatApi,
        [ListDataType.Rekortman]: RekortmanApi,
    };

    const handleFetchFeatures = async (featureToFetch: ListDataType): Promise<void> => {
        const api = apiMap[featureToFetch];
        if (!api) return;

        const [dataResponse, countResponse] = await Promise.all([
            api.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query),
            api.fetchCount(query)
        ]);

        if (!dataResponse.isSuccess || !countResponse.isSuccess) {
            setFeatures([]);
            setFeatureCount(0);
            return;
        }

        setFeatures(dataResponse.data);
        setFeatureCount(countResponse.data);
    }

    return {
        handleFetchFeatures
    }
}