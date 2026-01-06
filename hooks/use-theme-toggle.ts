import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

export function useThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  // Load saved preference on mount
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
      if (isMountedRef.current && saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
        setPreference(saved as ThemePreference);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      // Try localStorage fallback for web
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(THEME_PREFERENCE_KEY);
          if (isMountedRef.current && saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
            setPreference(saved as ThemePreference);
          }
        }
      } catch (webError) {
        console.warn('Failed to load from localStorage:', webError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const setThemePreference = async (newPreference: ThemePreference) => {
    // Prevent rapid taps - don't allow if already saving
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setPreference(newPreference); // Optimistic update for instant feedback

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);

      // Also save to localStorage as backup for web
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);

      // Revert on error
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
        } else {
          // If both fail, we still keep the optimistic update in state
          // User preference will be lost on refresh but works in current session
        }
      } catch (fallbackError) {
        console.warn('Fallback save also failed:', fallbackError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return { preference, setThemePreference, isLoading };
}
