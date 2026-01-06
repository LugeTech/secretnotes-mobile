/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const { preference } = useThemeContext();
  const theme = useColorScheme(preference);
  const colorFromProps = props[theme];

  const value = colorFromProps ?? Colors[theme][colorName];
  return value;
}
