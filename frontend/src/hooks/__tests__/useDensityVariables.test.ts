import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Display Density Variables', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.documentElement;
  });

  afterEach(() => {
    root.removeAttribute('data-density');
  });

  it('should default to no density attribute (compact by default)', () => {
    expect(root.hasAttribute('data-density')).toBe(false);
  });

  it('should set data-density attribute to "comfortable"', () => {
    root.setAttribute('data-density', 'comfortable');
    expect(root.getAttribute('data-density')).toBe('comfortable');
  });

  it('should set data-density attribute to "spacious"', () => {
    root.setAttribute('data-density', 'spacious');
    expect(root.getAttribute('data-density')).toBe('spacious');
  });

  it('should set data-density attribute to "compact"', () => {
    root.setAttribute('data-density', 'compact');
    expect(root.getAttribute('data-density')).toBe('compact');
  });

  it('should allow changing density attribute', () => {
    root.setAttribute('data-density', 'compact');
    expect(root.getAttribute('data-density')).toBe('compact');

    root.setAttribute('data-density', 'spacious');
    expect(root.getAttribute('data-density')).toBe('spacious');
  });
});
