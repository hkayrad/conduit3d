import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FpsCounter from '../../../../src/app/shared/fpsCounter/FpsCounter';

// Mocking CSS import
vi.mock('./style/fpsCounter.css', () => ({
    default: ''
}));

describe('FpsCounter', () => {
    let rafCallbacks: Set<(time: number) => void>;
    let currentTime: number;

    beforeEach(() => {
        rafCallbacks = new Set();
        currentTime = 1000; // Start time

        vi.useFakeTimers();

        vi.spyOn(globalThis, 'performance', 'get').mockReturnValue({
            ...performance,
            now: () => currentTime,
            memory: {
                usedJSHeapSize: 10 * 1024 * 1024, // 10MB
                totalJSHeapSize: 20 * 1024 * 1024,
                jsHeapSizeLimit: 100 * 1024 * 1024,
            },
        } as any);

        vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            rafCallbacks.add(callback);
            return rafCallbacks.size;
        });

        vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {
            // Simple mock, assumes we can clear all for simplicity in tests
            rafCallbacks.clear();
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const runFrames = (count: number, frameTime: number) => {
        for (let i = 0; i < count; i++) {
            currentTime += frameTime;
            act(() => {
                for (const cb of rafCallbacks) {
                    cb(currentTime);
                }
            });
        }
    };

    it('renders without crashing and displays initial FPS', () => {
        render(<FpsCounter />);
        expect(screen.getByText('0')).toBeDefined();
        expect(screen.getByText('FPS')).toBeDefined();
    });

    it('applies the correct position class based on props', () => {
        const container = render(<FpsCounter position="top-left" />);
        expect(container).toBeDefined();
        const fpsElement = container.getByTestId('fps-counter');
        expect(fpsElement).toBeDefined();
        const fpsElementClasses = fpsElement.classList;
        expect(fpsElementClasses).toContain('fps-counter--top-left');
    });

    it('does not show details by default', () => {
        const container = render(<FpsCounter />);
        expect(container).toBeDefined();
        const fpsElement = container.getByTestId('fps-counter');
        expect(fpsElement).toBeDefined();
        const detailsElement = fpsElement.querySelector('.fps-details');
        expect(detailsElement).toBeNull();
        expect(screen.queryByText('Avg:')).toBeNull();
    });

    it('shows details when showDetails prop is true', () => {
        const container = render(<FpsCounter showDetails />);
        expect(container).toBeDefined();
        const fpsElement = container.getByTestId('fps-counter');
        expect(fpsElement).toBeDefined();
        const detailsElement = fpsElement.querySelector('.fps-details');
        expect(detailsElement).toBeDefined();
        expect(screen.getByText('Avg:')).toBeDefined();
        expect(screen.getByText('Min:')).toBeDefined();
        expect(screen.getByText('Max:')).toBeDefined();
        expect(screen.getByRole('button', { name: /reset stats/i })).toBeDefined();
    });

    it('updates FPS value over time', () => {
        render(<FpsCounter />);
        expect(screen.getByText('0')).toBeDefined();

        runFrames(60, 16.67); // Simulate ~60 FPS

        expect(Number.parseInt(screen.getByText(/\d+/).textContent || '0')).toBeGreaterThan(50);
    });
});