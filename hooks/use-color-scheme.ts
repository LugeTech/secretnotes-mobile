import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemePreference } from './use-theme-toggle';

/**
 * Enhanced color scheme hook that supports theme toggle
 * @param override - Optional theme preference override ('light', 'dark', or undefined for system)
 * @returns 'light' or 'dark'
 */
export function useColorScheme(override?: ThemePreference) {
  const systemScheme = useRNColorScheme();

  if (override === 'light' || override === 'dark') {
    return override;
  }

  // For 'system' or undefined, return the system preference
  return systemScheme ?? 'light';
}

// Export the original hook for backward compatibility
export { useColorScheme as useSystemColorScheme } from 'react-native';
