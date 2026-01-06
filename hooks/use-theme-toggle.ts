import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

export function useThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    loadPreference();
  }, []);

  const loadPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      if (saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
        setPreference(saved as ThemePreference);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (newPreference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
      setPreference(newPreference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return { preference, setThemePreference, isLoading };
}
