/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

export function useThemeColor<T extends keyof typeof Colors.light & keyof typeof Colors.dark>(
  props: { light?: string; dark?: string },
  colorName: T
): T extends 'gradients' ? string[] : string {
  const { preference } = useThemeToggle();
  const theme = useColorScheme(preference);
  const colorFromProps = props[theme];

  const value = colorFromProps ?? Colors[theme][colorName];
  return value as any;
}
