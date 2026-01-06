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
        url="https://secretnotez.com/autosave-flow"
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
          <ThemedText style={styles.subtitle}>
            How Secret Notes quietly keeps everything up to date
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Autosave</ThemedText>
          <ThemedText style={styles.bullet}>• Saves your note a moment after you pause typing.</ThemedText>
          <ThemedText style={styles.bullet}>• No save button to tap—everything just stays current.</ThemedText>
          <ThemedText style={styles.bullet}>
            • Short titles are ignored so drafts don’t clutter your list.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • We only save what you wrote, never the same thing twice.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Live updates</ThemedText>
          <ThemedText style={styles.bullet}>
            • Secret Notes watches for changes while you have a note open.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • If something changes elsewhere, we gently let you know.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • No edits waiting on your device? We refresh instantly so you always see the newest version.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Working on something? We leave it alone and simply flag that there’s something new.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>When two devices collide</ThemedText>
          <ThemedText style={styles.bullet}>
            • We pause autosave the moment another device makes a newer change.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • You get a clear choice: keep what you just wrote or load the other version.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • If nothing is pending on your side, we safely show the latest content right away.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy first</ThemedText>
          <ThemedText style={styles.bullet}>
            • Your notes are encrypted, and only your device holds the key details.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Even our live updates stay sealed until your app unlocks them.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick reassurance</ThemedText>
          <ThemedText style={styles.bullet}>
            • Autosave only runs when it’s safe, and it waits if anything looks unsure.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Your writing is never tossed out or replaced without your tap.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Notifications are minimal and only about the note you’re working on.
          </ThemedText>
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
