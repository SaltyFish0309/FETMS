import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { preferencesService } from '@/services/preferencesService';
import type { UserPreferences } from '@/services/preferencesService';

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Initialize state with lazy initializer to avoid reading localStorage on every render
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return preferencesService.load();
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    preferencesService.save(preferences);
  }, [preferences]);

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only respond to changes to our specific key
      if (event.key === 'userPreferences' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as UserPreferences;
          setPreferences(parsed);
        } catch (error) {
          console.error('Failed to parse preferences from storage event:', error);
          // Don't update state if parsing fails - keep current preferences
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update preferences with partial updates
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Reset all preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(preferencesService.getDefaults());
  }, []);

  const value: PreferencesContextValue = {
    preferences,
    updatePreferences,
    resetPreferences,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
