import "./style/table.css";
import type { TableData } from "../../../lib/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    tableName: string;
    pageNumber: number;
    itemsPerPage: number;
    setPageNumber: (newPageNumber: number) => void;
    setItemsPerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onAddClick?: () => void;
    data: TableData,
    totalDataCount: number
}

export default function Table(props: Props) {
    const {
        tableName,
        pageNumber,
        itemsPerPage,
        setPageNumber,
        setItemsPerPage,
        onAddClick,
        data,
        totalDataCount
    } = props;
    const [maxPageCount, setMaxPageCount] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState('');

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

    useEffect(() => {
        setMaxPageCount(calculateTotalPages());
    }, [itemsPerPage, totalDataCount])

    return (
        <div className="data-table-wrapper">
            <div className="data-table-header">
                <p>{tableName}</p>
                <div className="data-table-header-actions">
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
                                <th id={`header-${header.toLowerCase()}`} key={index}>{header}</th>
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