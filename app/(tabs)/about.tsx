import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { SeoHead } from '@/components/seo-head';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead
        title="About Secret Notez"
        description="Learn how Secret Notez handles private notes, shared notes, encrypted images, autosave, and realtime sync without accounts."
        url="https://secretnotez.com/about"
        keywords="encrypted notes, private notes, secure notes, shared notes, encrypted images, client-side encryption, no signup"
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
            About Secret Notez
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            A small, account-free space for notes you control.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What it is</ThemedText>
          <ThemedText style={styles.body}>
            Secret Notez opens one note from one exact passphrase. There is no account, profile, or inbox to manage.
          </ThemedText>
          <ThemedText style={styles.body}>
            Anyone with the same passphrase can open the same note. Use a common phrase for an intentional shared board; use a long, unique phrase for private writing.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>How it works</ThemedText>
          <ThemedText style={styles.bullet}>1. Enter a passphrase with at least 3 characters.</ThemedText>
          <ThemedText style={styles.bullet}>2. The app derives a lookup token and encryption keys on your device.</ThemedText>
          <ThemedText style={styles.bullet}>3. Existing notes are downloaded as ciphertext and decrypted locally. New notes must be created explicitly.</ThemedText>
          <ThemedText style={styles.bullet}>4. Text auto-saves after you pause. Version checks help protect edits made on another device.</ThemedText>
          <ThemedText style={styles.bullet}>5. You can attach one encrypted image, including its filename and media type.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What stays private</ThemedText>
          <ThemedText style={styles.bullet}>• Your exact passphrase never leaves the current client.</ThemedText>
          <ThemedText style={styles.bullet}>• Note text, images, filenames, and media types are encrypted before upload.</ThemedText>
          <ThemedText style={styles.bullet}>• The server cannot decrypt current v2 notes without the passphrase.</ThemedText>
          <ThemedText style={styles.bullet}>• HTTPS protects the connection while encrypted data travels to the server.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What the server can still see</ThemedText>
          <ThemedText style={styles.bullet}>• A derived lookup request, encrypted payloads, note versions, timestamps, and approximate payload sizes.</ThemedText>
          <ThemedText style={styles.bullet}>• Normal network information such as an IP address and request timing, depending on hosting and logs.</ThemedText>
          <ThemedText style={styles.bullet}>• Whether a note exists and whether it has an encrypted image. It does not receive the readable note content.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Important limits</ThemedText>
          <ThemedText style={styles.bullet}>• There is no password reset. If you lose the passphrase, the current note cannot be recovered.</ThemedText>
          <ThemedText style={styles.bullet}>• Common or reused phrases are easy to guess and should not protect sensitive information.</ThemedText>
          <ThemedText style={styles.bullet}>• A compromised device, browser, or deliberately modified client can see content while you are using it.</ThemedText>
          <ThemedText style={styles.bullet}>• Existing legacy notes have a temporary recovery path. Recovery decrypts on the client and imports a new v2 copy; it does not make the old copy disappear automatically.</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Learn more</ThemedText>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/facts-for-nerds')}
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={styles.link}>Facts for Nerds</ThemedText>
            <IconSymbol name="chevron.right" size={17} color="#6366F1" />
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/autosave-flow')}
            style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={styles.link}>Autosave and realtime updates</ThemedText>
            <IconSymbol name="chevron.right" size={17} color="#6366F1" />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Open source</ThemedText>
          <ThemedText style={styles.body}>Read the client and server code:</ThemedText>
          <ExternalLink href="https://github.com/LugeTech/secretnotes-mobile" style={styles.githubLink}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color="#6366F1" />
            <ThemedText style={styles.githubLinkText}>Frontend and mobile app</ThemedText>
          </ExternalLink>
          <ExternalLink href="https://github.com/ktappdev/secretnotes-go-backend" style={styles.githubLink}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color="#6366F1" />
            <ThemedText style={styles.githubLinkText}>Backend and CLI</ThemedText>
          </ExternalLink>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.madeBy}>
            Made by <ExternalLink href="https://www.lugetech.com"><ThemedText style={styles.lugetech}>LugeTech</ThemedText></ExternalLink>
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
  linkRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  link: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#6366F1',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  githubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
  },
  githubLinkText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 26,
    alignItems: 'center',
  },
  madeBy: {
    fontSize: 14,
    opacity: 0.65,
  },
  lugetech: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
