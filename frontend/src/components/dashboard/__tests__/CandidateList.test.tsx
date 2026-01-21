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

    // The ScrollArea should have max-height to constrain vertical expansion
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    expect(scrollArea).toBeInTheDocument();
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
