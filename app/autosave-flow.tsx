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
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Realtime updates</ThemedText>
          <ThemedText style={styles.bullet}>• After loading a note, the app subscribes to PocketBase SSE topic notes/&lt;note.id&gt;.</ThemedText>
          <ThemedText style={styles.bullet}>• When the server reports an update, we set a “remote update” flag.</ThemedText>
          <ThemedText style={styles.bullet}>• If you have no local edits, we auto-reload to the latest server content.</ThemedText>
          <ThemedText style={styles.bullet}>• If you have local edits, we do NOT overwrite; we just show the badge/banner.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Collision handling</ThemedText>
          <ThemedText style={styles.bullet}>• Remote flag pauses autosave to avoid clobbering a newer server version.</ThemedText>
          <ThemedText style={styles.bullet}>• You choose: Reload (discard local edits), Overwrite (save your edits anyway), or Copy & Reload (back up your text, then reload).</ThemedText>
          <ThemedText style={styles.bullet}>• Reload shows the existing “discard local edits?” confirmation.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What we don’t expose</ThemedText>
          <ThemedText style={styles.bullet}>• No secret keys or decryption details are shown here.</ThemedText>
          <ThemedText style={styles.bullet}>• Realtime payloads include hashes + encrypted blobs; decryption still requires your title.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>TL;DR safety</ThemedText>
          <ThemedText style={styles.bullet}>• Remote update? Autosave pauses until you pick Reload or Overwrite.</ThemedText>
          <ThemedText style={styles.bullet}>• You’re always asked before discarding local edits.</ThemedText>
          <ThemedText style={styles.bullet}>• Copy & Reload gives you a quick backup of your text.</ThemedText>
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
