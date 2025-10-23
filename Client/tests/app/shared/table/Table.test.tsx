import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Table from '../../../../src/app/shared/table/Table';
import type { TableData } from '../../../../src/lib/types';

const mockData: TableData = {
    headers: [
        { id: 'id', label: 'ID' },
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
    ],
    rows: [
        [1, 'Alice', 'alice@example.com'],
        [2, 'Bob', 'bob@example.com'],
    ],
};

const mockFunctions = {
    setPageNumber: vi.fn(),
    setItemsPerPage: vi.fn(),
    setSortBy: vi.fn(),
    setAscending: vi.fn(),
    setQuery: vi.fn(),
    onAddClick: vi.fn(),
    onRefresh: vi.fn(),
};

const defaultProps = {
    tableName: 'Users',
    pageNumber: 1,
    itemsPerPage: 10,
    sortBy: 'id',
    ascending: true,
    query: '',
    data: mockData,
    totalDataCount: 20,
    ...mockFunctions,
};

describe('Table Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it('should render the table with headers and rows', () => {
        render(<Table {...defaultProps} />);

        // Check for table name
        expect(screen.getByText('Users')).toBeDefined();

        // Check for headers
        expect(screen.getByText('ID')).toBeDefined();
        expect(screen.getByText('Name')).toBeDefined();
        expect(screen.getByText('Email')).toBeDefined();

        // Check for row data
        expect(screen.getByText('Alice')).toBeDefined();
        expect(screen.getByText('bob@example.com')).toBeDefined();
    });

    it('should render optional action buttons when handlers are provided', () => {
        render(<Table {...defaultProps} />);

        expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /refresh/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add/i })).toBeDefined();
    });

    it('should not render optional action buttons if handlers are not provided', () => {
        const propsWithoutOptionals = {
            ...defaultProps,
            setQuery: undefined,
            onRefresh: undefined,
            onAddClick: undefined,
        };
        render(<Table {...propsWithoutOptionals} />);

        expect(screen.queryByPlaceholderText(/search/i)).toBeNull();
        expect(screen.queryByRole('button', { name: /refresh/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /add/i })).toBeNull();
    });

    it('should handle pagination correctly', () => {
        render(<Table {...defaultProps} pageNumber={1} totalDataCount={30} itemsPerPage={10} />);

        const prevButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });

        // On page 1, 'Previous' should be disabled
        const isPrevButtonDisabled = prevButton.getAttribute('disabled') !== null;
        expect(isPrevButtonDisabled).toBe(true);
        // 'Next' should not be disabled
        const isNextButtonDisabled = nextButton.getAttribute('disabled') !== null;
        expect(isNextButtonDisabled).toBe(false);

        // Click 'Next'
        fireEvent.click(nextButton);
        expect(mockFunctions.setPageNumber).toHaveBeenCalledWith(2);
    });

    it('should disable the "Next" button on the last page', () => {
        render(<Table {...defaultProps} pageNumber={3} totalDataCount={30} itemsPerPage={10} />);

        const prevButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });

        const isPrevButtonDisabled = prevButton.getAttribute('disabled') !== null;
        expect(isPrevButtonDisabled).toBe(false);

        const isNextButtonDisabled = nextButton.getAttribute('disabled') !== null;
        expect(isNextButtonDisabled).toBe(true);

        // Click 'Previous'
        fireEvent.click(prevButton);
        expect(mockFunctions.setPageNumber).toHaveBeenCalledWith(2);
    });

    it('should handle sorting when a column header is clicked', () => {
        render(<Table {...defaultProps} sortBy="id" ascending={true} />);

        const nameHeader = screen.getByText('Name');
        fireEvent.click(nameHeader);

        // Clicking a new column should sort by it in ascending order
        expect(mockFunctions.setSortBy).toHaveBeenCalledWith('name');
        expect(mockFunctions.setAscending).toHaveBeenCalledWith(true);
    });

    it('should toggle sort direction when the same column header is clicked', () => {
        render(<Table {...defaultProps} sortBy="name" ascending={true} />);

        const nameHeader = screen.getByText('Name');
        fireEvent.click(nameHeader);

        // Clicking the same column should toggle ascending
        expect(mockFunctions.setAscending).toHaveBeenCalledWith(false);
    });

    it('should call onRefresh when the refresh button is clicked', () => {
        render(<Table {...defaultProps} />);
        const refreshButton = screen.getByRole('button', { name: /refresh/i });

        fireEvent.click(refreshButton);
        expect(mockFunctions.onRefresh).toHaveBeenCalled();
    });

    it('should call onAddClick when the add button is clicked', () => {
        render(<Table {...defaultProps} />);
        const addButton = screen.getByRole('button', { name: /add/i });

        fireEvent.click(addButton);
        expect(mockFunctions.onAddClick).toHaveBeenCalled();
    });

    it('should handle column visibility toggle', () => {
        render(<Table {...defaultProps} />);

        // Initially, all columns are visible
        expect(screen.getByText('ID')).toBeDefined();
        expect(screen.getByText('Name')).toBeDefined();
        expect(screen.getByText('Email')).toBeDefined();

        // Open the column toggle menu
        const columnsButton = screen.getByRole('button', { name: /columns/i });
        fireEvent.click(columnsButton);

        // Hide the 'Name' column
        const nameToggleButton = screen.getAllByRole('button', { name: 'Name' });
        console.log(nameToggleButton.length);
        fireEvent.click(nameToggleButton[0]);

        // The 'Name' header and its data should now be gone
        expect(screen.queryAllByText('Name').length).toBe(1);
        expect(screen.queryByText('Alice')).toBeNull(); // Assumes 'Alice' is unique to the 'Name' column in this row

        // Other columns should still be visible
        expect(screen.getAllByText('ID').length).toBe(2); // Header and header toggle button
        expect(screen.getAllByText('Email').length).toBe(2);
    });
});