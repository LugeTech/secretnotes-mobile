import { Fonts } from '@/constants/theme';
import { useEntranceAnimation } from '@/hooks/use-entrance-animation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

const steps = [
  ['01', 'Choose a private phrase', 'Use something long and difficult to guess. It becomes your key.'],
  ['02', 'Write without an account', 'Your note is encrypted on this device before it is saved.'],
  ['03', 'Return from anywhere', 'Enter the exact same phrase to decrypt your note again.'],
] as const;

export function WelcomeScreen() {
  const router = useRouter();
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const tintColor = useThemeColor({}, 'tint') as string;
  const surfaceColor = useThemeColor(
    { light: 'rgba(255, 255, 255, 0.70)', dark: 'rgba(27, 30, 36, 0.72)' },
    'background'
  ) as string;
  const borderColor = useThemeColor(
    { light: 'rgba(44, 55, 78, 0.10)', dark: 'rgba(255, 255, 255, 0.10)' },
    'background'
  ) as string;
  const animations = useEntranceAnimation(4, 100);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, animations[0]]}>
        <View style={[styles.privacyBadge, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
          <ThemedText style={styles.privacyBadgeText}>Private by design</ThemedText>
        </View>
        <ThemedText style={[styles.heading, { fontFamily: Fonts.rounded }]}>
          Your words stay yours.
        </ThemedText>
        <ThemedText style={styles.introText}>
          No account, no profile, no readable copy on our server. Your phrase unlocks an encrypted note only on your device.
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.steps, animations[1]]}>
        {steps.map(([number, title, copy]) => (
          <View key={number} style={[styles.step, { borderColor }]}>
            <ThemedText style={[styles.stepNumber, { color: tintColor, fontFamily: Fonts.mono }]}>
              {number}
            </ThemedText>
            <View style={styles.stepCopy}>
              <ThemedText style={styles.stepTitle}>{title}</ThemedText>
              <ThemedText style={styles.stepDescription}>{copy}</ThemedText>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.securityNote,
          { backgroundColor: surfaceColor, borderColor },
          animations[2],
        ]}
      >
        <View style={[styles.securityIcon, { backgroundColor: tintColor }]}>
          <IconSymbol name="lock.fill" size={15} color="#FFFFFF" />
        </View>
        <View style={styles.securityCopy}>
          <ThemedText style={styles.securityTitle}>There is no password reset</ThemedText>
          <ThemedText style={styles.securityDescription}>
            We cannot see or recover your phrase. Save it somewhere safe.
          </ThemedText>
        </View>
      </Animated.View>

      {!isNativeMobile && (
        <Animated.View style={[styles.linksSection, animations[3]]}>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/COMING_SOON')}
            style={({ pressed }) => [styles.storeLink, { opacity: pressed ? 0.55 : 0.75 }]}
          >
            <ThemedText style={styles.storeLinkText}>iOS app</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/COMING_SOON')}
            style={({ pressed }) => [styles.storeLink, { opacity: pressed ? 0.55 : 0.75 }]}
          >
            <ThemedText style={styles.storeLinkText}>Android app</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingTop: 28,
    paddingBottom: 18,
    gap: 28,
  },
  hero: {
    maxWidth: 590,
    gap: 14,
  },
  privacyBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  privacyBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.66,
  },
  heading: {
    maxWidth: 560,
    fontSize: 42,
    lineHeight: 45,
    fontWeight: '700',
    letterSpacing: -1.6,
  },
  introText: {
    maxWidth: 570,
    fontSize: 16,
    lineHeight: 25,
    opacity: 0.66,
  },
  steps: {
    gap: 0,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  stepNumber: {
    width: 28,
    fontSize: 11,
    lineHeight: 20,
    fontWeight: '700',
  },
  stepCopy: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  stepDescription: {
    maxWidth: 520,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.58,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
  },
  securityIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  securityCopy: {
    flex: 1,
    gap: 1,
  },
  securityTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  securityDescription: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.58,
  },
  linksSection: {
    flexDirection: 'row',
    gap: 24,
  },
  storeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 40,
  },
  storeLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
