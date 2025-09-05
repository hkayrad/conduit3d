import "./style/list.css";
import { useDispatch } from "react-redux";
import Table from "../../shared/table/Table";
import React, { useCallback, useEffect, useState } from "react";
import type { TableData } from "../../../lib/types";
import { useAppSelector } from "../../../lib/hooks";
import { selectListState, setAscending, setItemsPerPage, setPageNumber, setSortBy } from "./listSlice";
import { AdrBinaApi, AgDirekApi, AgHatApi, AydDirekApi, OgHatApi, OgMusDirekApi, RekortmanApi, TrafoBinaApi } from "../../../lib/api";
import { capitalizeFirstLetter, findAverageLonLat } from "../../../lib/utils";
import { MapPin } from "lucide-react";
import ActionButton from "../../shared/actionButton/ActionButton";
import { useNavigate } from "react-router";

export default function List() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { itemsPerPage, pageNumber, sortBy, ascending } = useAppSelector(selectListState)

    const [features, setFeatures] = useState<any[]>([]);
    const [featureCount, setFeatureCount] = useState<number>(0);
    const [featureToFetch, setFeatureToFetch] = useState<string>("AdrBina");
    const [tableData, setTableData] = useState<TableData>({
        headers: [],
        rows: []
    });

    const handleFetchFeatures = async (featureToFetch: string) => {
        var dataResponse;
        var countResponse;
        switch (featureToFetch) {
            case "AdrBina":
                dataResponse = await AdrBinaApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AdrBinaApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "Trafo":
                dataResponse = await TrafoBinaApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await TrafoBinaApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "AgDirek":
                dataResponse = await AgDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AgDirekApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "OgMusDirek":
                dataResponse = await OgMusDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await OgMusDirekApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "AydDirek":
                dataResponse = await AydDirekApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AydDirekApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "AgHat":
                dataResponse = await AgHatApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await AgHatApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "OgHat":
                dataResponse = await OgHatApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await OgHatApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            case "Rekortman":
                dataResponse = await RekortmanApi.fetchAll(itemsPerPage, pageNumber, sortBy, ascending)
                if (dataResponse.isSuccess) {
                    setFeatures(dataResponse.data);
                }
                countResponse = await RekortmanApi.fetchCount()
                if (countResponse.isSuccess) {
                    setFeatureCount(countResponse.data);
                }
                break;
            default:
                break;
        }
    }

    const formatData = useCallback(() => {
        const headers = [
            ...features[0] ? Object.keys(features[0]).map(k => ({
                id: k,
                label: capitalizeFirstLetter(k),
            })).filter(header => header.id !== 'geoJson') : [],
            { id: 'actions', label: 'Actions' }
        ]
        const rows = [
            ...features.map(f => [
                ...Object.entries(f).filter(([key, _]) => key !== 'geoJson').map(([_, value]) => value),
                <div className="action-button-wrapper">
                    <ActionButton
                        content={<MapPin />}
                        style="success"
                        onClick={() => {
                            const coords = findAverageLonLat(JSON.parse(f.geoJson));
                            navigate(`/?lon=${coords[0]}&lat=${coords[1]}&z=20`);
                        }}
                    />
                </div>
            ] as React.ReactNode[])
        ];

        setTableData({ headers, rows });
    }, [features]);

    const handleChangeItemsPerPage = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        dispatch(setItemsPerPage(newItemsPerPage));
    }, []);

    const handleSetPageNumber = useCallback((newPageNumber: number) => {
        dispatch(setPageNumber(newPageNumber));
    }, []);

    const handleSetSortBy = useCallback((newSortBy: string) => {
        dispatch(setSortBy(newSortBy));
    }, []);

    const handleSetAscending = useCallback((newSortOrder: boolean) => {
        dispatch(setAscending(newSortOrder));
    }, []);

    const handleRefreshData = useCallback(() => {
        handleFetchFeatures(featureToFetch);
    }, [handleFetchFeatures, featureToFetch]);

    useEffect(() => {
        handleRefreshData();
    }, [featureToFetch, itemsPerPage, pageNumber, sortBy, ascending]);

    useEffect(() => {
        formatData();
    }, [features])

    useEffect(() => {
        dispatch(setPageNumber(1));
    }, [featureToFetch])

    return <div id="list-page">
        <div className="feature-type-selector">
            <h2>Feature Type</h2>
            <div className="feature-type-sections">
                {[{
                    sectionLabel: "Binalar",
                    types: ["AdrBina", "Trafo"]
                }, {
                    sectionLabel: "Direkler",
                    types: ["AgDirek", "OgMusDirek", "AydDirek"]
                }, {
                    sectionLabel: "Hatlar",
                    types: ["AgHat", "OgHat", "Rekortman"]
                }].map((section, index) => (
                    <div key={index} className="feature-type-section">
                        <h3>{section.sectionLabel}</h3>
                        {section.types.map((type, typeIndex) => (
                            <button
                                key={index}
                                className={featureToFetch === type ? "selected" : ""}
                                onClick={() => setFeatureToFetch(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        <div className="divider" />
        <Table
            tableName="Features"
            pageNumber={pageNumber}
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            ascending={ascending}
            setPageNumber={handleSetPageNumber}
            setSortBy={handleSetSortBy}
            setAscending={handleSetAscending}
            setItemsPerPage={handleChangeItemsPerPage}
            onRefresh={handleRefreshData}
            data={tableData}
            totalDataCount={featureCount} />
    </div>
}