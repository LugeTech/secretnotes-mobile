import React from "react";
import { StyleSheet, View, Linking, Pressable, Platform } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function WelcomeScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
    });
  };

  const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.heading} selectable>
          Welcome to SecretNote! 🔒
        </ThemedText>

        <ThemedText style={styles.paragraph} selectable>
          Now you can add or replace an image with every note!
        </ThemedText>

        <ThemedText style={styles.paragraph} selectable>
          Use a simple, fun passphrase for a public board others might stumble
          into. Use a long, unique passphrase for a private, encrypted note only
          you can open.
        </ThemedText>
        <ThemedText style={styles.hint} selectable>
          👆 Enter a passphrase above (min 3 characters) to get started
        </ThemedText>

        {!isNativeMobile && (
          <View style={styles.linksSection}>
            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={() => handleLinkPress("COMING_SOON")}
                style={styles.linkButton}
              >
                <ThemedText style={styles.linkText}>
                  📱 iOS: Download on App Store
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleLinkPress("COMING_SOON")}
                style={styles.linkButton}
              >
                <ThemedText style={styles.linkText}>
                  🤖 Android: Get it on Google Play
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 600, // Limit width on large screens
    gap: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    textAlign: "center",
  },
  linksSection: {
    marginTop: 8,
    gap: 8,
  },
  buttonsContainer: {
    gap: 8,
    alignItems: "center",
  },
  linkButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    width: "100%",
    maxWidth: 400, // Prevent stretching on large screens
  },
  linkText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 16,
    fontStyle: "italic",
  },
});
