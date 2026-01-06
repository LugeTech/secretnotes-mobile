import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemePreference } from './use-theme-toggle';

/**
 * Enhanced color scheme hook that supports theme toggle for web.
 * To support static rendering, this value needs to be re-calculated on the client side.
 * @param override - Optional theme preference override ('light', 'dark', or 'system')
 * @returns 'light' or 'dark'
 */
export function useColorScheme(override?: ThemePreference) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemScheme = useRNColorScheme();

  // Handle explicit light/dark preference
  if (override === 'light' || override === 'dark') {
    if (__DEV__) {
      console.log('[useColorScheme.web] Using override:', override);
    }
    return override;
  }

  // For 'system' or undefined, return the system preference
  if (hasHydrated) {
    const result = systemScheme ?? 'light';
    if (__DEV__) {
      console.log('[useColorScheme.web] Using system preference:', result, '(hasHydrated: true)');
    }
    return result;
  }

  if (__DEV__) {
    console.log('[useColorScheme.web] Not hydrated yet, returning light');
  }
  return 'light';
}

// Export the original hook for backward compatibility
export { useColorScheme as useSystemColorScheme } from 'react-native';
