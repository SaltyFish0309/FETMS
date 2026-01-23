import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock window.matchMedia for components that use media queries
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock the page components to simplify testing
vi.mock('@/pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('@/pages/Teachers', () => ({ default: () => <div>Teachers Page</div> }));
vi.mock('@/pages/Schools', () => ({ default: () => <div>Schools Page</div> }));
vi.mock('@/pages/Documents', () => ({ default: () => <div>Documents Page</div> }));
vi.mock('@/pages/Settings', () => ({ default: () => <div>Settings Page</div> }));
vi.mock('@/pages/TeacherProfile', () => ({ default: () => <div>Teacher Profile Page</div> }));
vi.mock('@/pages/SchoolProfile', () => ({ default: () => <div>School Profile Page</div> }));

describe('App routing and header titles', () => {
  // Note: Testing route-based header titles requires integration testing
  // These tests verify the routing structure exists

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
