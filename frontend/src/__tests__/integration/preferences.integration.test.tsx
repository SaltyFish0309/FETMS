import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Preferences Integration Tests', () => {
  let root: HTMLElement;
  let indexCSS: string;

  beforeEach(() => {
    root = document.documentElement;
    // Read index.css to verify rules exist
    indexCSS = readFileSync(join(__dirname, '../../index.css'), 'utf-8');
  });

  afterEach(() => {
    root.removeAttribute('data-density');
    root.removeAttribute('data-reduced-motion');
  });

  describe('Density System Integration', () => {
    it('should have CSS rules for compact density (default)', () => {
      expect(indexCSS).toContain(':root {');
      expect(indexCSS).toContain('--spacing-xs: 0.25rem');
      expect(indexCSS).toContain('--spacing-sm: 0.5rem');
      expect(indexCSS).toContain('--line-height: 1.4');
      expect(indexCSS).toContain('--table-row-height: 2.5rem');
    });

    it('should have CSS rules for comfortable density', () => {
      expect(indexCSS).toContain('[data-density="comfortable"]');
      expect(indexCSS).toContain('--spacing-xs: 0.375rem');
      expect(indexCSS).toContain('--spacing-sm: 0.75rem');
      expect(indexCSS).toContain('--line-height: 1.6');
      expect(indexCSS).toContain('--table-row-height: 3rem');
    });

    it('should have CSS rules for spacious density', () => {
      expect(indexCSS).toContain('[data-density="spacious"]');
      expect(indexCSS).toContain('--spacing-xs: 0.5rem');
      expect(indexCSS).toContain('--spacing-sm: 1rem');
      expect(indexCSS).toContain('--line-height: 1.8');
      expect(indexCSS).toContain('--table-row-height: 3.5rem');
    });

    it('should be able to set density attribute on root element', () => {
      root.setAttribute('data-density', 'comfortable');
      expect(root.getAttribute('data-density')).toBe('comfortable');

      root.setAttribute('data-density', 'spacious');
      expect(root.getAttribute('data-density')).toBe('spacious');

      root.removeAttribute('data-density');
      expect(root.getAttribute('data-density')).toBeNull();
    });
  });

  describe('Animation Override System Integration', () => {
    it('should have CSS rules for force-enabling animations', () => {
      expect(indexCSS).toContain('[data-reduced-motion="false"]');
      expect(indexCSS).toMatch(/animation-duration:\s*revert\s*!important/);
      expect(indexCSS).toMatch(/transition-duration:\s*revert\s*!important/);
    });

    it('should have CSS rules for force-disabling animations', () => {
      expect(indexCSS).toContain('[data-reduced-motion="true"]');
      expect(indexCSS).toMatch(/animation-duration:\s*0\.001ms\s*!important/);
      expect(indexCSS).toMatch(/transition-duration:\s*0\.001ms\s*!important/);
    });

    it('should have CSS rules respecting OS prefers-reduced-motion', () => {
      expect(indexCSS).toContain('@media (prefers-reduced-motion: reduce)');
      expect(indexCSS).toMatch(/animation-duration:\s*0\.001ms\s*!important/);
    });

    it('should be able to set reduced-motion attribute on root element', () => {
      root.setAttribute('data-reduced-motion', 'true');
      expect(root.getAttribute('data-reduced-motion')).toBe('true');

      root.setAttribute('data-reduced-motion', 'false');
      expect(root.getAttribute('data-reduced-motion')).toBe('false');

      root.removeAttribute('data-reduced-motion');
      expect(root.getAttribute('data-reduced-motion')).toBeNull();
    });
  });

  describe('Cross-Preference Integration', () => {
    it('should be able to set multiple preferences simultaneously', () => {
      root.setAttribute('data-density', 'spacious');
      root.setAttribute('data-reduced-motion', 'true');

      expect(root.getAttribute('data-density')).toBe('spacious');
      expect(root.getAttribute('data-reduced-motion')).toBe('true');
    });

    it('should have all required CSS custom properties defined', () => {
      const requiredProperties = [
        '--spacing-xs',
        '--spacing-sm',
        '--spacing-md',
        '--spacing-lg',
        '--spacing-xl',
        '--line-height',
        '--table-row-height',
        '--button-padding-y',
        '--button-padding-x',
        '--input-height',
        '--card-padding',
        '--form-gap',
      ];

      requiredProperties.forEach(prop => {
        expect(indexCSS).toContain(prop);
      });
    });
  });
});
