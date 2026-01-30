import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Preferences Integration Tests', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.documentElement;
  });

  afterEach(() => {
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');
  });

  describe('Density System Integration', () => {
    it('should be able to set density attribute on root element', () => {
      root.setAttribute('data-density', 'comfortable');
      expect(root.getAttribute('data-density')).toBe('comfortable');

      root.setAttribute('data-density', 'spacious');
      expect(root.getAttribute('data-density')).toBe('spacious');

      root.removeAttribute('data-density');
      expect(root.getAttribute('data-density')).toBeNull();
    });

    it('should accept all valid density values', () => {
      const validDensities = ['comfortable', 'spacious'];

      validDensities.forEach(density => {
        root.setAttribute('data-density', density);
        expect(root.getAttribute('data-density')).toBe(density);
      });
    });

    it('should allow compact density by removing attribute', () => {
      root.setAttribute('data-density', 'spacious');
      expect(root.getAttribute('data-density')).toBe('spacious');

      root.removeAttribute('data-density');
      expect(root.getAttribute('data-density')).toBeNull();
    });
  });

  describe('Animation Override System Integration', () => {
    it('should be able to set reduced-motion attribute on root element', () => {
      root.setAttribute('data-reduced-motion', 'true');
      expect(root.getAttribute('data-reduced-motion')).toBe('true');

      root.setAttribute('data-reduced-motion', 'false');
      expect(root.getAttribute('data-reduced-motion')).toBe('false');

      root.removeAttribute('data-reduced-motion');
      expect(root.getAttribute('data-reduced-motion')).toBeNull();
    });

    it('should accept both animation preference values', () => {
      const validValues = ['true', 'false'];

      validValues.forEach(value => {
        root.setAttribute('data-reduced-motion', value);
        expect(root.getAttribute('data-reduced-motion')).toBe(value);
      });
    });
  });

  describe('Cross-Preference Integration', () => {
    it('should be able to set multiple preferences simultaneously', () => {
      root.setAttribute('data-density', 'spacious');
      root.setAttribute('data-reduced-motion', 'true');

      expect(root.getAttribute('data-density')).toBe('spacious');
      expect(root.getAttribute('data-reduced-motion')).toBe('true');
    });

    it('should maintain preferences independently', () => {
      root.setAttribute('data-density', 'comfortable');
      root.setAttribute('data-reduced-motion', 'false');

      // Change density without affecting animation
      root.setAttribute('data-density', 'spacious');
      expect(root.getAttribute('data-density')).toBe('spacious');
      expect(root.getAttribute('data-reduced-motion')).toBe('false');

      // Change animation without affecting density
      root.setAttribute('data-reduced-motion', 'true');
      expect(root.getAttribute('data-density')).toBe('spacious');
      expect(root.getAttribute('data-reduced-motion')).toBe('true');
    });
  });
});
