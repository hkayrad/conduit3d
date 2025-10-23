import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router'; // Use BrowserRouter to provide routing context

import Header from '../../../../src/app/shared/header/Header';

vi.mock('../../../../src/app/shared/logo/Logo', () => ({
    default: () => <div data-testid="mock-logo">Mock Logo</div>,
}));

vi.mock('../../../../src/app/shared/links/Links', () => ({
    default: () => <nav data-testid="mock-links">Mock Links</nav>,
}));

// Mock the child components to isolate Header's testing
vi.mock('../../../../src/app/shared/header/components/Logo', () => ({
    default: () => <div data-testid="mock-logo">Mock Logo</div>,
}));

vi.mock('../../../../src/app/shared/header/components/Links', () => ({
    default: () => <nav data-testid="mock-links">Mock Links</nav>,
}));

// Mock react-router-dom's NavLink to ensure it renders correctly as an anchor tag
// and to avoid needing a full router setup for simple link checks.
// However, using BrowserRouter is often simpler for basic NavLink tests.

describe('Header', () => {
    afterEach(cleanup);

    it('should render the Logo and Links components', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        expect(screen.getByTestId('mock-logo')).toBeDefined();
        expect(screen.getByTestId('mock-links')).toBeDefined();
    });

    it('should render a NavLink to the home page with the Logo inside', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        const navLink = screen.getByRole('link', { name: 'Mock Logo' }); // NavLink renders as an <a> tag
        expect(navLink).toBeDefined();
        const navLinkHref = navLink.getAttribute('href');
        expect(navLinkHref).toBe('/');
        const navLinkClass = navLink.getAttribute('class');
        expect(navLinkClass).toContain('shadow');
    });
});