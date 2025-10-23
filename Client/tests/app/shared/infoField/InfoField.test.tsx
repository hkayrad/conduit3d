import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import InfoField from '../../../../src/app/shared/infoField/InfoField';

describe('InfoField Component', () => {
    afterEach(cleanup);

    it('should return null if value is null, undefined, or an empty string', () => {
        const { container: nullContainer } = render(<InfoField label="Test" value={null!} />);
        expect(nullContainer.firstChild).toBeNull();

        const { container: undefinedContainer } = render(<InfoField label="Test" value={undefined} />);
        expect(undefinedContainer.firstChild).toBeNull();

        const { container: emptyStringContainer } = render(<InfoField label="Test" value="" />);
        expect(emptyStringContainer.firstChild).toBeNull();
    });

    it('should return null if value is 0, as it is falsy', () => {
        const { container } = render(<InfoField label="Test" value={0} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render label and value correctly for a string value', () => {
        const label = "Name";
        const value = "John Doe";
        render(<InfoField label={label} value={value} />);

        const pElement = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && content.startsWith(`${label}:`);
        });
        expect(pElement).toBeDefined();
        expect(pElement.textContent).toContain(value);
    });

    it('should render label and value correctly for a non-zero number value', () => {
        const label = "Age";
        const value = 30;
        render(<InfoField label={label} value={value} />);

        const pElement = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && content.startsWith(`${label}:`);
        });
        expect(pElement).toBeDefined();
        expect(pElement.textContent).toContain(value.toString());
    });

    it('should not have "capitalize" class when capitalize is false or not provided', () => {
        const label = "City";
        const value = "new york";

        // Test without providing capitalize prop (defaults to false)
        const { rerender } = render(<InfoField label={label} value={value} />);
        const spanElement = screen.getByText(value);
        expect(spanElement.className).not.toContain('capitalize');

        // Test explicitly setting capitalize to false
        rerender(<InfoField label={label} value={value} capitalize={false} />);
        const rerenderedSpan = screen.getByText(value);
        expect(rerenderedSpan.className).not.toContain('capitalize');
    });

    it('should have "capitalize" class when capitalize is true', () => {
        const label = "Country";
        const value = "united states";
        render(<InfoField label={label} value={value} capitalize={true} />);

        const spanElement = screen.getByText(value);
        expect(spanElement.className).toContain('capitalize');
    });
});