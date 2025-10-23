import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Modal from '../../../../src/app/shared/modal/Modal';

describe('Modal Component', () => {
    it('should render its children inside the modal container', () => {
        const headingText = 'Modal Title';
        const paragraphText = 'This is the content of the modal.';

        render(
            <Modal>
                <h1>{headingText}</h1>
                <p>{paragraphText}</p>
            </Modal>
        );

        // Assert that the children are rendered correctly
        expect(screen.getByRole('heading', { name: headingText })).toBeDefined();
        expect(screen.getByText(paragraphText)).toBeDefined();
    });

    it('should have the correct CSS classes for the overlay and modal structure', () => {
        const childTestId = 'modal-child-content';
        render(
            <Modal>
                <div data-testid={childTestId}>Child Content</div>
            </Modal>
        );

        const childElement = screen.getByTestId(childTestId);

        // The direct parent should be the .modal div
        expect(childElement.parentElement?.className).toBe('modal');

        // The grandparent should be the .modal-overlay div
        expect(childElement.parentElement?.parentElement?.className).toBe('modal-overlay');
    });
});