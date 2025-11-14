import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { WelcomeScreen } from '@/components/welcome-screen';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({}, 'text');
  const [isThumbnailBlurred, setIsThumbnailBlurred] = useState(true);

  const {
    passphrase,
    setPassphrase,
    passphraseVisible,
    setPassphraseVisible,
    noteContent,
    setNoteContent,
    note,
    imageUri,
    setImageUri,
    imageMetadata,
    setImageMetadata,
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
  const { loadImage, pickAndUploadImage, compressionProgress } = useImage();

  const DEFAULT_WELCOME_MESSAGE = 'Welcome to your new secure note!';
  const effectiveNoteContent =
    noteContent === DEFAULT_WELCOME_MESSAGE ? '' : noteContent;

  useAutoSave(effectiveNoteContent, passphrase, updateNote, note !== null);

  const handleImagePress = () => {
    setIsThumbnailBlurred(false); // Clear blur when opening viewer
    setIsImageViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsImageViewerOpen(false);
    setIsThumbnailBlurred(true); // Restore blur when closing viewer
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

  // Clear any previously loaded image when switching passphrase or notes
  useEffect(() => {
    setImageUri(null);
    setImageMetadata(null);
    setIsImageViewerOpen(false);
  }, [passphrase, setImageUri, setImageMetadata, setIsImageViewerOpen]);

  useEffect(() => {
    if (note?.id) {
      setImageUri(null);
      setImageMetadata(null);
      setIsImageViewerOpen(false);
    }
  }, [note?.id, setImageUri, setImageMetadata, setIsImageViewerOpen]);

  useEffect(() => {
    if (note?.hasImage && !imageUri) {
      loadImage();
    }
  }, [note?.hasImage, imageUri, loadImage]);

  return (
    <ThemedView style={[styles.root, {
      paddingTop: insets.top + 32,
      paddingBottom: insets.bottom + 8,
      paddingLeft: Math.max(insets.left, 16),
      paddingRight: Math.max(insets.right, 16),
    }]}>
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

      {/* Compression progress banner */}
      {compressionProgress && (
        <ThemedView style={styles.progressBanner}>
          <ActivityIndicator size="small" color="#1976D2" />
          <ThemedText style={styles.progressText}>{compressionProgress}</ThemedText>
        </ThemedView>
      )}
      
      {/* Main vertical layout: 15% input, 75% note, 10% image */}
      <ThemedView style={styles.bodyColumn}> 
        {/* Passphrase input with underline (15%) */}
        <ThemedView style={styles.inputFlex}>
          {/* Passphrase input container with icons inside */}
          <View style={styles.inputContainer}>
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
            {/* Icons positioned inside the input */}
            <View style={styles.inputIconsRow}>
              {passphrase.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear passphrase"
                  onPress={() => setPassphrase('')}
                  hitSlop={8}
                  style={styles.inputIcon}
                >
                  <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={passphraseVisible ? 'Hide passphrase' : 'Show passphrase'}
                onPress={() => setPassphraseVisible(!passphraseVisible)}
                hitSlop={8}
                style={styles.inputIcon}
              >
                <IconSymbol name={passphraseVisible ? 'eye.slash.fill' : 'eye.fill'} size={20} color={iconColor} />
              </Pressable>
            </View>
          </View>
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
            </View>
          </View>
        </ThemedView>

        {/* Welcome + Note Text Area (75%) */}
        <ThemedView style={styles.noteSection}>
          {passphrase.length < 3 ? (
            <WelcomeScreen />
          ) : isLoadingNote ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <ThemedText style={styles.loadingText}>Loading note...</ThemedText>
            </View>
          ) : (
            <TextInput
              value={effectiveNoteContent}
              onChangeText={setNoteContent}
              placeholder="Start typing your note..."
              editable={passphrase.length >= 3}
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
          <ThemedView style={styles.imageContainer}>
            {note && note.hasImage && imageUri ? (
              <ImageAttachmentSection
                mode="preview"
                appearance="plain"
                fileName={imageMetadata?.fileName || 'image.jpg'}
                fileSize={imageMetadata?.fileSize ? formatFileSize(imageMetadata.fileSize) : undefined}
                thumbnailUri={imageUri}
                onPress={handleImagePress}
                onReplace={pickAndUploadImage}
                isLoading={isLoadingImage || isUploadingImage}
                blur={isThumbnailBlurred}
                blurRadius={8}
              />
            ) : note ? (
              <ImageAttachmentSection
                mode="empty"
                appearance="plain"
                onPress={pickAndUploadImage}
                isLoading={isLoadingImage || isUploadingImage}
              />
            ) : null}

            {/* Blur toggle button - bottom right */}
            {note && note.hasImage && imageUri && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isThumbnailBlurred ? 'Show thumbnail' : 'Hide thumbnail'}
                onPress={() => setIsThumbnailBlurred(!isThumbnailBlurred)}
                hitSlop={8}
                style={styles.blurToggleBtn}
              >
                <IconSymbol
                  name={isThumbnailBlurred ? 'eye.slash.fill' : 'eye.fill'}
                  size={18}
                  color={isThumbnailBlurred ? '#1976D2' : iconColor}
                />
              </Pressable>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={isImageViewerOpen}
        imageUri={imageUri}
        fileName={imageMetadata?.fileName}
        onClose={handleViewerClose}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  progressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  progressText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  bodyColumn: {
    flex: 1,
    gap: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputFlex: {
    flex: 10,
    justifyContent: 'flex-end',
  },
  inputIconsRow: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputIcon: {
    padding: 4,
  },
  textInput: {
    color: 'black',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 70,
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
  noteSection: {
    flex: 70,
    marginBottom: 4,
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
    flex: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  blurToggleBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
