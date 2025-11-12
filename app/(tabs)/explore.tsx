import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { router } from 'expo-router';

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

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>When is this useful?</ThemedText>
        <ThemedText style={styles.bullet}>• Capture thoughts you don’t want tied to an account or synced profile.</ThemedText>
        <ThemedText style={styles.bullet}>• Share a simple passphrase so two people see the same private space instantly.</ThemedText>
        <ThemedText style={styles.bullet}>• Spin up “burner” spaces for plans, drafts, or photos you can walk away from by forgetting the phrase.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>What makes it different?</ThemedText>
        <ThemedText style={styles.bullet}>• Notes aren’t public URLs: only this site/app shows in history, not what you wrote.</ThemedText>
        <ThemedText style={styles.bullet}>• Your passphrase is the key: change it, and you’re in a completely different space.</ThemedText>
        <ThemedText style={styles.bullet}>• One passphrase = one focused note + one image: clean, minimal, easy to remember.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>How it works</ThemedText>
        <ThemedText style={styles.bullet}>• Type a passphrase (3+ characters) to open its note.</ThemedText>
        <ThemedText style={styles.bullet}>• After you pause, the app fetches or creates that note in the background.</ThemedText>
        <ThemedText style={styles.bullet}>• Your changes auto-save after short pauses—no manual sync dance.</ThemedText>
        <ThemedText style={styles.bullet}>• Add one image to keep an important screenshot, document, or photo with the note.</ThemedText>
       </ThemedView>
 
       <ThemedView style={styles.section}>
         <ThemedText style={styles.sectionTitle}>Why it’s private by design</ThemedText>
         <ThemedText style={styles.bullet}>Built so even we can’t read your private notes.</ThemedText>
         <ThemedText style={styles.bullet}>• AES-256-GCM encryption for notes and images before they hit the database.</ThemedText>
         <ThemedText style={styles.bullet}>• Only a SHA-256 hash of your passphrase is stored—never the passphrase itself.</ThemedText>
         <ThemedText style={styles.bullet}>• No account, profile, or feed to inspect: without your exact passphrase, your private note stays unreadable.</ThemedText>
         <ThemedText style={styles.bullet}>• Strong, unique passphrases = private vaults; obvious phrases behave like open, shared boards.</ThemedText>
       </ThemedView>
 
       <ThemedView style={styles.section}>
         <ThemedText
           style={styles.link}
           onPress={() => router.push('/facts-for-nerds')}
         >
           Facts for Nerds →
         </ThemedText>
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
});
