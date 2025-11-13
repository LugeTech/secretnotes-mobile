import React, { useEffect } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ImageAttachmentSection from '@/components/ui/image-attachment-section';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNoteContext } from '@/components/note/note-provider';
import { useNote } from '@/hooks/use-note';
import { useImage } from '@/hooks/use-image';
import { useAutoSave } from '@/hooks/use-auto-save';
import { SaveIndicator } from '@/components/note/save-indicator';
import { formatFileSize } from '@/utils/format';
import { getPassphraseStrength, isCommonPhrase, getPassphraseColor } from '@/utils/passphrase';
import { ImageViewer } from '@/components/image/image-viewer';

export default function HomeScreen() {
  const iconColor = useThemeColor({}, 'text');
  
  const {
    passphrase,
    setPassphrase,
    passphraseVisible,
    setPassphraseVisible,
    noteContent,
    setNoteContent,
    note,
    imageUri,
    imageMetadata,
    isLoadingNote,
    isSavingNote,
    isLoadingImage,
    isUploadingImage,
    hasUnsavedChanges,
    lastSavedAt,
    error,
    setError,
    isImageViewerOpen,
    setIsImageViewerOpen,
    clearNote,
  } = useNoteContext();

  const { loadNote, updateNote } = useNote();
  const { loadImage, pickAndUploadImage } = useImage();

  useAutoSave(noteContent, passphrase, updateNote, note !== null);

  const handleManualSave = async () => {
    if (hasUnsavedChanges && passphrase.length >= 3) {
      await updateNote(noteContent);
    }
  };

  const passphraseStrength = passphrase.length >= 3 ? getPassphraseStrength(passphrase) : null;
  const isPublicNote = passphrase.length >= 3 && isCommonPhrase(passphrase);

  useEffect(() => {
    if (passphrase.length < 3) {
      clearNote();
      return;
    }

    const handle = setTimeout(() => {
      loadNote();
    }, 500);

    return () => clearTimeout(handle);
  }, [passphrase, loadNote, clearNote]);

  useEffect(() => {
    if (note?.hasImage && !imageUri) {
      loadImage();
    }
  }, [note?.hasImage, imageUri, loadImage]);

  return (
    <ThemedView style={styles.root}>
      {/* Error banner */}
      {error && (
        <ThemedView style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable
            onPress={() => setError(null)}
            hitSlop={8}
            style={styles.errorClose}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color="#D32F2F" />
          </Pressable>
        </ThemedView>
      )}
      
      {/* Main vertical layout: 15% input, 75% note, 10% image */}
      <ThemedView style={styles.bodyColumn}> 
        {/* Passphrase input with underline (15%) */}
        <ThemedView style={styles.inputFlex}>
          {/* Controls aligned to the right: show/hide phrase */}
          <View style={styles.controlsRow}>
            {passphrase.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear passphrase"
                onPress={() => setPassphrase('')}
                hitSlop={8}
                style={styles.iconBtn}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passphraseVisible ? 'Hide passphrase' : 'Show passphrase'}
              onPress={() => setPassphraseVisible(!passphraseVisible)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <IconSymbol name={passphraseVisible ? 'eye.slash.fill' : 'eye.fill'} size={20} color={iconColor} />
            </Pressable>
          </View>

          <TextInput
            value={passphrase}
            onChangeText={setPassphrase}
            placeholder="Enter passphrase (min 3 chars)"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!passphraseVisible}
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="password"
            autoComplete="off"
            style={styles.textInput}
            editable={!isLoadingNote}
          />
          <View style={styles.inputFooter}>
            <View style={styles.passphraseInfo}>
              <ThemedText lightColor="#A0A0A0" darkColor="#A0A0A0" style={styles.charCount}>
                {`${passphrase.length} chars`}
              </ThemedText>
              {passphraseStrength && (
                <View style={styles.strengthIndicator}>
                  <View
                    style={[
                      styles.strengthDot,
                      { backgroundColor: getPassphraseColor(passphraseStrength) }
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.strengthText,
                      { color: getPassphraseColor(passphraseStrength) }
                    ]}
                  >
                    {passphraseStrength}
                  </ThemedText>
                </View>
              )}
              {isPublicNote && (
                <ThemedText style={styles.publicWarning}>⚠️ Public note</ThemedText>
              )}
            </View>
            <View style={styles.saveSection}>
              {note && (
                <SaveIndicator
                  isSaving={isSavingNote}
                  hasUnsavedChanges={hasUnsavedChanges}
                  lastSavedAt={lastSavedAt}
                />
              )}
              {note && hasUnsavedChanges && !isSavingNote && (
                <Pressable
                  onPress={handleManualSave}
                  style={styles.saveButton}
                  hitSlop={8}
                >
                  <ThemedText style={styles.saveButtonText}>Save Now</ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        </ThemedView>

        {/* Welcome + Note Text Area (75%) */}
        <ThemedView style={styles.noteSection}>
          {isLoadingNote ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <ThemedText style={styles.loadingText}>Loading note...</ThemedText>
            </View>
          ) : (
            <TextInput
              value={noteContent}
              onChangeText={setNoteContent}
                placeholder={
                 passphrase.length < 3
                   ? 'Now you can add or replace an image with every note!\n\nUse a simple, fun passphrase for a public board others might stumble into. Use a long, unique passphrase for a private, encrypted note only you can open.\n\nDownload the mobile app:\niOS: https://apps.apple.com/secertnote\nAndroid: https://play.google.com/store/secertnote'
                   : 'Start typing your note...'
               }
              editable={!isSavingNote && passphrase.length >= 3}
              multiline
              scrollEnabled
              style={styles.noteArea}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
            />
          )}
        </ThemedView>

        {/* Image thumbnail preview - 10% at bottom */}
        <ThemedView style={styles.imageFlex}>
          {note && imageUri ? (
            <ImageAttachmentSection
              mode="preview"
              appearance="plain"
              fileName={imageMetadata?.fileName || 'image.jpg'}
              fileSize={imageMetadata?.fileSize ? formatFileSize(imageMetadata.fileSize) : undefined}
              thumbnailUri={imageUri}
              onPress={() => setIsImageViewerOpen(true)}
              onReplace={pickAndUploadImage}
              isLoading={isLoadingImage || isUploadingImage}
            />
          ) : note ? (
            <ImageAttachmentSection
              mode="empty"
              appearance="plain"
              onPress={pickAndUploadImage}
              isLoading={isLoadingImage || isUploadingImage}
            />
          ) : null}
        </ThemedView>
      </ThemedView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={isImageViewerOpen}
        imageUri={imageUri}
        fileName={imageMetadata?.fileName}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 32,
    gap: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    marginRight: 8,
  },
  errorClose: {
    padding: 4,
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
    color: 'black',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  passphraseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  charCount: {
    fontSize: 14,
    marginLeft: 10,
  },
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  publicWarning: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  saveSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noteSection: {
    flex: 75,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  noteArea: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    color: 'black',
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },
  imageFlex: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});
