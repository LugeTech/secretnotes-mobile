import { ScrollView, StyleSheet } from 'react-native';

import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function AutosaveFlowScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead
        title="Autosave & Realtime Flow"
        description="How autosave, realtime updates, and conflict handling work in Secret Notes."
        url="https://secretnotes.app/autosave-flow"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}
          >
            Autosave & Realtime Flow
          </ThemedText>
          <ThemedText style={styles.subtitle}>Nerd notes on sync and collisions</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Autosave</ThemedText>
          <ThemedText style={styles.bullet}>• Debounced save ~1s after you stop typing (configurable via EXPO_PUBLIC_AUTO_SAVE_DELAY_MS).</ThemedText>
          <ThemedText style={styles.bullet}>• PUT /notes upserts the note; no manual save needed.</ThemedText>
          <ThemedText style={styles.bullet}>• Disabled if the title is shorter than 3 characters.</ThemedText>
          <ThemedText style={styles.bullet}>• When we reload from server, autosave baseline is synced so we don’t re-save server content back to the server.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Realtime updates</ThemedText>
          <ThemedText style={styles.bullet}>• Uses PocketBase JS SDK: subscribe to notes/* and filter client-side for your note.</ThemedText>
          <ThemedText style={styles.bullet}>• When the server reports an update, we set a “remote update” flag.</ThemedText>
          <ThemedText style={styles.bullet}>• If you have no local edits, we auto-reload to the latest server content.</ThemedText>
          <ThemedText style={styles.bullet}>• If you have local edits, we do NOT overwrite; we just show the badge/banner.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Collision handling</ThemedText>
          <ThemedText style={styles.bullet}>• Remote flag pauses autosave to avoid clobbering a newer server version.</ThemedText>
          <ThemedText style={styles.bullet}>• You choose: “Use theirs” (reload server content) or “Keep mine” (overwrite server with your edits).</ThemedText>
          <ThemedText style={styles.bullet}>• If you have no unsaved edits, we auto-reload; if you do, we never discard them automatically.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What we don’t expose</ThemedText>
          <ThemedText style={styles.bullet}>• No secret keys or decryption details are shown here.</ThemedText>
          <ThemedText style={styles.bullet}>• Realtime payloads include hashes + encrypted blobs; decryption still requires your title.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>TL;DR safety</ThemedText>
          <ThemedText style={styles.bullet}>• Remote update? Autosave pauses until you pick Use theirs or Keep mine.</ThemedText>
          <ThemedText style={styles.bullet}>• We never discard your local edits without your consent.</ThemedText>
          <ThemedText style={styles.bullet}>• Realtime stays light: collection subscription, client-side filter, and ignore self-triggered events.</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    gap: 12,
  },
  titleContainer: {
    gap: 6,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '600',
  },
  section: {
    gap: 6,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
  },
});
