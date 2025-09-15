import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ImageAttachmentSection from '@/components/ui/image-attachment-section';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const [passphrase, setPassphrase] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [darkModeUIOnly, setDarkModeUIOnly] = useState(false); // UI-only placeholder; does not change app theme
  const iconColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.root}>
      {/* Main vertical layout: 15% input, 75% note, 10% image */}
      <ThemedView style={styles.bodyColumn}> 
        {/* Passphrase input with underline (15%) */}
        <ThemedView style={styles.inputFlex}>
          {/* Controls aligned to the right: show/hide phrase + dark mode (UI-only) */}
          <View style={styles.controlsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPhrase ? 'Hide passphrase' : 'Show passphrase'}
              onPress={() => setShowPhrase((v) => !v)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <IconSymbol name={showPhrase ? 'eye.slash.fill' : 'eye.fill'} size={20} color={iconColor} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle dark mode (UI only)"
              onPress={() => setDarkModeUIOnly((v) => !v)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <IconSymbol name={darkModeUIOnly ? 'moon.fill' : 'sun.max.fill'} size={20} color={iconColor} />
            </Pressable>
          </View>

          <TextInput
          value={passphrase}
          onChangeText={setPassphrase}
          placeholder="Enter passphrase"
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!showPhrase}
          autoCorrect={false}
          autoCapitalize="none"
          textContentType="password"
          autoComplete="off"
          style={styles.textInput}
        />
          <ThemedText lightColor="#A0A0A0" darkColor="#A0A0A0" style={styles.charCount}>
            {`${passphrase.length} chars`}
          </ThemedText>
        </ThemedView>

        {/* Welcome + Note Text Area (75%) */}
        <ThemedView style={styles.noteSection}>
          {/* The note area fills the screen visually; same bg as surrounding, no borders */}
          <TextInput
            value={noteContent}
            onChangeText={setNoteContent}
            placeholder={
              noteContent.length === 0
                ? 'Welcome to Secret Notes!\n\nThis is your private, zero-knowledge vault. Enter a passphrase above to load or create a secure note.'
                : undefined
            }
            editable
            multiline
            scrollEnabled
            style={styles.noteArea}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </ThemedView>

        {/* Image thumbnail preview (UI-only) 10% at bottom */}
        <ThemedView style={styles.imageFlex}>
          <ImageAttachmentSection
            mode="preview"
            appearance="plain"
            fileName="placeholder.png"
            fileSize="128 KB"
            thumbnailUri="https://placehold.co/96x96.png"
          />
        </ThemedView>
      </ThemedView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 32,
    gap: 16,
  },
  bodyColumn: {
    flex: 1,
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputFlex: {
    flex: 15,
    justifyContent: 'flex-end',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 8,
  },
  iconBtn: {
    padding: 4,
  },
  textInput: {
    color: 'black', // actual input text color as specified
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0', // underline effect
    fontSize: 16,
  },
  charCount: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 4,
  },
  noteSection: {
    flex: 75,
    marginBottom: 8,
  },
  noteArea: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    color: 'black',
    // No borders; blend with background
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },
  imageFlex: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});
