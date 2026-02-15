import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '../PreferencesContext';

function TestComponent() {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  return (
    <div>
      <span data-testid="density">{preferences.density}</span>
      <span data-testid="fontSize">{preferences.fontSize}</span>
      <span data-testid="reducedMotion">{String(preferences.reducedMotion)}</span>
      <button onClick={() => updatePreferences({ density: 'spacious' })}>Set Spacious</button>
      <button onClick={() => updatePreferences({ reducedMotion: true })}>Enable Reduced Motion</button>
      <button onClick={() => updatePreferences({ fontSize: 'large' })}>Set Large Font</button>
      <button onClick={resetPreferences}>Reset</button>
    </div>
  );
}

describe('PreferencesContext integration', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');
    root.removeAttribute('data-font-size');
  });

  afterEach(() => {
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');
    root.removeAttribute('data-font-size');
  });

  it('applies data-density attribute on mount', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    expect(root.getAttribute('data-density')).toBe('comfortable');
  });

  it('updates data-density when density preference changes', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    act(() => {
      screen.getByText('Set Spacious').click();
    });

    expect(root.getAttribute('data-density')).toBe('spacious');
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');
  });

  it('sets data-reduced-motion when reducedMotion preference changes', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    expect(root.getAttribute('data-reduced-motion')).toBe('false');

    act(() => {
      screen.getByText('Enable Reduced Motion').click();
    });

    expect(root.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('sets data-font-size when fontSize preference changes', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    expect(root.getAttribute('data-font-size')).toBe('medium');

    act(() => {
      screen.getByText('Set Large Font').click();
    });

    expect(root.getAttribute('data-font-size')).toBe('large');
  });

  it('reverts all DOM attributes on resetPreferences', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    act(() => {
      screen.getByText('Set Spacious').click();
      screen.getByText('Enable Reduced Motion').click();
      screen.getByText('Set Large Font').click();
    });

    expect(root.getAttribute('data-density')).toBe('spacious');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
    expect(root.getAttribute('data-font-size')).toBe('large');

    act(() => {
      screen.getByText('Reset').click();
    });

    expect(root.getAttribute('data-density')).toBe('comfortable');
    expect(root.getAttribute('data-reduced-motion')).toBe('false');
    expect(root.getAttribute('data-font-size')).toBe('medium');
  });

  it('persists preferences in localStorage and survives remount', () => {
    const { unmount } = render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    act(() => {
      screen.getByText('Set Spacious').click();
    });

    // Verify localStorage was updated
    const stored = JSON.parse(localStorage.getItem('userPreferences')!);
    expect(stored.density).toBe('spacious');

    // Unmount and remount
    unmount();

    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    // Should restore from localStorage
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');
    expect(root.getAttribute('data-density')).toBe('spacious');
  });
});
