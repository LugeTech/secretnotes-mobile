import { useEntranceAnimation } from "@/hooks/use-entrance-animation";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from "expo-linear-gradient";
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
          <IconSymbol name="lock.fill" size={48} color={tintColor} />
          <ThemedText style={styles.heading} type="title">
            SecretNote
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Your secrets, your way.
          </ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          <Animated.View style={[styles.card, { backgroundColor: cardBg, opacity: animations[1].opacity, transform: animations[1].transform }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="globe" size={24} color={tintColor} />
            </View>
            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardTitle}>Public Boards</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Simple titles for sharing jokes, ads, or public chats.
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View style={[styles.card, { backgroundColor: cardBg, opacity: animations[2].opacity, transform: animations[2].transform }]}>
            <View style={[styles.iconCircle, { backgroundColor: "#8b5cf620" }]}>
              <IconSymbol name="shield.fill" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardTitle}>Private Vaults</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Unique titles for secure, encrypted notes only you can open.
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View style={[styles.card, { backgroundColor: cardBg, opacity: animations[3].opacity, transform: animations[3].transform }]}>
            <View style={[styles.iconCircle, { backgroundColor: "#10b98120" }]}>
              <IconSymbol name="photo.fill" size={24} color="#10b981" />
            </View>
            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardTitle}>Instant Media</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Attach one secure image to every note you create.
              </ThemedText>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.hintContainer, { opacity: animations[4].opacity, transform: animations[4].transform }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ThemedText style={styles.hint}>
              👆 Enter a title above to get started
            </ThemedText>
          </Animated.View>
        </Animated.View>

        {!isNativeMobile && (
          <View style={styles.linksSection}>
            <Pressable onPress={() => router.push("/COMING_SOON")} style={styles.gradientButtonContainer}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <ThemedText style={styles.linkText}>📱 App Store</ThemedText>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.push("/COMING_SOON")} style={styles.gradientButtonContainer}>
              <LinearGradient
                colors={['#10b981', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <ThemedText style={styles.linkText}>🤖 Play Store</ThemedText>
              </LinearGradient>
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
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      },
    }),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
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
  gradientButtonContainer: {
    flex: 1,
    maxWidth: 180,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
