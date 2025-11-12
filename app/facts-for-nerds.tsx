import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function FactsForNerdsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#808080"
          name="lock.shield.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Facts for Nerds
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Crypto at a glance</ThemedText>
        <ThemedText style={styles.bullet}>• AES-256-GCM for note and image encryption.</ThemedText>
        <ThemedText style={styles.bullet}>• PBKDF2 (SHA-256, 10,000+ iterations) to derive keys from your passphrase.</ThemedText>
        <ThemedText style={styles.bullet}>• Only a SHA-256 hash of your passphrase is stored for lookup.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Brute-force reality check</ThemedText>
        <ThemedText style={styles.bullet}>• 8 lowercase letters (~2.1e11 combos): trivial with modern hardware. Don&apos;t.</ThemedText>
        <ThemedText style={styles.bullet}>• 8 chars [a-zA-Z0-9] (~2.8e14 combos): still within reach of serious attackers.</ThemedText>
        <ThemedText style={styles.bullet}>• 12 chars [a-zA-Z0-9] (~4.7e21 combos): beyond practical offline cracking for most real-world attackers.</ThemedText>
        <ThemedText style={styles.bullet}>• Go longer + symbols and you&apos;re effectively out of reach, especially with PBKDF2 slowing guesses.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>What we (still) see</ThemedText>
        <ThemedText style={styles.bullet}>• We see: encrypted blobs, hashes, timestamps.</ThemedText>
        <ThemedText style={styles.bullet}>• We do not see: your raw passphrase or decrypted content.</ThemedText>
        <ThemedText style={styles.bullet}>• Wrong passphrase = garbage; there&apos;s no admin backdoor to read your private notes.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nerdy caveats</ThemedText>
        <ThemedText style={styles.bullet}>• Security still depends on your passphrase: avoid short, common, or reused ones.</ThemedText>
        <ThemedText style={styles.bullet}>• Public/simple phrases act like shared boards anyone can stumble into.</ThemedText>
        <ThemedText style={styles.emphasis}>Lose your passphrase? There&apos;s no recovery. That&apos;s by design.</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -80,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    gap: 6,
    marginTop: 18,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
   bullet: {
     fontSize: 15,
     lineHeight: 22,
     marginBottom: 3,
   },
   emphasis: {
     fontSize: 15,
     lineHeight: 22,
     marginTop: 6,
     fontWeight: '700',
     color: '#D32F2F',
   },
});
