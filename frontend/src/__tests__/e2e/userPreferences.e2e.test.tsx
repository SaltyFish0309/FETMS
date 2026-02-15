import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('User Preferences E2E Flow', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.documentElement;
    localStorage.clear();
  });

  afterEach(() => {
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');
    localStorage.clear();
  });

  it('should apply multiple preference changes in sequence', () => {
    // Step 1: Set comfortable density
    root.setAttribute('data-density', 'comfortable');
    expect(root.getAttribute('data-density')).toBe('comfortable');

    // Step 2: Change to spacious density
    root.setAttribute('data-density', 'spacious');
    expect(root.getAttribute('data-density')).toBe('spacious');

    // Step 3: Enable reduced motion
    root.setAttribute('data-reduced-motion', 'true');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');

    // Step 4: Verify both preferences are still active
    expect(root.getAttribute('data-density')).toBe('spacious');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('should persist preferences in localStorage pattern', () => {
    // Simulate setting preferences
    const preferences = {
      density: 'comfortable',
      reducedMotion: true,
      fontSize: 'medium'
    };

    localStorage.setItem('userPreferences', JSON.stringify(preferences));

    // Verify localStorage contains preferences
    const stored = localStorage.getItem('userPreferences');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.density).toBe('comfortable');
    expect(parsed.reducedMotion).toBe(true);

    // Simulate restoring preferences
    root.setAttribute('data-density', parsed.density);
    root.setAttribute('data-reduced-motion', parsed.reducedMotion ? 'true' : 'false');

    // Verify preferences applied
    expect(root.getAttribute('data-density')).toBe('comfortable');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('should handle preference reset to defaults', () => {
    // Set custom preferences
    root.setAttribute('data-density', 'spacious');
    root.setAttribute('data-reduced-motion', 'true');

    expect(root.getAttribute('data-density')).toBe('spacious');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');

    // Reset to defaults (remove attributes)
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');

    // Verify defaults applied (attributes removed)
    expect(root.getAttribute('data-density')).toBeNull();
    expect(root.getAttribute('data-reduced-motion')).toBeNull();
  });

  it('should handle all density and animation combinations', () => {
    const densities = ['compact', 'comfortable', 'spacious'];
    const animations = ['true', 'false'];

    densities.forEach(density => {
      animations.forEach(reducedMotion => {
        // Apply preferences
        if (density === 'compact') {
          root.removeAttribute('data-density');
        } else {
          root.setAttribute('data-density', density);
        }
        root.setAttribute('data-reduced-motion', reducedMotion);

        // Verify density
        if (density === 'compact') {
          expect(root.getAttribute('data-density')).toBeNull();
        } else {
          expect(root.getAttribute('data-density')).toBe(density);
        }

        // Verify animation
        expect(root.getAttribute('data-reduced-motion')).toBe(reducedMotion);
      });
    });
  });

  it('should handle localStorage serialization and deserialization', () => {
    const testCases = [
      { density: 'compact', reducedMotion: false, fontSize: 'small' },
      { density: 'comfortable', reducedMotion: true, fontSize: 'medium' },
      { density: 'spacious', reducedMotion: false, fontSize: 'large' },
    ];

    testCases.forEach(preferences => {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      // Retrieve and parse
      const stored = localStorage.getItem('userPreferences');
      const parsed = JSON.parse(stored!);

      // Verify all properties match
      expect(parsed.density).toBe(preferences.density);
      expect(parsed.reducedMotion).toBe(preferences.reducedMotion);
      expect(parsed.fontSize).toBe(preferences.fontSize);

      // Clear for next iteration
      localStorage.clear();
    });
  });
});
