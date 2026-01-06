import { useEffect, useState } from 'react';
import { ThemePreference } from './use-theme-toggle';

/**
 * Enhanced color scheme hook that supports theme toggle for web.
 * Listens for system theme changes via matchMedia.
 * @param override - Optional theme preference override ('light', 'dark', or 'system')
 * @returns 'light' or 'dark'
 */
export function useColorScheme(override?: ThemePreference) {
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Handle explicit light/dark preference
  if (override === 'light' || override === 'dark') {
    return override;
  }

  // For 'system' or undefined, return the system preference
  return systemScheme;
}

// Export the original hook for backward compatibility
export { useColorScheme as useSystemColorScheme } from 'react-native';
