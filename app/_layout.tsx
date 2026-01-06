import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { NoteProvider } from '@/components/note/note-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { preference } = useThemeToggle();
  const colorScheme = useColorScheme(preference);

  const navLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.background,
      text: Colors.light.text,
      border: Colors.light.icon,
      primary: Colors.light.tint,
    },
  } as const;

  const navDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.background,
      text: Colors.dark.text,
      border: Colors.dark.icon,
      primary: Colors.dark.tint,
    },
  } as const;

  const navTheme = colorScheme === 'dark' ? navDarkTheme : navLightTheme;

  return (
    <SafeAreaProvider>
      <NoteProvider>
        <ThemeProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="facts-for-nerds" options={{ title: 'Facts for Nerds' }} />
            <Stack.Screen name="COMING_SOON" options={{ title: 'Coming Soon' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </NoteProvider>
    </SafeAreaProvider>
  );
}
