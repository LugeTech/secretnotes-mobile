import { Image } from 'expo-image';
import { StyleSheet, ScrollView } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { router } from 'expo-router';
import { SeoHead } from '@/components/seo-head';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead 
        title="About & Use Cases" 
        description="Use Secret Notes for dead drops, puzzles, anonymous chat, public ads, or private storage. Your title determines visibility."
        url="https://secretnotes.app/about"
        keywords="dead drop, puzzle, riddle, anonymous chat, public board, pastebin, secure storage, encrypted note, private vault"
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
            }}>
            About
          </ThemedText>
        </ThemedView>

      <ThemedView 
        style={styles.section}
        lightColor="rgba(230, 220, 240, 0.5)"
        darkColor="rgba(100, 90, 120, 0.2)"
      >
        <ThemedText style={styles.sectionTitle}>When is this useful?</ThemedText>
        <ThemedText style={styles.bullet}>• Capture thoughts you don’t want tied to an account or synced profile.</ThemedText>
        <ThemedText style={styles.bullet}>• Share a simple title so two people see the same private space instantly.</ThemedText>
        <ThemedText style={styles.bullet}>• Spin up “burner” spaces for plans, drafts, or photos you can walk away from by forgetting the title.</ThemedText>
      </ThemedView>

      <ThemedView 
        style={styles.section}
        lightColor="rgba(220, 240, 230, 0.5)"
        darkColor="rgba(80, 110, 100, 0.2)"
      >
        <ThemedText style={styles.sectionTitle}>What makes it different?</ThemedText>
        <ThemedText style={styles.bullet}>• Notes aren’t public URLs: only this site/app shows in history, not what you wrote.</ThemedText>
        <ThemedText style={styles.bullet}>• Your title is the key: change it, and you’re in a completely different space.</ThemedText>
        <ThemedText style={styles.bullet}>• One title = one focused note + one image: clean, minimal, easy to remember.</ThemedText>
      </ThemedView>

      <ThemedView 
        style={styles.section}
        lightColor="rgba(245, 230, 220, 0.5)"
        darkColor="rgba(120, 100, 90, 0.2)"
      >
        <ThemedText style={styles.sectionTitle}>How it works</ThemedText>
        <ThemedText style={styles.bullet}>• Type a title (3+ characters) to open its note.</ThemedText>
        <ThemedText style={styles.bullet}>• After you pause, the app fetches or creates that note in the background.</ThemedText>
        <ThemedText style={styles.bullet}>• Your changes auto-save after short pauses—no manual sync dance.</ThemedText>
        <ThemedText style={styles.bullet}>• Add one image to keep an important screenshot, document, or photo with the note.</ThemedText>
       </ThemedView>
 
       <ThemedView 
         style={styles.section}
         lightColor="rgba(220, 230, 245, 0.5)"
         darkColor="rgba(80, 90, 120, 0.2)"
       >
         <ThemedText style={styles.sectionTitle}>Why it’s private by design</ThemedText>
         <ThemedText style={styles.bullet}>Built so even we can’t read your private notes.</ThemedText>
         <ThemedText style={styles.bullet}>• AES-256-GCM encryption for notes and images before they hit the database.</ThemedText>
         <ThemedText style={styles.bullet}>• Only a SHA-256 hash of your title is stored—never the title itself.</ThemedText>
         <ThemedText style={styles.bullet}>• No account, profile, or feed to inspect: without your exact title, your private note stays unreadable.</ThemedText>
         <ThemedText style={styles.bullet}>• Strong, unique titles = private vaults; obvious titles behave like open, shared boards.</ThemedText>
       </ThemedView>
 
       <ThemedView 
         style={styles.section}
         lightColor="rgba(240, 220, 230, 0.5)"
         darkColor="rgba(120, 90, 100, 0.2)"
       >
         <ThemedText
           style={styles.link}
           onPress={() => router.push('/facts-for-nerds')}
         >
           Facts for Nerds →
         </ThemedText>
       </ThemedView>

       <ThemedView style={styles.footer}>
         <ThemedText style={styles.madeBy}>
           Made by <ExternalLink href="https://www.lugetech.com"><ThemedText style={styles.lugetech}>Lugetech</ThemedText></ExternalLink>
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
   link: {
     fontSize: 16,
     fontWeight: '600',
     textDecorationLine: 'underline',
   },
   footer: {
     marginTop: 24,
     marginBottom: 20,
     alignItems: 'center',
   },
   madeBy: {
     fontSize: 14,
     opacity: 0.7,
   },
   lugetech: {
     fontSize: 14,
     fontWeight: '600',
     textDecorationLine: 'underline',
   },
});
