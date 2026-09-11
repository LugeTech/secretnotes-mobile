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
        title="How Secret Notez encryption works"
        description="A plain-language technical explanation of Secret Notez v2: local scrypt and HKDF key derivation, AES-256-GCM encryption, authenticated ciphertext, and legacy recovery."
        url="https://secretnotez.com/facts-for-nerds"
        keywords="Secret Notez encryption, scrypt, HKDF, AES-256-GCM, end-to-end encrypted notes, client-side encryption"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('@/assets/images/icon.png')}
          accessibilityLabel="Secret Notez logo"
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Facts for Nerds
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            The short technical version of what happens before, during, and after a save.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Protocol v2</ThemedText>
          <ThemedText style={styles.body}>
            The current clients use the same protocol on web, mobile, and CLI. The parameters below are fixed for protocol v2.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • The exact passphrase is converted to UTF-8 bytes. It is not trimmed, lowercased, or otherwise normalized.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • scrypt derives a 32-byte root locally with N=65,536, r=8, p=2, and the public salt secretnotez/e2ee/v2.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • HKDF-SHA256 derives separate keys for lookup, note text, image bytes, and image metadata.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • AES-256-GCM encrypts each value with a fresh secure 12-byte nonce. The nonce can be public; the key cannot.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Each encrypted envelope carries its version and nonce. Authenticated v2-purpose labels make the wrong key or an altered payload fail closed.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What leaves the device</ThemedText>
          <ThemedText style={styles.body}>
            For a current v2 note, the passphrase and derived encryption keys stay in the active client session.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Requests carry a derived lookup token in X-Lookup-Token. The token is not the passphrase and cannot decrypt the note by itself.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Note text, image bytes, the image filename, and the media type are encrypted before upload.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • The server stores a hash of the lookup token plus encrypted payloads, versions, and timestamps. It returns the encrypted payload unchanged.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • HTTPS protects the connection in transit, but the end-to-end property comes from encrypting on the client before the request is made.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What the server can still see</ThemedText>
          <ThemedText style={styles.bullet}>
            • Whether a lookup matches a note, plus note versions, timestamps, and approximate encrypted payload sizes.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Whether an encrypted image exists and the size of the uploaded encrypted file.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Normal network and operational metadata such as IP address, request timing, and availability, depending on hosting and logs.
          </ThemedText>
          <ThemedText style={styles.body}>
            It can store and serve the ciphertext, but it does not have the passphrase-derived keys needed to read current v2 content.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Choosing a passphrase</ThemedText>
          <ThemedText style={styles.body}>
            scrypt makes each password guess more expensive; it does not turn a predictable phrase into a private one.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Prefer a long, unique phrase made from several uncommon words, or use a password manager to generate one.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Never reuse an important password or choose a phrase someone could associate with you.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • A short or common phrase is effectively a shared key: anyone who guesses it can read and edit that note.
          </ThemedText>
          <ThemedText style={styles.body}>
            Public or intentionally shared notes can use simple titles. That is a sharing choice, not a privacy guarantee.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Legacy note recovery</ThemedText>
          <ThemedText style={styles.body}>
            Older notes use the pre-v2 format. Recovery exists to migrate them, not to extend the old design indefinitely.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • The recovery request uses the old SHA-256 lookup hash through a separate, rate-limited endpoint. That lookup is weaker than v2, especially for weak phrases.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • The updated client receives the old encrypted content, decrypts it locally, and imports a new v2 copy using the same passphrase.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Images are recovered too. The old record remains intact, and the client does not continue writing to the legacy API.
          </ThemedText>
          <ThemedText style={styles.body}>
            The backend caps legacy recovery at March 31, 2027; it may be configured to close earlier. Migrate important legacy notes before then.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Limits worth knowing</ThemedText>
          <ThemedText style={styles.bullet}>
            • There is no password reset. If the passphrase is lost, the note cannot be recovered.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • A compromised device, browser, or deliberately modified client can read content while you are using it.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Anyone who knows the passphrase can read or edit the note, and manage its attached image through the available client actions. End-to-end encryption does not change that sharing model.
          </ThemedText>
          <ThemedText style={styles.bullet}>
            • Encryption protects content from server-side decryption; it does not hide all metadata or guarantee that the service will always be available.
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
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    marginBottom: 18,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.62,
  },
  section: {
    gap: 8,
    marginTop: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    opacity: 0.78,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 23,
    opacity: 0.78,
  },
});
