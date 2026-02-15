/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cssSource = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf-8');

describe('index.css structural invariants', () => {
  describe('density system', () => {
    it('does not reference undefined --density-* variables', () => {
      const densityVarRefs = cssSource.match(/var\(--density-[^)]+\)/g) || [];
      expect(densityVarRefs).toEqual([]);
    });

    it('main element uses --spacing-lg for padding', () => {
      const mainRule = cssSource.match(/main\s*\{[^}]*\}/);
      expect(mainRule).not.toBeNull();
      expect(mainRule![0]).toContain('var(--spacing-lg)');
    });

    it('does not override Tailwind .space-y-* utility classes', () => {
      const spaceOverrides = cssSource.match(/\.space-y-\d/g) || [];
      expect(spaceOverrides).toEqual([]);
    });

    it('does not override Tailwind .gap-* utility classes', () => {
      const gapOverrides = cssSource.match(/\.gap-\d/g) || [];
      expect(gapOverrides).toEqual([]);
    });

    it('defines --spacing-lg for all density levels', () => {
      expect(cssSource).toContain('--spacing-lg:');
      expect(cssSource).toMatch(
        /\[data-density="comfortable"\][^}]*--spacing-lg:/s
      );
      expect(cssSource).toMatch(
        /\[data-density="spacious"\][^}]*--spacing-lg:/s
      );
    });

    it('defines --card-padding for all density levels', () => {
      expect(cssSource).toContain('--card-padding:');
      expect(cssSource).toMatch(
        /\[data-density="comfortable"\][^}]*--card-padding:/s
      );
      expect(cssSource).toMatch(
        /\[data-density="spacious"\][^}]*--card-padding:/s
      );
    });
  });

  describe('reduced motion', () => {
    it('has no revert !important declarations', () => {
      const revertImportant =
        cssSource.match(/revert\s*!important/g) || [];
      expect(revertImportant).toEqual([]);
    });

    it('has no unscoped * selector in prefers-reduced-motion', () => {
      const reducedMotionBlocks = cssSource.match(
        /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\s{2}\}/g
      ) || [];

      for (const block of reducedMotionBlocks) {
        const unscopedSelector = block.match(
          /\n\s{4}\*\s[,{]/
        );
        expect(unscopedSelector).toBeNull();
      }
    });
  });
});
