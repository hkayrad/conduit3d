import "./style/table.css";
import type { TableData } from "../../../lib/types";
import { ChevronLeft, ChevronRight, Loader, Plus, RotateCcw, SortAsc, SortDesc } from "lucide-react";
import { useEffect, useState } from "react";
import Input from "../input/Input";

type Props = {
    tableName?: string;
    pageNumber: number;
    itemsPerPage: number;
    sortBy: string;
    ascending: boolean;
    query?: string;
    setQuery?: React.Dispatch<React.SetStateAction<string>>;
    setPageNumber: (newPageNumber: number) => void;
    setItemsPerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    setSortBy: (e: string) => void;
    setAscending: (e: boolean) => void;
    onAddClick?: () => void;
    onRefresh?: () => void;
    data: TableData;
    totalDataCount: number;
}

export default function Table(props: Props) {
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

    const calculateTotalPages = () => {
        return Math.ceil(totalDataCount / itemsPerPage);
    }

    const handleGoToPage = () => {
        const targetPage = parseInt(gotoPageInput);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= maxPageCount) {
            setPageNumber(targetPage);
            setGotoPageInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGoToPage();
        }
    };

    const handleSort = (headerId: string) => {
        if (headerId === 'actions')
            return;

        if (sortBy === headerId) {
            // If already sorting by this header, toggle to default sort
            setAscending(!ascending);
            return;
        }

        setSortBy(headerId);
        setAscending(true);

    }

    const handleRefreshClick = async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            onRefresh();
            setTimeout(() => setIsRefreshing(false), 250); // Simulate refresh time
        }
    }

    useEffect(() => {
        setMaxPageCount(calculateTotalPages());
    }, [itemsPerPage, totalDataCount])

    return (
        <div className="data-table-wrapper">
            <div className="data-table-header">
                <p>{tableName}</p>
                <div className="data-table-header-actions">
                    {setQuery && query !== undefined &&
                        <Input
                            state={query}
                            setState={setQuery}
                            placeholder="Search..."
                            id="search"
                            type="text"
                        />
                    }
                    {setItemsPerPage &&
                        <div className="items-per-page-selector">
                            <p>Items per page:</p>
                            <select value={itemsPerPage} onChange={setItemsPerPage}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>}
                    {onRefresh && <button className={`${isRefreshing ? "loading" : ""}`} onClick={handleRefreshClick}>{
                        isRefreshing ? <Loader className="rotating" /> : <RotateCcw />
                    }Refresh</button>}
                    {onAddClick && <button onClick={onAddClick}><Plus />Add</button>}
                </div>
                {/* Table name, page size selector, data filter, add button */}
            </div>
            <div className="data-table">
                {/* Table */}
                <table>
                    <thead>
                        <tr>
                            {data.headers.map((header, index) => (
                                <th id={`header-${header.id}`} key={index}>
                                    <div onClick={() => handleSort(header.id)} className="header-content">
                                        <p className={sortBy === header.id ? "active" : ""} >{header.label}</p>
                                        <div onClick={e => e.stopPropagation()} className="header-actions">
                                            <button disabled={sortBy !== header.id} onClick={() => setAscending(!ascending)}>
                                                {sortBy === header.id ? (ascending ? <SortDesc /> : <SortAsc />) : ""}
                                            </button>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="data-table-footer">
                {/* Pagination */}
                <div className="pagination">
                    <button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber === 1}>
                        <ChevronLeft />Previous
                    </button>
                    <span>Page {pageNumber} of {maxPageCount}</span>
                    <button onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber === maxPageCount}>
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
                    <button onClick={handleGoToPage} disabled={!gotoPageInput}>
                        Go
                    </button>
                </div>
            </div>
        </div>
    )
}