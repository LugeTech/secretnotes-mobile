import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function InstallSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <ThemedText accessibilityRole="header" style={styles.title}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.04)' },
  title: { fontSize: 20, lineHeight: 27, fontWeight: '700' },
});
