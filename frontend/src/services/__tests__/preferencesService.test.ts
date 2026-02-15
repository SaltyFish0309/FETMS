import { describe, it, expect, beforeEach, vi } from 'vitest';
import { preferencesService } from '../preferencesService';

vi.mock('i18next', () => ({
  default: { t: (key: string) => key },
}));

vi.mock('sonner', () => ({
  toast: { warning: vi.fn(), error: vi.fn() },
}));

describe('preferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getDefaults', () => {
    it('returns default preferences', () => {
      const defaults = preferencesService.getDefaults();
      expect(defaults).toEqual({
        fontSize: 'medium',
        density: 'comfortable',
        reducedMotion: false,
      });
    });

    it('returns a fresh object each time', () => {
      const a = preferencesService.getDefaults();
      const b = preferencesService.getDefaults();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe('load', () => {
    it('returns defaults when localStorage is empty', () => {
      const prefs = preferencesService.load();
      expect(prefs).toEqual(preferencesService.getDefaults());
    });

    it('returns stored preferences when valid data exists', () => {
      const stored = { fontSize: 'large', density: 'spacious', reducedMotion: true };
      localStorage.setItem('userPreferences', JSON.stringify(stored));

      const prefs = preferencesService.load();
      expect(prefs).toEqual(stored);
    });

    it('returns defaults on invalid JSON', () => {
      localStorage.setItem('userPreferences', '{not-valid-json');

      const prefs = preferencesService.load();
      expect(prefs).toEqual(preferencesService.getDefaults());
    });

    it('returns defaults when density value is invalid', () => {
      const stored = { fontSize: 'medium', density: 'invalid', reducedMotion: false };
      localStorage.setItem('userPreferences', JSON.stringify(stored));

      const prefs = preferencesService.load();
      expect(prefs).toEqual(preferencesService.getDefaults());
    });

    it('returns defaults when fontSize value is invalid', () => {
      const stored = { fontSize: 'huge', density: 'compact', reducedMotion: false };
      localStorage.setItem('userPreferences', JSON.stringify(stored));

      const prefs = preferencesService.load();
      expect(prefs).toEqual(preferencesService.getDefaults());
    });

    it('returns defaults when reducedMotion is not a boolean', () => {
      const stored = { fontSize: 'medium', density: 'compact', reducedMotion: 'yes' };
      localStorage.setItem('userPreferences', JSON.stringify(stored));

      const prefs = preferencesService.load();
      expect(prefs).toEqual(preferencesService.getDefaults());
    });

    it('merges defaults for missing keys', () => {
      const partial = { density: 'spacious' };
      localStorage.setItem('userPreferences', JSON.stringify(partial));

      const prefs = preferencesService.load();
      expect(prefs).toEqual({
        fontSize: 'medium',
        density: 'spacious',
        reducedMotion: false,
      });
    });
  });

  describe('save', () => {
    it('persists preferences to localStorage', () => {
      const prefs = { fontSize: 'large' as const, density: 'compact' as const, reducedMotion: true };
      preferencesService.save(prefs);

      const stored = JSON.parse(localStorage.getItem('userPreferences')!);
      expect(stored).toEqual(prefs);
    });
  });
});
