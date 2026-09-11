import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
  const busy = status === 'creating' || status === 'recovering';
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">No encrypted note found</ThemedText>
      <ThemedText style={styles.copy}>
        Create a blank note, or recover an existing note without sending this title to the server.
      </ThemedText>
      {busy ? (
        <ActivityIndicator color={tint} />
      ) : (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onCreate} style={[styles.button, { backgroundColor: tint }]}>
            <ThemedText style={styles.primaryText}>Create new note</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onRecover} style={[styles.button, styles.secondary, { borderColor: tint }]}>
            <ThemedText style={{ color: tint }}>Recover existing note</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  copy: { textAlign: 'center', maxWidth: 460, opacity: 0.75 },
  actions: { width: '100%', maxWidth: 360, gap: 12 },
  button: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1 },
  primaryText: { color: '#fff', fontWeight: '600' },
});
