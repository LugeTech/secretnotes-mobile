/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

// Overload signatures for proper type inference
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'gradients'
): string[];
export function useThemeColor<T extends Exclude<keyof typeof Colors.light, 'gradients'>>(
  props: { light?: string; dark?: string },
  colorName: T
): string;

// Implementation
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
): string | string[] {
  const { preference } = useThemeToggle();
  const theme = useColorScheme(preference);
  const colorFromProps = props[theme];

  if (__DEV__) {
    console.log('[useThemeColor]', {
      colorName,
      preference,
      theme,
      hasOverride: !!colorFromProps,
      value: colorFromProps ?? Colors[theme][colorName],
    });
  }

  const value = colorFromProps ?? Colors[theme][colorName];
  return value;
}
