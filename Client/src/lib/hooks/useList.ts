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
    const handleFetchFeatures = async (featureToFetch: string): Promise<void> => {
        var dataResponse;
        var countResponse;
        switch (featureToFetch) {
            case ListDataType.AdrBina:
                dataResponse = await AdrBinaApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AdrBinaApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.TrafoBina:
                dataResponse = await TrafoBinaApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await TrafoBinaApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.AgDirek:
                dataResponse = await AgDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AgDirekApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.OgMusDirek:
                dataResponse = await OgMusDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await OgMusDirekApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.AydDirek:
                dataResponse = await AydDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AydDirekApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.AgHat:
                dataResponse = await AgHatApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AgHatApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.OgHat:
                dataResponse = await OgHatApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await OgHatApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case ListDataType.Rekortman:
                dataResponse = await RekortmanApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending, query)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await RekortmanApi.fetchCount(query)
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            default:
                break;
        }
    }

    return {
        handleFetchFeatures
    }
}