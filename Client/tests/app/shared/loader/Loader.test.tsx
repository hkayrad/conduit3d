import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

let appSelectorReturnValue = true;

vi.mock('../../../../src/lib/hooks', () => ({
  useAppSelector: () => appSelectorReturnValue,
}));

import Loader from '../../../../src/app/shared/loader/Loader';

describe('Loader', () => {
  afterEach(cleanup)
  it('should render loader when data is loading', () => {
    render(<Loader />);
    const loaderElement = screen.getByTestId('loader');
    expect(loaderElement).toBeDefined();
    const loaderElementClasses = loaderElement.classList;
    expect(loaderElementClasses).toContain('visible');
  })

  it('should render loader when data is loading', () => {
    appSelectorReturnValue = false;
    render(<Loader />);
    expect(screen.getAllByTestId('loader')).toBeDefined();
    const loaderElement = screen.getByTestId('loader');
    const loaderElementClasses = loaderElement.classList;
    expect(loaderElementClasses).not.toContain('visible');
  })
});
