import { ScrollView, StyleSheet, View } from 'react-native';

import { InstallSection } from '@/components/cli/install-section';
import { ExternalLink } from '@/components/external-link';
import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const cliReadme = 'https://github.com/ktappdev/secretnotes-go-backend/blob/main/cli/README.md';

export default function InstallCliScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead
        title="SecretNotes CLI — coming soon"
        description="The new SecretNotes CLI is coming soon. Go installation and macOS downloads will be available with the new release."
        url="https://secretnotez.com/install-cli"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <ThemedText type="link" style={styles.eyebrow}>SECRETNOTES / TERMINAL</ThemedText>
          <ThemedText accessibilityRole="header" style={styles.title}>Your notes. In your terminal.</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.status}>New CLI coming soon</ThemedText>
          <ThemedText style={styles.description}>
            Create and edit your SecretNotes from a terminal. The new CLI will connect to the same backend and encrypted notes as the web app.
          </ThemedText>
        </View>

        <InstallSection title="Install with Go">
          <ThemedText>
            Coming with the new release. Go installation instructions will be available here once the current CLI is released.
          </ThemedText>
          <ExternalLink href="https://go.dev/doc/install"><ThemedText type="link">Go installation instructions ↗</ThemedText></ExternalLink>
        </InstallSection>

        <InstallSection title="Download for macOS">
          <ThemedText>
            Coming soon. Download links for supported Macs and an inspectable install script will be added when the new release and its checksums are published.
          </ThemedText>
          <ThemedText style={styles.description}>
            Supported processors and the minimum macOS version will be confirmed with the release.
          </ThemedText>
        </InstallSection>

        <InstallSection title="Using the older CLI?">
          <ThemedText>
            The older CLI opens legacy notes. After you recover a note in the web app, the web app uses a new encrypted v2 copy. The older CLI still opens the legacy copy, so the same passphrase can show different content.
          </ThemedText>
          <ThemedText type="defaultSemiBold">
            Use the web app for your current notes until the new CLI is available. Edits in the older CLI will not update the web app’s v2 copy.
          </ThemedText>
          <ExternalLink href={cliReadme}><ThemedText type="link">Read about the CLI ↗</ThemedText></ExternalLink>
        </InstallSection>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 24, paddingBottom: 48, gap: 20 },
  intro: { gap: 14, paddingVertical: 16 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 1 },
  title: { fontFamily: Fonts.rounded, fontSize: 36, lineHeight: 42, fontWeight: '700', letterSpacing: -1 },
  description: { opacity: 0.8 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.10)' },
});
