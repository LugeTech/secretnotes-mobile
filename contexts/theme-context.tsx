import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const THEME_PREFERENCE_KEY = 'theme_preference';

export type ThemePreference = 'light' | 'dark';

interface ThemeContextType {
  preference: ThemePreference;
  setThemePreference: (newPreference: ThemePreference) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadPreference();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      if (isMountedRef.current && saved && (saved === 'light' || saved === 'dark')) {
        setPreference(saved as ThemePreference);
      }
    } catch (error) {
      console.warn('[ThemeProvider] Failed to load theme preference:', error);
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(THEME_PREFERENCE_KEY);
          if (isMountedRef.current && saved && (saved === 'light' || saved === 'dark')) {
            setPreference(saved as ThemePreference);
          }
        }
      } catch (webError) {
        console.warn('[ThemeProvider] Fallback load also failed:', webError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const setThemePreference = useCallback(async (newPreference: ThemePreference) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setPreference(newPreference);

    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
      }
    } catch (error) {
      console.error('[ThemeProvider] Failed to save theme preference:', error);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
        }
      } catch (fallbackError) {
        console.warn('[ThemeProvider] Fallback save also failed:', fallbackError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [isSaving]);

  return (
    <ThemeContext.Provider value={{ preference, setThemePreference, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
