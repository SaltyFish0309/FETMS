import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Animation Override System', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.documentElement;
  });

  afterEach(() => {
    root.removeAttribute('data-reduced-motion');
  });

  it('should set data-reduced-motion attribute to "false" for force-enable', () => {
    root.setAttribute('data-reduced-motion', 'false');
    expect(root.getAttribute('data-reduced-motion')).toBe('false');
  });

  it('should set data-reduced-motion attribute to "true" for force-disable', () => {
    root.setAttribute('data-reduced-motion', 'true');
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('should allow removal of data-reduced-motion attribute', () => {
    root.setAttribute('data-reduced-motion', 'true');
    expect(root.hasAttribute('data-reduced-motion')).toBe(true);

    root.removeAttribute('data-reduced-motion');
    expect(root.hasAttribute('data-reduced-motion')).toBe(false);
  });
});
