import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '../usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  let listeners: Map<string, (event: MediaQueryListEvent) => void>;
  let matchesValue: boolean;

  beforeEach(() => {
    listeners = new Map();
    matchesValue = false;

    vi.mocked(window.matchMedia).mockImplementation((query: string) => {
      const mql = {
        matches: matchesValue,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: EventListener) => {
          listeners.set(event, handler as unknown as (event: MediaQueryListEvent) => void);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      return mql as unknown as MediaQueryList;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when matchMedia reports no reduced motion', () => {
    matchesValue = false;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia reports reduced motion', () => {
    matchesValue = true;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia fires change event', () => {
    matchesValue = false;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    const changeHandler = listeners.get('change');
    expect(changeHandler).toBeDefined();

    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });
});
