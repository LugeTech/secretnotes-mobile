import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, Pressable, Platform, ActionSheetIOS, Alert, KeyboardAvoidingView } from 'react-native';
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
import { InfoModal } from '@/components/ui/info-modal';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor(
    { light: '#F0F2F5', dark: '#1E1F20' },
    'background'
  );
  const errorBannerBackground = useThemeColor(
    { light: '#FFEBEE', dark: '#3B1212' },
    'background'
  );
  const errorTextColor = useThemeColor(
    { light: '#D32F2F', dark: '#FFCDD2' },
    'text'
  );
  const progressBannerBackground = useThemeColor(
    { light: '#E3F2FD', dark: '#10273C' },
    'background'
  );
  const progressTextColor = useThemeColor(
    { light: '#1976D2', dark: '#90CAF9' },
    'text'
  );
  const blurButtonBackground = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.08)' },
    'background'
  );
  const blurButtonBorderColor = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.16)' },
    'background'
  );
  const tintColor = useThemeColor({}, 'tint');
  const [isThumbnailBlurred, setIsThumbnailBlurred] = useState(true);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

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
  const { loadImage, pickAndUploadImage, takeAndUploadPhoto, compressionProgress } = useImage();

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

  const handleAddOrReplaceImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takeAndUploadPhoto();
          } else if (buttonIndex === 2) {
            pickAndUploadImage();
          }
        }
      );
    } else if (Platform.OS === 'android') {
      Alert.alert('Add Image', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takeAndUploadPhoto },
        { text: 'Choose from Library', onPress: pickAndUploadImage },
      ]);
    } else {
      pickAndUploadImage();
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

  useEffect(() => {
    if (note?.hasImage && imageUri) {
      setIsThumbnailBlurred(true);
    }
  }, [note?.id, imageUri, note?.hasImage, setIsThumbnailBlurred]);

  return (
    <ThemedView style={[styles.root, {
      paddingTop: insets.top + 16,
      paddingBottom: insets.bottom + 8,
      paddingLeft: Math.max(insets.left, 16),
      paddingRight: Math.max(insets.right, 16),
    }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        enabled={Platform.OS !== 'web'}
      >
        {/* Error banner */}
        {error && (
          <ThemedView style={[styles.errorBanner, { backgroundColor: errorBannerBackground }]}>
            <ThemedText style={[styles.errorText, { color: errorTextColor }]}>{error}</ThemedText>
            <Pressable
              onPress={() => setError(null)}
              hitSlop={8}
              style={styles.errorClose}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={errorTextColor} />
            </Pressable>
          </ThemedView>
        )}

        {/* Compression progress banner */}
        {compressionProgress && (
          <ThemedView style={[styles.progressBanner, { backgroundColor: progressBannerBackground }]}>
            <ActivityIndicator size="small" color={progressTextColor} />
            <ThemedText style={[styles.progressText, { color: progressTextColor }]}>
              {compressionProgress}
            </ThemedText>
          </ThemedView>
        )}
        
        {/* Header: Passphrase Input */}
        <View style={styles.headerSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={passphrase}
              onChangeText={setPassphrase}
              placeholder="Enter passphrase"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!passphraseVisible}
              autoCorrect={false}
              autoCapitalize="none"
              textContentType="password"
              autoComplete="off"
              style={[
                styles.textInput,
                {
                  color: textColor,
                  backgroundColor: inputBackgroundColor,
                },
              ]}
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
                  <IconSymbol name="xmark.circle.fill" size={18} color={iconColor} />
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={passphraseVisible ? 'Hide passphrase' : 'Show passphrase'}
                onPress={() => setPassphraseVisible(!passphraseVisible)}
                hitSlop={8}
                style={styles.inputIcon}
              >
                <IconSymbol name={passphraseVisible ? 'eye.slash.fill' : 'eye.fill'} size={18} color={iconColor} />
              </Pressable>
            </View>
          </View>
          
          <View style={styles.inputFooter}>
            <View style={styles.passphraseInfo}>
              <ThemedText style={styles.charCount}>
                {passphrase.length > 0 ? `${passphrase.length} chars` : 'Min 3 chars'}
              </ThemedText>
              {passphraseStrength && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Passphrase strength information"
                  onPress={() => {
                    console.log('Strength badge clicked!');
                    setInfoModal({
                      visible: true,
                      title: 'Passphrase Strength',
                      message: 'Your passphrase strength is determined by its length:\n\n• Weak: Less than 6 characters\n• Medium: 6-11 characters\n• Strong: 12 or more characters\n\nLonger passphrases make your note more secure and harder to guess.',
                    });
                  }}
                  hitSlop={8}
                  style={styles.strengthIndicator}
                >
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
                </Pressable>
              )}
              {isPublicNote && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Public note warning"
                  onPress={() => {
                    console.log('Public badge clicked!');
                    setInfoModal({
                      visible: true,
                      title: '⚠️ Public Note Warning',
                      message: 'Your passphrase uses common words that are easy to guess. Anyone who tries common phrases like "hello", "test", or "password" could access this note.\n\nFor better privacy, use a unique passphrase with uncommon words, numbers, or special characters.',
                    });
                  }}
                  hitSlop={8}
                  style={styles.publicWarningContainer}
                >
                  <ThemedText style={styles.publicWarning}>⚠️ Public</ThemedText>
                </Pressable>
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
        </View>

        {/* Body: Note Content */}
        <View style={styles.noteSection}>
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
              placeholderTextColor="#9CA3AF"
              editable={passphrase.length >= 3}
              multiline
              scrollEnabled
              style={[styles.noteArea, { color: textColor }]}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
            />
          )}
        </View>

        {/* Footer: Image Attachment */}
        {passphrase.length >= 3 && !isLoadingNote && (
          <View style={styles.footerSection}>
            <ThemedView style={styles.imageContainer}>
              {note && note.hasImage && imageUri ? (
                <ImageAttachmentSection
                  mode="preview"
                  appearance="plain"
                  fileName={isThumbnailBlurred ? 'Image hidden' : 'Image'}
                  fileSize={imageMetadata?.fileSize ? formatFileSize(imageMetadata.fileSize) : undefined}
                  thumbnailUri={imageUri}
                  onPress={handleImagePress}
                  onReplace={handleAddOrReplaceImage}
                  isLoading={isLoadingImage || isUploadingImage}
                  blur={isThumbnailBlurred}
                  blurRadius={20}
                />
              ) : note ? (
                <ImageAttachmentSection
                  mode="empty"
                  appearance="dashed"
                  onPress={handleAddOrReplaceImage}
                  isLoading={isLoadingImage || isUploadingImage}
                  style={styles.emptyImageSection}
                />
              ) : null}

              {/* Blur toggle button - absolute positioned within image container when preview is shown */}
              {note && note.hasImage && imageUri && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isThumbnailBlurred ? 'Show thumbnail' : 'Hide thumbnail'}
                  onPress={() => setIsThumbnailBlurred(!isThumbnailBlurred)}
                  hitSlop={8}
                  style={[
                    styles.blurToggleBtn,
                    {
                      backgroundColor: blurButtonBackground,
                      borderColor: blurButtonBorderColor,
                    },
                  ]}
                >
                  <IconSymbol
                    name={isThumbnailBlurred ? 'eye.slash.fill' : 'eye.fill'}
                    size={16}
                    color={isThumbnailBlurred ? tintColor : iconColor}
                  />
                </Pressable>
              )}
            </ThemedView>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={isImageViewerOpen}
        imageUri={imageUri}
        fileName="Image"
        onClose={handleViewerClose}
      />

      {/* Info Modal */}
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, title: '', message: '' })}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    gap: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerSection: {
    flexGrow: 0,
    gap: 8,
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIconsRow: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputIcon: {
    padding: 4,
  },
  textInput: {
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 80,
    fontSize: 16,
    fontWeight: '500',
    borderRadius: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  passphraseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    cursor: 'pointer' as any,
  },
  strengthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  publicWarningContainer: {
    cursor: 'pointer' as any,
  },
  publicWarning: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  saveSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteSection: {
    flex: 1,
    minHeight: 100,
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
    padding: 0,
    fontSize: 17,
    lineHeight: 26,
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },
  footerSection: {
    flexGrow: 0,
    minHeight: 60,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  emptyImageSection: {
    minHeight: 80,
    borderRadius: 12,
  },
  blurToggleBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
