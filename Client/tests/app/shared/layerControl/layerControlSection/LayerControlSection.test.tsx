import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LayerControlSection from '../../../../../src/app/shared/layerControl/layerControlSection/LayerControlSection';

describe('LayerControlSection Component', () => {

    it('should render the title correctly', () => {
        const titleText = 'My Test Section';
        render(<LayerControlSection title={titleText} />);

        const headingElement = screen.getByRole('heading', { level: 4, name: titleText });
        expect(headingElement).toBeDefined();
    });

    it('should render its children when provided', () => {
        const titleText = 'Section With Children';
        const childText = 'This is a child paragraph.';
        render(
            <LayerControlSection title={titleText}>
                <p>{childText}</p>
            </LayerControlSection>
        );

        // Check for title
        expect(screen.getByRole('heading', { level: 4, name: titleText })).toBeDefined();

        // Check for children
        expect(screen.getByText(childText)).toBeDefined();
    });

    it('should have the correct base CSS class', () => {
        const titleText = 'Class Test';
        const childTestId = 'child-element';
        const { getByTestId } = render(
            <LayerControlSection title={titleText}>
                <div data-testid={childTestId}></div>
            </LayerControlSection>
        );

        expect(getByTestId(childTestId).parentElement?.className).toBe('layer-control-section');
    });
});