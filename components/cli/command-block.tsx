import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

export function CommandBlock({ command }: { command: string }) {
  const [feedback, setFeedback] = useState('Copy');

  async function copyCommand() {
    try {
      setFeedback(await Clipboard.setStringAsync(command) ? 'Copied' : 'Select to copy');
    } catch {
      setFeedback('Select to copy');
    }
  }

  return (
    <View style={styles.container}>
      <ThemedText selectable style={styles.command}>{command}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Copy command: ${command}`}
        onPress={copyCommand}
        style={({ pressed }) => [styles.copy, { opacity: pressed ? 0.6 : 1 }]}
      >
        <ThemedText type="link" accessibilityLiveRegion="polite">{feedback}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: 12, padding: 14, gap: 8 },
  command: { fontFamily: Fonts.mono, fontSize: 13, lineHeight: 21, flexShrink: 1 },
  copy: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
});
