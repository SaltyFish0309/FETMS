import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from '../DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders with title', () => {
    render(
      <DateRangeFilter
        title="Contract Start"
        value={undefined}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Contract Start')).toBeInTheDocument();
  });

  it('shows active state when value is set', () => {
    render(
      <DateRangeFilter
        title="Contract Start"
        value={{ from: '2024-01-01', to: '2024-12-31' }}
        onChange={() => {}}
      />
    );

    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('calls onChange with undefined when cleared', () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        title="Contract Start"
        value={{ from: '2024-01-01', to: '2024-12-31' }}
        onChange={onChange}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
