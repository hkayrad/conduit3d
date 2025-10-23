import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import ActionButton from '../../../../src/app/shared/actionButton/ActionButton';

describe('ActionButton', () => {
    // Clean up the DOM after each test to prevent side effects
    afterEach(cleanup);

    it('should render with the correct content and style', () => {
        const buttonText = 'Submit';
        render(<ActionButton content={buttonText} style="success" onClick={() => { }} />);

        const buttonElement = screen.getByRole('button', { name: buttonText });
        expect(buttonElement).toBeDefined();
        const buttonElementClass = buttonElement.getAttribute('class');
        expect(buttonElementClass).toContain('action-button');
        expect(buttonElementClass).toContain('success');
    });

    it('should call the onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<ActionButton content="Click Me" style="warning" onClick={handleClick} />);

        const buttonElement = screen.getByRole('button', { name: 'Click Me' });
        fireEvent.click(buttonElement);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when the disabled prop is true', () => {
        render(<ActionButton content="Disabled" style="error" onClick={() => { }} disabled={true} />);

        const buttonElement = screen.getByRole('button', { name: 'Disabled' });
        const isDisabled = buttonElement.getAttribute('disabled') !== null;
        expect(isDisabled).toBe(true);
    });

    it('should not call the onClick handler when disabled', () => {
        const handleClick = vi.fn();
        render(<ActionButton content="Do Not Click" style="error" onClick={handleClick} disabled={true} />);

        const buttonElement = screen.getByRole('button', { name: 'Do Not Click' });
        fireEvent.click(buttonElement);

        expect(handleClick).not.toHaveBeenCalled();
    });
});