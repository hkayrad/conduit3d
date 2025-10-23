import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LayerControlFilter from '../../../../../src/app/shared/layerControl/layerControlFilter/LayerControlFilter';
import { C3D_MapLayers } from '../../../../../src/lib/enums';

const mockFunctions = {
    setFilters: vi.fn(),
};

const typeList = ['Residential', 'Commercial', 'Industrial'];
const filterKey = C3D_MapLayers.AgHat as const;

const defaultProps = {
    label: 'Building Types',
    typeList: typeList,
    filters: [],
    filterKey: filterKey,
    setFilters: mockFunctions.setFilters,
};

describe('LayerControlFilter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it('should render the label and a button for each type', () => {
        render(<LayerControlFilter {...defaultProps} />);

        expect(screen.getByRole('heading', { name: 'Building Types' })).toBeDefined();
        expect(screen.getByRole('button', { name: /residential/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /commercial/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /industrial/i })).toBeDefined();
    });

    it('should show all filters as active with empty circle icons when no filters are selected', () => {
        render(<LayerControlFilter {...defaultProps} filters={[]} />);

        const buttons = screen.getAllByRole('button');
        for (const button of buttons) {
            expect(button.classList.contains('active')).toBe(true);
            // Check for the <Circle /> icon (empty circle)
            expect(button.querySelector('svg')?.getAttribute('class')).toContain('lucide-circle');
        }
    });

    it('should show only the selected filter as active with a checked icon', () => {
        render(<LayerControlFilter {...defaultProps} filters={['Commercial']} />);

        const commercialButton = screen.getByRole('button', { name: /commercial/i });
        const residentialButton = screen.getByRole('button', { name: /residential/i });

        expect(commercialButton.classList.contains('active')).toBe(true);
        // Check for the <CircleCheck /> icon
        expect(commercialButton.querySelector('svg')?.getAttribute('class')).toContain('lucide-circle-check');

        expect(residentialButton.classList.contains('active')).toBe(false);
        // Check for the <Circle /> icon
        expect(residentialButton.querySelector('svg')?.getAttribute('class')).toContain('lucide-circle');
    });

    it('should call setFilters to add a filter when an inactive one is clicked', () => {
        render(<LayerControlFilter {...defaultProps} filters={['Residential']} />);

        const commercialButton = screen.getByRole('button', { name: /commercial/i });
        fireEvent.click(commercialButton);

        expect(mockFunctions.setFilters).toHaveBeenCalledWith(
            ['Residential', 'Commercial'],
            filterKey
        );
    });

    it('should call setFilters to remove a filter when an active one is clicked', () => {
        render(<LayerControlFilter {...defaultProps} filters={['Residential', 'Commercial']} />);

        const commercialButton = screen.getByRole('button', { name: /commercial/i });
        fireEvent.click(commercialButton);

        expect(mockFunctions.setFilters).toHaveBeenCalledWith(
            ['Residential'],
            filterKey
        );
    });
});