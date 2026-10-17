import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { NoteStatus } from '@/types';

export function NoteAccessChoice({
  status,
  onCreate,
  onRecover,
}: {
  status: NoteStatus;
  onCreate: () => void;
  onRecover: () => void;
}) {
  const tint = useThemeColor({}, 'tint') as string;
  const surface = useThemeColor(
    { light: 'rgba(255, 255, 255, 0.78)', dark: 'rgba(27, 30, 36, 0.82)' },
    'background'
  ) as string;
  const border = useThemeColor(
    { light: 'rgba(44, 55, 78, 0.10)', dark: 'rgba(255, 255, 255, 0.10)' },
    'background'
  ) as string;
  const busy = status === 'creating' || status === 'recovering';
  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${tint}18` }]}>
        <IconSymbol name="lock.fill" size={20} color={tint} />
      </View>
      <ThemedText style={styles.title}>This phrase is available</ThemedText>
      <ThemedText style={styles.copy}>
        Start a blank encrypted note, or recover one saved by an older version of Secret Notez.
      </ThemedText>
      {busy ? (
        <ActivityIndicator color={tint} />
      ) : (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onCreate}
            style={({ pressed }) => [styles.button, { backgroundColor: tint, opacity: pressed ? 0.78 : 1 }]}
          >
            <ThemedText style={styles.primaryText}>Create new note</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onRecover}
            style={({ pressed }) => [styles.button, styles.secondary, { borderColor: border, opacity: pressed ? 0.55 : 1 }]}
          >
            <ThemedText style={[styles.secondaryText, { color: tint }]}>Recover existing note</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 21, lineHeight: 26, fontWeight: '700', letterSpacing: -0.5 },
  copy: { textAlign: 'center', maxWidth: 440, fontSize: 14, lineHeight: 21, opacity: 0.62 },
  actions: { width: '100%', maxWidth: 360, gap: 10, marginTop: 8 },
  button: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryText: { fontWeight: '600' },
});
