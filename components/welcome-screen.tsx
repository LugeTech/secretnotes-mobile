import { useEntranceAnimation } from "@/hooks/use-entrance-animation";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

export function WelcomeScreen() {
  const router = useRouter();
  const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
  const tintColor = useThemeColor({}, "tint") as string;
  const cardBg = useThemeColor({ light: "#ffffff", dark: "#1E2021" }, "background") as string;
  const shadowColor = useThemeColor({ light: "#000000", dark: "#000000" }, "background") as string;

  const animations = useEntranceAnimation(5, 150);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: animations[0].opacity, transform: animations[0].transform }]}>
        <View style={styles.headerContainer}>
          <Image
            source={
              Platform.OS === "web"
                ? { uri: "/og-image.webp" }
                : require("@/assets/images/icon.png")
            }
            style={styles.headerLogo}
            contentFit="contain"
          />
          <ThemedText style={styles.heading} type="title">
            Secret Notez
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Instant, encrypted notes. No signup.
          </ThemedText>
        </View>

        <Animated.View style={[styles.introContainer, { opacity: animations[1].opacity, transform: animations[1].transform }]}>
          <ThemedText style={styles.introText}>
            Just pick a word or phrase and start writing. That's your key — anyone with the same passphrase can see that note.
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.divider, { opacity: animations[2].opacity }]}>
          <ThemedText style={styles.dividerText}>Quick examples</ThemedText>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.View style={[styles.examplesContainer, { opacity: animations[3].opacity, transform: animations[3].transform }]}>
          <View style={styles.exampleItem}>
            <ThemedText style={styles.examplePassphrase}>"hello"</ThemedText>
            <ThemedText style={styles.exampleDescription}>
              A quick public note anyone can read
            </ThemedText>
          </View>

          <View style={styles.exampleItem}>
            <ThemedText style={styles.examplePassphrase}>"pizza-friday"</ThemedText>
            <ThemedText style={styles.exampleDescription}>
              Share lunch plans with your team
            </ThemedText>
          </View>

          <View style={styles.exampleItem}>
            <ThemedText style={styles.examplePassphrase}>"my-secret-journal-2024"</ThemedText>
            <ThemedText style={styles.exampleDescription}>
              Private thoughts, encrypted and secure
            </ThemedText>
          </View>

          <View style={styles.exampleItem}>
            <ThemedText style={styles.examplePassphrase}>"family-photos"</ThemedText>
            <ThemedText style={styles.exampleDescription}>
              Share pictures with your family
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View style={[styles.hintContainer, { opacity: animations[4].opacity, transform: animations[4].transform }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ThemedText style={styles.hint}>
              👆 Enter a title above to get started
            </ThemedText>
          </Animated.View>
        </Animated.View>

        {!isNativeMobile && (
          <View style={styles.linksSection}>
            <Pressable onPress={() => router.push("/COMING_SOON")} style={[styles.storeButton, { borderColor: tintColor }]}>
              <IconSymbol name="chevron.right" size={20} color={tintColor} />
              <ThemedText style={[styles.linkText, { color: tintColor }]}>Download for iOS</ThemedText>
            </Pressable>

            <Pressable onPress={() => router.push("/COMING_SOON")} style={[styles.storeButton, { borderColor: tintColor }]}>
              <IconSymbol name="chevron.right" size={20} color={tintColor} />
              <ThemedText style={[styles.linkText, { color: tintColor }]}>Download for Android</ThemedText>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: 'center',
    gap: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    fontWeight: '500',
  },
  introContainer: {
    paddingHorizontal: 8,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  divider: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  dividerText: {
    fontSize: 13,
    opacity: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dividerLine: {
    height: 1,
    width: '100%',
    opacity: 0.1,
  },
  examplesContainer: {
    gap: 16,
    paddingHorizontal: 8,
  },
  exampleItem: {
    gap: 4,
  },
  examplePassphrase: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  exampleDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    paddingLeft: 4,
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
    fontWeight: '600',
  },
  linksSection: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  storeButton: {
    flex: 1,
    maxWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
