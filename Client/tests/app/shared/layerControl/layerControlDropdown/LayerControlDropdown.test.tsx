import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LayerControlDropdown from '../../../../../src/app/shared/layerControl/layerControlDropdown/LayerControlDropdown';
import { Building } from 'lucide-react';

const mockFunctions = {
    toggleLayer: vi.fn(),
};

const defaultProps = {
    icon: <Building data-testid="layer-icon" />,
    name: 'Building Layer',
    isLayerVisible: true,
    toggleLayer: mockFunctions.toggleLayer,
};

describe('LayerControlDropdown Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it('should render the name, icon, and visibility toggle', () => {
        render(<LayerControlDropdown {...defaultProps} />);

        expect(screen.getByText('Building Layer')).toBeDefined();
        expect(screen.getByTestId('layer-icon')).toBeDefined();
        expect(screen.getByTitle('Hide Layer')).toBeDefined();
    });

    it('should show the Eye icon when the layer is visible', () => {
        render(<LayerControlDropdown {...defaultProps} isLayerVisible={true} />);
        const button = screen .getByTitle('Hide Layer');
        // The <Eye /> component will be rendered, let's check its presence indirectly via the title
        expect(button).toBeDefined();
        expect(screen.queryByTitle('Show Layer')).toBeNull();
    });

    it('should show the EyeClosed icon when the layer is hidden', () => {
        render(<LayerControlDropdown {...defaultProps} isLayerVisible={false} />);
        const button = screen.getByTitle('Show Layer');
        // The <EyeClosed /> component will be rendered
        expect(button).toBeDefined();
        expect(screen.queryByTitle('Hide Layer')).toBeNull();
    });

    it('should call toggleLayer when the visibility button is clicked', () => {
        render(<LayerControlDropdown {...defaultProps} />);
        const visibilityButton = screen.getByTitle('Hide Layer');

        fireEvent.click(visibilityButton);

        expect(mockFunctions.toggleLayer).toHaveBeenCalledTimes(1);
    });

    describe('without children', () => {
        it('should not render a dropdown chevron', () => {
            render(<LayerControlDropdown {...defaultProps} />);
            // The chevron is a <ChevronDown /> component, which we can check for by its class or absence
            expect(screen.queryByRole('img', { hidden: true })).toBeNull();
        });

        it('should call toggleLayer when the main body is clicked', () => {
            render(<LayerControlDropdown {...defaultProps} />);
            const mainButton = screen.getByRole('button', { name: /building layer/i });

            fireEvent.click(mainButton);

            expect(mockFunctions.toggleLayer).toHaveBeenCalledTimes(1);
        });
    });

    describe('with children', () => {
        const childText = 'This is the dropdown content';
        const propsWithChildren = {
            ...defaultProps,
            children: <div>{childText}</div>,
        };

        it('should render a dropdown chevron', () => {
            render(<LayerControlDropdown {...propsWithChildren} />);
            // The chevron is a <ChevronDown /> component, which is an SVG
            const svgs = document.querySelectorAll('svg');
            // We expect the icon and the chevron
            expect(svgs.length).toBeGreaterThan(1);
        });

        it('should not call toggleLayer when the main body is clicked', () => {
            render(<LayerControlDropdown {...propsWithChildren} />);
            const mainButton = screen.getByRole('button', { name: /building layer/i });

            fireEvent.click(mainButton);

            expect(mockFunctions.toggleLayer).not.toHaveBeenCalled();
        });
    });
});