import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewModeToggle } from '../ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders list and kanban options', () => {
    render(<ViewModeToggle value="list" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kanban/i })).toBeInTheDocument();
  });

  it('highlights the active mode', () => {
    render(<ViewModeToggle value="list" onChange={() => {}} />);

    const listButton = screen.getByRole('button', { name: /list/i });
    expect(listButton).toHaveClass('bg-white');
  });

  it('calls onChange when mode is switched', () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="list" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /kanban/i }));
    expect(onChange).toHaveBeenCalledWith('kanban');
  });
});
