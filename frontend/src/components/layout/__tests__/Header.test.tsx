import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

describe('Header', () => {
  it('renders with default title "Dashboard"', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dashboard');
  });

  it('renders with custom title', () => {
    render(<Header title="Teachers" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Teachers');
  });

  it('renders search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<Header />);
    // Bell icon should be present
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
