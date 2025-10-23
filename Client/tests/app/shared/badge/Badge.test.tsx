import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import Badge from '../../../../src/app/shared/badge/Badge';

describe('Badge', () => {
  // Clean up the DOM after each test to prevent interference
  afterEach(cleanup);

  it('should render with the correct label and color class', () => {
    const label = 'New Feature';
    const color = 'success';
    render(<Badge label={label} color={color} />);

    const badgeElement = screen.getByText(label);
    expect(badgeElement).toBeDefined();
    const badgeClass = badgeElement.getAttribute('class');
    expect(badgeClass).toContain('badge-success');
  });
});