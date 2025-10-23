import React, { useState } from 'react';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import Input from '../../../../src/app/shared/input/Input';

// A helper component to manage state for the controlled Input component in tests
const StatefulInputWrapper = (props: Omit<React.ComponentProps<typeof Input>, 'state' | 'setState'> & { initialValue?: string }) => {
    const { initialValue = '', ...rest } = props;
    const [value, setValue] = useState(initialValue);

    return <Input {...rest} state={value} setState={setValue} />;
};


describe('Input Component', () => {
    afterEach(cleanup);

    it('should render a basic text input with a placeholder', () => {
        const placeholderText = 'Enter text here';
        render(<StatefulInputWrapper placeholder={placeholderText} />);
        const inputElement = screen.getByPlaceholderText(placeholderText);
        expect(inputElement).toBeDefined();
        const inputElementType = inputElement.getAttribute('type');
        expect(inputElementType).toBe('text');
    });

    it('should display the label and required indicator', () => {
        const labelText = 'Username';
        render(<StatefulInputWrapper label={labelText} required />);
        const labelElement = screen.getByText(labelText);
        expect(labelElement).toBeDefined();
        const requiredIndicator = screen.getByText('*');
        expect(requiredIndicator).toBeDefined();
        const requiredIndicatorClass = requiredIndicator.getAttribute('class');
        expect(requiredIndicatorClass).toContain('error-fg');
    });

    it('should not display the required indicator if not required', () => {
        const labelText = 'Optional Field';
        render(<StatefulInputWrapper label={labelText} />);
        const requiredIndicator = screen.queryByText('*');
        expect(requiredIndicator).toBeNull();
    });

    it('should update its value on change', () => {
        const setState = vi.fn();
        const initialValue = 'initial';
        const typedValue = 'new value';

        render(<Input state={initialValue} setState={setState} />);

        const inputElement = screen.getByDisplayValue(initialValue);
        fireEvent.change(inputElement, { target: { value: typedValue } });

        expect(setState).toHaveBeenCalledWith(typedValue);
    });

    it('should be controlled by state and setState props', () => {
        const placeholderText = 'test';
        const { rerender } = render(<Input state="first" setState={() => { }} placeholder={placeholderText} />);
        let input = screen.getByPlaceholderText(placeholderText) as HTMLInputElement;
        expect(input.value).toBe('first');

        rerender(<Input state="second" setState={() => { }} placeholder={placeholderText} />);
        input = screen.getByPlaceholderText(placeholderText) as HTMLInputElement;
        expect(input.value).toBe('second');
    });

    describe('Autocomplete attribute', () => {
        it('should have autocomplete="username" when name is "username"', () => {
            render(<StatefulInputWrapper name="username" />);
            const inputElement = screen.getByRole('textbox');
            expect(inputElement).toBeDefined();
            const inputElementAutoComplete = inputElement.getAttribute('autoComplete');
            expect(inputElementAutoComplete).toBe('username');
        });

        it('should have autocomplete="current-password" when name is "password"', () => {
            render(<StatefulInputWrapper name="password" type="password" />);
            const inputElement = document.querySelector('input');
            expect(inputElement).toBeDefined();
            const inputElementAutoComplete = inputElement!.getAttribute('autoComplete');
            expect(inputElementAutoComplete).toBe('current-password');
        });

        it('should have autocomplete="off" for other names', () => {
            render(<StatefulInputWrapper name="email" />);
            const inputElement = screen.getByRole('textbox');
            expect(inputElement).toBeDefined();
            const inputElementAutoComplete = inputElement.getAttribute('autoComplete');
            expect(inputElementAutoComplete).toBe('off');
        });

        it('should have autocomplete="off" by default', () => {
            render(<StatefulInputWrapper />);
            const inputElement = screen.getByRole('textbox');
            expect(inputElement).toBeDefined();
            const inputElementAutoComplete = inputElement.getAttribute('autoComplete');
            expect(inputElementAutoComplete).toBe('off');
        });
    });

    describe('Password Input', () => {
        it('should render as a password input with a toggle button', () => {
            render(<StatefulInputWrapper type="password" />);
            const inputElement = document.querySelector('input');
            expect(inputElement).toBeDefined();

            const inputType = inputElement!.getAttribute('type');
            expect(inputType).toBe('password');

            const toggleButton = screen.getByRole('button');
            expect(toggleButton).toBeDefined();
            const eyeIcon = toggleButton.querySelector('svg');
            expect(eyeIcon).toBeDefined();
        });

        it('should toggle password visibility on button click', () => {
            render(<StatefulInputWrapper type="password" />);
            const inputElement = document.querySelector('input') as HTMLInputElement;
            const toggleButton = screen.getByRole('button');

            // Initially password
            expect(inputElement.type).toBe('password');
            // Check for Eye icon
            expect(toggleButton.querySelector('title')).toBeFalsy(); // Lucide icons might not have titles, check structure
            expect(toggleButton.innerHTML).toContain('</svg>'); // Basic check for any svg

            // Click to show password
            fireEvent.click(toggleButton);
            expect(inputElement.type).toBe('text');
            // Check for EyeOff icon
            expect(toggleButton.innerHTML).toContain('</svg>');

            // Click to hide password again
            fireEvent.click(toggleButton);
            expect(inputElement.type).toBe('password');
            // Check for Eye icon again
            expect(toggleButton.innerHTML).toContain('</svg>');
        });

        it('should not render toggle button for text input', () => {
            render(<StatefulInputWrapper type="text" />);
            const toggleButton = screen.queryByRole('button');
            expect(toggleButton).toBeNull();
        });
    });
});