import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import Logo from '../../../../src/app/shared/logo/Logo';

describe('Logo', () => {
    it('should render with default props', () => {
        render(<Logo />);
        const logo = screen.getByTestId('logo');
        expect(logo).toBeDefined();
        const logoSrc = logo.getAttribute('src');
        expect(logoSrc).toBe('logo/Color=Dark, Type=Long, Size=Small.svg');
        const logoAlt = logo.getAttribute('alt');
        expect(logoAlt).toBe('Dark Long Small logo');
    });

    const testCases = [
        {
            props: { color: 'White', type: 'Short', size: 'Big' },
            expected: { src: 'logo/Color=White, Type=Short, Size=Big.svg', alt: 'White Short Big logo' },
        },
        {
            props: { color: 'White' },
            expected: { src: 'logo/Color=White, Type=Long, Size=Small.svg', alt: 'White Long Small logo' },
        },
        {
            props: { type: 'Short' },
            expected: { src: 'logo/Color=Dark, Type=Short, Size=Small.svg', alt: 'Dark Short Small logo' },
        },
        {
            props: { size: 'Big' },
            expected: { src: 'logo/Color=Dark, Type=Long, Size=Big.svg', alt: 'Dark Long Big logo' },
        },
    ];

    it.each(testCases)('should render correctly with props', ({ props, expected }: any) => {
        render(<Logo {...props} />);
        const logo = screen.getByTestId('logo');
        expect(logo).toBeDefined();
        const logoSrc = logo.getAttribute('src');
        expect(logoSrc).toBe(expected.src);
        const logoAlt = logo.getAttribute('alt');
        expect(logoAlt).toBe(expected.alt);
    });
    afterEach(cleanup);

});