import i18next from 'i18next';
import { toast } from 'sonner';

export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  reducedMotion: boolean;
}

const STORAGE_KEY = 'userPreferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 'medium',
  density: 'comfortable',
  reducedMotion: false,
};

/**
 * Validates if a given object matches the UserPreferences structure
 */
function isValidPreferences(obj: unknown): obj is UserPreferences {
  if (!obj || typeof obj !== 'object') return false;

  const prefs = obj as Partial<UserPreferences>;

  const validFontSizes = ['small', 'medium', 'large'];
  const validDensities = ['compact', 'comfortable', 'spacious'];

  if (prefs.fontSize !== undefined && !validFontSizes.includes(prefs.fontSize)) {
    return false;
  }

  if (prefs.density !== undefined && !validDensities.includes(prefs.density)) {
    return false;
  }

  if (prefs.reducedMotion !== undefined && typeof prefs.reducedMotion !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Load preferences from localStorage
 * Returns defaults if corrupted or missing
 */
function load(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(stored);

    if (!isValidPreferences(parsed)) {
      console.error('Invalid preferences structure in localStorage');
      toast.warning(i18next.t('toast.preferences.corrupted', { ns: 'common' }));
      return { ...DEFAULT_PREFERENCES };
    }

    // Merge with defaults to handle missing keys (schema evolution)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    toast.warning(i18next.t('toast.preferences.corrupted', { ns: 'common' }));
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save preferences to localStorage
 */
function save(preferences: UserPreferences): void {
  try {
    const json = JSON.stringify(preferences);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save preferences:', error);
    toast.error(i18next.t('toast.preferences.saveFailed', { ns: 'common' }));
  }
}

/**
 * Get a copy of default preferences
 */
function getDefaults(): UserPreferences {
  return { ...DEFAULT_PREFERENCES };
}

export const preferencesService = {
  load,
  save,
  getDefaults,
};
