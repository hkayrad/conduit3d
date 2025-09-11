import "./style/list.css";
import Table from "../../shared/table/Table";
import React, { useEffect, useMemo, useState } from "react";
import type { TableData } from "../../../lib/types";
import { useAppDispatch, useAppSelector, useList } from "../../../lib/hooks";
import { selectListState, setAscending, setFeatureType, setPageNumber, setQuery, setSortBy } from "./listSlice";
import { capitalizeFirstLetter } from "../../../lib/utils";
import { Building, MapPin, PlugZap, UtilityPole } from "lucide-react";
import ActionButton from "../../shared/actionButton/ActionButton";
import { useNavigate, useOutletContext } from "react-router";
import { C3D_MapViewType, FeatureType, ListDataType } from "../../../lib/enums";
import { setSelectedViewType } from "../map/mapSlice";

/**
 * List component for displaying a list of features with pagination, sorting, and filtering capabilities.
 * @component
 * @returns The List component renders a list of features with pagination, sorting, and filtering capabilities.
 */
export default function List(): React.ReactNode {
    const { flyTo } = useOutletContext<{ flyTo: (feature: GeoJSON.Feature) => void }>();

    // Redux state
    const { itemsPerPage, pageNumber, sortBy, ascending, featureType, query } = useAppSelector(selectListState)

    // Local state
    const [features, setFeatures] = useState<any[]>([]);
    const [featureCount, setFeatureCount] = useState<number>(0);
    const [tableData, setTableData] = useState<TableData>({
        headers: [],
        rows: []
    });

    // Redux hooks
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // List hook
    const {
        handleChangeItemsPerPage,
        handleSetPageNumber,
        handleSetSortBy,
        handleSetAscending,
        handleSetQuery,
        handleRefreshData
    } = useList(
        featureType,
        itemsPerPage,
        pageNumber,
        sortBy,
        ascending,
        query,
        setFeatures,
        setFeatureCount
    )

    // Memoized feature type selector sections
    const featureTypeSelectorSections = useMemo(() => [{
        sectionLabel: "Binalar",
        sectionIcon: <Building />,
        types: [ListDataType.AdrBina, ListDataType.TrafoBina]
    }, {
        sectionLabel: "Direkler",
        sectionIcon: <UtilityPole />,
        types: [ListDataType.AgDirek, ListDataType.OgMusDirek, ListDataType.AydDirek]
    }, {
        sectionLabel: "Hatlar",
        sectionIcon: <PlugZap />,
        types: [ListDataType.AgHat, ListDataType.OgHat, ListDataType.Rekortman]
    }], []);

    const mappedFeatureTypes = useMemo(() => ({
        [ListDataType.AdrBina]: FeatureType.BUILDING,
        [ListDataType.TrafoBina]: FeatureType.TRAFO,
        [ListDataType.AgDirek]: FeatureType.POLE,
        [ListDataType.OgMusDirek]: FeatureType.POLE,
        [ListDataType.AydDirek]: FeatureType.POLE,
        [ListDataType.AgHat]: FeatureType.LINE,
        [ListDataType.OgHat]: FeatureType.LINE,
        [ListDataType.Rekortman]: FeatureType.REKORTMAN,
    }), [])

    // Memoized table headers
    const headers = useMemo(() => [
        { id: 'index', label: '#' },
        ...features[0] ? Object.keys(features[0]).map(k => ({
            id: k,
            label: capitalizeFirstLetter(k),
        })).filter(header => header.id !== 'geoJson') : [],
        { id: 'actions', label: 'Actions' }
    ], [features]);

    const handleGoToFeature = (f: any) => {
        const feature = {
            type: "Feature",
            geometry: JSON.parse(f.geoJson),
            properties: {
                dataType: mappedFeatureTypes[featureType],
            }
        } as GeoJSON.Feature;

        navigate("/", { replace: false });
        dispatch(setSelectedViewType(C3D_MapViewType.Cartesian));
        flyTo(feature);

        // const coords = findAverageLonLat(JSON.parse(feature.geoJson));
        // dispatch(setViewState({
        //     viewId: C3D_MapViewType.Cartesian,
        //     viewState: {
        //         longitude: coords[0],
        //         latitude: coords[1],
        //         zoom: 20,
        //     }
        // }))
        // navigate("/", { replace: false });
    }

    // Memoized table rows
    const rows = useMemo(() => [
        ...features.map((f, index) => [
            index + 1,
            ...Object.entries(f).filter(([key, _]) => key !== 'geoJson').map(([_, value]) => value === "" ? "-" : value),
            <div className="action-button-wrapper">
                <ActionButton
                    content={<MapPin />}
                    style="success"
                    onClick={() => handleGoToFeature(f)}
                />
            </div>
        ] as React.ReactNode[])
    ], [features]);

    // Effects
    useEffect(() => {
        handleRefreshData();
    }, [featureType, itemsPerPage, pageNumber, sortBy, ascending]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            dispatch(setPageNumber(1));
            handleRefreshData();
        }, 250)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    useEffect(() => {
        /* Reset pagination and sorting on feature type change */
        dispatch(setPageNumber(1));
        dispatch(setSortBy("id"));
        dispatch(setAscending(true));
        dispatch(setQuery(""));
    }, [featureType]);

    useEffect(() => {
        setTableData({ headers, rows });
    }, [headers, rows])

    return <div id="list-page">
        <div className="feature-type-selector">
            <h2>Feature Type</h2>
            <div className="feature-type-sections">
                {featureTypeSelectorSections.map((section, _) => (
                    <div key={`div-${section.sectionLabel}`} className="feature-type-section">
                        <h3>{section.sectionLabel}</h3>
                        {section.types.map((type, _) => (
                            <button
                                key={`btn-${type}`}
                                className={featureType === type ? "selected" : ""}
                                onClick={() => dispatch(setFeatureType(type))}
                            >
                                {section.sectionIcon}
                                {capitalizeFirstLetter(type)}
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
            query={query}
            setQuery={handleSetQuery}
            setPageNumber={handleSetPageNumber}
            setSortBy={handleSetSortBy}
            setAscending={handleSetAscending}
            setItemsPerPage={handleChangeItemsPerPage}
            onRefresh={handleRefreshData}
            data={tableData}
            totalDataCount={featureCount} />
    </div>
}