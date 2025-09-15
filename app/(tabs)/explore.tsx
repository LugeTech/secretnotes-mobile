import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={220}
          color="#808080"
          name="questionmark.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Tips
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.tipsBlock}>
        <ThemedText style={styles.tipsHeader}>Tips</ThemedText>
        <ThemedText style={styles.tipText}>• No accounts or storage of your passphrase</ThemedText>
        <ThemedText style={styles.tipText}>• Edits auto-save after a short pause</ThemedText>
        <ThemedText style={styles.tipText}>• Upload an image once your note is loaded</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tipsBlock: {
    gap: 6,
    marginTop: 12,
  },
  tipsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
});
