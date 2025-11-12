import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface SaveIndicatorProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}

export function SaveIndicator({ isSaving, hasUnsavedChanges, lastSavedAt }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="small" />
        <ThemedText style={styles.text}>Saving...</ThemedText>
      </ThemedView>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.unsavedText}>Unsaved changes</ThemedText>
      </ThemedView>
    );
  }

  if (lastSavedAt) {
    const timeStr = lastSavedAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.savedText}>Saved at {timeStr}</ThemedText>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    opacity: 0.7,
  },
  savedText: {
    fontSize: 12,
    opacity: 0.7,
    color: '#4CAF50',
  },
  unsavedText: {
    fontSize: 12,
    opacity: 0.7,
    color: '#FF9800',
  },
});
