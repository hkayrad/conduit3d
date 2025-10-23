import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SettingToggleButton from '../../../../../src/app/shared/layerControl/settingToggleButton/SettingToggleButton';

const mockFunctions = {
    toggle: vi.fn(),
};

const defaultProps = {
    active: false,
    toggle: mockFunctions.toggle,
    hideLabel: '2D',
    showLabel: '3D',
    hideTitle: 'Switch to 2D View',
    showTitle: 'Switch to 3D View',
};

describe('SettingToggleButton Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it('should render the labels and titles correctly', () => {
        render(<SettingToggleButton {...defaultProps} />);

        expect(screen.getByText('2D')).toBeDefined();
        expect(screen.getByText('3D')).toBeDefined();
        expect(screen.getByTitle('Switch to 2D View')).toBeDefined();
        expect(screen.getByTitle('Switch to 3D View')).toBeDefined();
    });

    it('should call the toggle function with false when the hide button is clicked', () => {
        render(<SettingToggleButton {...defaultProps} />);
        const hideButton = screen.getByRole('button', { name: '2D' });

        fireEvent.click(hideButton);

        expect(mockFunctions.toggle).toHaveBeenCalledWith(false);
        expect(mockFunctions.toggle).toHaveBeenCalledTimes(1);
    });

    it('should call the toggle function with true when the show button is clicked', () => {
        render(<SettingToggleButton {...defaultProps} />);
        const showButton = screen.getByRole('button', { name: '3D' });

        fireEvent.click(showButton);

        expect(mockFunctions.toggle).toHaveBeenCalledWith(true);
        expect(mockFunctions.toggle).toHaveBeenCalledTimes(1);
    });

    it('should not have the "active" class on the slider when not active', () => {
        const { container } = render(<SettingToggleButton {...defaultProps} active={false} />);
        const slider = container.querySelector('.toggle-slider');

        expect(slider?.classList.contains('active')).toBe(false);
    });

    it('should have the "active" class on the slider when active', () => {
        const { container } = render(<SettingToggleButton {...defaultProps} active={true} />);
        const slider = container.querySelector('.toggle-slider');

        expect(slider?.classList.contains('active')).toBe(true);
    });
});