import "./style/table.css";
import type { TableData } from "../../../lib/types";
import { Check, ChevronLeft, ChevronRight, Filter, Loader, Plus, RotateCcw, SortAsc, SortDesc } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Input from "../input/Input";

type Props = {
    tableName?: string;
    pageNumber: number;
    itemsPerPage: number;
    sortBy: string;
    ascending: boolean;
    query?: string;
    setQuery?: React.Dispatch<React.SetStateAction<string>> | ((value: string) => void);
    setPageNumber: (newPageNumber: number) => void;
    setItemsPerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    setSortBy: (e: string) => void;
    setAscending: (e: boolean) => void;
    onAddClick?: () => void;
    onRefresh?: () => void;
    data: TableData;
    totalDataCount: number;
}

/**
 * Table component for displaying tabular data.
 * @component
 * @param props Props for the Table component.
 * @returns The rendered Table component.
 */
export default function Table(props: Readonly<Props>): React.ReactNode {
    const {
        tableName,
        pageNumber,
        itemsPerPage,
        sortBy,
        ascending,
        query,
        setPageNumber,
        setItemsPerPage,
        setSortBy,
        setAscending,
        setQuery,
        onAddClick,
        onRefresh,
        data,
        totalDataCount
    } = props;
    const [maxPageCount, setMaxPageCount] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
    const [showColumnToggle, setShowColumnToggle] = useState(false);

    const [headersInitialized, setHeadersInitialized] = useState(false);

    const calculateTotalPages = (): number => {
        return Math.ceil(totalDataCount / itemsPerPage);
    }

    const handleGoToPage = (): void => {
        const targetPage = Number.parseInt(gotoPageInput);

        if (Number.isNaN(targetPage) || targetPage < 1 || targetPage > maxPageCount)
            return;

        setPageNumber(targetPage);
        setGotoPageInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter') {
            handleGoToPage();
        }
    };

    const handleSort = (headerId: string): void => {
        // Ignore clicks on non-sortable headers (like action columns)
        if (headerId === 'actions' || headerId === 'index')
            return;

        // Toggle sort order if the same header is clicked
        if (sortBy === headerId) {
            setAscending(!ascending);
            return;
        }

        setSortBy(headerId);
        setAscending(true);
    }

    const handleRefreshClick = async (): Promise<void> => {
        if (!onRefresh)
            return;

        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 250); // Simulate refresh time
    }

    const toggleColumn = (columnId: string): void => {
        const newVisibleColumns = new Set(visibleColumns);
        if (newVisibleColumns.has(columnId)) {
            newVisibleColumns.delete(columnId);
        } else {
            newVisibleColumns.add(columnId);
        }
        setVisibleColumns(newVisibleColumns);
    };

    const showAllColumns = (): void => {
        setVisibleColumns(new Set(data.headers.map(header => header.id)));
    };

    const hideAllColumns = (): void => {
        setVisibleColumns(new Set());
    };

    const filteredHeaders = useMemo(() =>
        data.headers.filter(header =>
            visibleColumns.has(header.id)
        ),
        [data.headers, visibleColumns]
    );

    const getFilteredRowData = (row: any[]): any[] => {
        return row.filter((_, index) => visibleColumns.has(data.headers[index].id));
    };

    // Update max page count when itemsPerPage or totalDataCount changes
    useEffect(() => {
        setMaxPageCount(calculateTotalPages());
    }, [itemsPerPage, totalDataCount])

    // Initialize visible columns when headers are loaded
    useEffect(() => {
        if (!headersInitialized && data.headers.length > 2) {
            // Initialize all columns as visible
            setVisibleColumns(new Set(data.headers.map(header => header.id)));
            setHeadersInitialized(true);
        }
    }, [data.headers]);

    // Enable column loading when the table name changes.
    useEffect(() => {
        setHeadersInitialized(false);
    }, [tableName])

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                setShowColumnToggle(false);
            }
        })

        return () => {
            document.removeEventListener("keydown", () => { });
        }
    }, [])

    return (
        <div className="data-table-wrapper">
            <div className="data-table-header">
                <p>{tableName}</p>
                <div className="data-table-header-actions">
                    {/* Show search input if setQuery and query are defined */}
                    {setQuery && query !== undefined &&
                        <Input
                            state={query}
                            setState={setQuery}
                            placeholder="Search..."
                            id="search"
                            type="text"
                        />
                    }

                    {/* Column toggle dropdown */}
                    <div className="column-toggle-dropdown">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="column-toggle-button"
                        >
                            <Filter />
                            Columns
                        </button>
                        {showColumnToggle && (
                            <div className="column-toggle-menu">
                                <div className="column-toggle-header">
                                    <button
                                        onClick={showAllColumns}
                                        className="toggle-all-button"
                                    >
                                        Show All
                                    </button>
                                    <button
                                        onClick={hideAllColumns}
                                        className="toggle-all-button"
                                    >
                                        Hide All
                                    </button>
                                </div>
                                <div className="column-toggle-list">
                                    {data.headers.map((header) => (
                                        <button
                                            key={header.id}
                                            className="column-toggle-item"
                                            onClick={() => toggleColumn(header.id)}
                                        >
                                            <div className="checkbox">
                                                {visibleColumns.has(header.id) && <Check size={14} />}
                                            </div>
                                            <span>{header.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Show items per page selector if setItemsPerPage is defined */}
                    {setItemsPerPage &&
                        <div className="items-per-page-selector">
                            <p>Items per page:</p>
                            <select value={itemsPerPage} onChange={setItemsPerPage}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>}

                    {/* Show refresh button if onRefresh is defined */}
                    {onRefresh &&
                        <button
                            className={`${isRefreshing ? "loading" : ""}`}
                            onClick={handleRefreshClick}>{
                                isRefreshing ?
                                    <Loader className="rotating" /> :
                                    <RotateCcw />
                            }
                            Refresh
                        </button>}

                    {/* Show add button if onAddClick is defined */}
                    {onAddClick && <button onClick={onAddClick}><Plus />Add</button>}
                </div>
            </div>
            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            {filteredHeaders.map((header, _) => (
                                <th id={`header-${header.id}`} key={`header-${header.id}`}>
                                    <button
                                        onClick={() => handleSort(header.id)}
                                        className="header-content"
                                    >
                                        <p className={sortBy === header.id ? "active" : ""} >{header.label}</p>
                                        <button
                                            onClick={e => e.stopPropagation()}
                                            className="header-actions"
                                        >
                                            {
                                                sortBy === header.id ?
                                                    <button
                                                        disabled={sortBy !== header.id}
                                                        onClick={() => setAscending(!ascending)}
                                                    >
                                                        {ascending ?
                                                            <SortAsc className={
                                                                sortBy === header.id ?
                                                                    "" :
                                                                    "disabled"} /> :
                                                            <SortDesc className={
                                                                sortBy === header.id ?
                                                                    "" :
                                                                    "disabled"
                                                            } />}
                                                    </button> :
                                                    <button
                                                        disabled={sortBy !== header.id}
                                                        onClick={() => setAscending(!ascending)}
                                                    >
                                                        <SortAsc className={
                                                            sortBy === header.id ?
                                                                "" :
                                                                "disabled"} />
                                                    </button>
                                            }
                                        </button>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rowIndex) => (
                            <tr key={Math.random().toString(36).substring(7) + rowIndex}>
                                {getFilteredRowData(row).map((cell, cellIndex) => (
                                    <td key={Math.random().toString(36).substring(7) + cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="data-table-footer">
                {/* Pagination */}
                <div className="pagination">
                    <button
                        onClick={() => setPageNumber(pageNumber - 1)}
                        disabled={pageNumber === 1}
                    >
                        <ChevronLeft />Previous
                    </button>
                    <span>Page {pageNumber} of {maxPageCount}</span>
                    <button
                        onClick={() => setPageNumber(pageNumber + 1)}
                        disabled={pageNumber === maxPageCount}
                    >
                        Next <ChevronRight />
                    </button>
                </div>
                <div className="goto-page">
                    <input
                        id="goto"
                        type="number"
                        placeholder="Go to..."
                        value={gotoPageInput}
                        onChange={(e) => setGotoPageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        min={1}
                        max={maxPageCount}
                    />
                    <button
                        onClick={handleGoToPage}
                        disabled={!gotoPageInput}
                    >
                        Go
                    </button>
                </div>
            </div>
        </div>
    )
}