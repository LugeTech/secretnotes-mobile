import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';

import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function FactsForNerdsScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead 
        title="Technical Security Details" 
        description="In-depth look at Secret Notes encryption: AES-256-GCM, PBKDF2 key derivation, and SHA-256 hashing."
        url="https://secretnotez.com/facts-for-nerds"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
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
        <ThemedText style={styles.bullet}>• PBKDF2 (SHA-256, 10,000+ iterations) to derive keys from your title.</ThemedText>
        <ThemedText style={styles.bullet}>• Only a SHA-256 hash of your title is stored for lookup.</ThemedText>
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
        <ThemedText style={styles.bullet}>• We do not see: your raw title or decrypted content.</ThemedText>
        <ThemedText style={styles.bullet}>• Wrong title = garbage; there&apos;s no admin backdoor to read your private notes.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nerdy caveats</ThemedText>
        <ThemedText style={styles.bullet}>• Security still depends on your title: avoid short, common, or reused ones.</ThemedText>
        <ThemedText style={styles.bullet}>• Public/simple titles act like shared boards anyone can stumble into.</ThemedText>
        <ThemedText style={styles.emphasis}>Lose your title? There&apos;s no recovery. That&apos;s by design.</ThemedText>
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
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
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
