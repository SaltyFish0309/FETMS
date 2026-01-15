import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberRangeFilter } from '../NumberRangeFilter';

describe('NumberRangeFilter', () => {
  it('renders with title', () => {
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /salary/i })).toBeInTheDocument();
  });

  it('shows min and max inputs in popover', () => {
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salary/i }));

    expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument();
  });

  it('calls onChange when apply is clicked', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salary/i }));

    const minInput = screen.getByPlaceholderText(/min/i);
    fireEvent.change(minInput, { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onChange).toHaveBeenCalledWith({ min: 50000, max: undefined });
  });
});
