import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ComingSoonScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading} selectable>
        App Store Links Coming Soon
      </ThemedText>
      <ThemedText style={styles.message} selectable>
        Native iOS and Android apps are on the way. For now, you can keep using the web version.
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back home"
        onPress={() => router.replace('/')}
        style={styles.homeButton}
      >
        <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.85,
  },
  homeButton: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
