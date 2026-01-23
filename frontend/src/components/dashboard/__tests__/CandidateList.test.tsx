import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CandidateList } from '../CandidateList';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('CandidateList', () => {
  const mockCandidates = [
    { _id: '1', firstName: 'John', lastName: 'Doe', pipelineStage: 'Stage 1', salary: 50000 },
    { _id: '2', firstName: 'Jane', lastName: 'Smith', pipelineStage: 'Stage 2', salary: 60000 },
  ];

  it('renders candidate list with scroll constraint', () => {
    renderWithRouter(
      <CandidateList candidates={mockCandidates} hasFilters={true} />
    );

    // The ScrollArea should be present for scrolling
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    expect(scrollArea).toBeInTheDocument();
  });

  describe('scroll constraint CSS classes', () => {
    it('has min-h-0 on CardContent to enable flex shrinking for scroll', () => {
      const { container } = renderWithRouter(
        <CandidateList candidates={mockCandidates} hasFilters={true} />
      );

      // CardContent should have min-h-0 to allow flex item to shrink below content size
      const cardContent = container.querySelector('.min-h-0.flex-1.overflow-hidden');
      expect(cardContent).toBeInTheDocument();
    });

    it('has h-full on empty state container when no filters applied', () => {
      const { container } = renderWithRouter(
        <CandidateList candidates={[]} hasFilters={false} />
      );

      // Empty state should use h-full to fill available space
      const emptyState = container.querySelector('.h-full.flex.flex-col.items-center.justify-center');
      expect(emptyState).toBeInTheDocument();
    });

    it('has h-full on empty state container when no candidates match', () => {
      const { container } = renderWithRouter(
        <CandidateList candidates={[]} hasFilters={true} />
      );

      // No matches state should use h-full to fill available space
      const noMatchesState = container.querySelector('.h-full.flex.flex-col.items-center.justify-center');
      expect(noMatchesState).toBeInTheDocument();
    });
  });

  it('shows "Ready to Search" when no filters applied', () => {
    renderWithRouter(
      <CandidateList candidates={[]} hasFilters={false} />
    );

    expect(screen.getByText('Ready to Search')).toBeInTheDocument();
  });

  it('shows candidates when filters applied', () => {
    renderWithRouter(
      <CandidateList candidates={mockCandidates} hasFilters={true} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays candidate count badge when filters active', () => {
    renderWithRouter(
      <CandidateList candidates={mockCandidates} hasFilters={true} />
    );

    expect(screen.getByText('2 Found')).toBeInTheDocument();
  });
});
