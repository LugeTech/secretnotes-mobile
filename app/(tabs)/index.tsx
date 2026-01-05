import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageViewer } from '@/components/image/image-viewer';
import { useNoteContext } from '@/components/note/note-provider';
import { SaveIndicator } from '@/components/note/save-indicator';
import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ImageAttachmentSection from '@/components/ui/image-attachment-section';
import { InfoModal } from '@/components/ui/info-modal';
import { NoteSkeleton } from '@/components/ui/skeleton-loader';
import { WelcomeScreen } from '@/components/welcome-screen';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useImage } from '@/hooks/use-image';
import { useNote } from '@/hooks/use-note';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatFileSize } from '@/utils/format';
import { getPassphraseColor, getPassphraseStrength, isCommonPhrase } from '@/utils/passphrase';
import { useRealtimeNote } from '../../hooks/use-realtime-note';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({}, 'icon') as string;
  const textColor = useThemeColor({}, 'text') as string;
  const inputBackgroundColor = useThemeColor(
    { light: '#F0F2F5', dark: '#1E1F20' },
    'background'
  ) as string;
  const errorBannerBackground = useThemeColor(
    { light: '#FFEBEE', dark: '#3B1212' },
    'background'
  ) as string;
  const errorTextColor = useThemeColor(
    { light: '#D32F2F', dark: '#FFCDD2' },
    'text'
  ) as string;
  const progressBannerBackground = useThemeColor(
    { light: '#E3F2FD', dark: '#10273C' },
    'background'
  ) as string;
  const progressTextColor = useThemeColor(
    { light: '#1976D2', dark: '#90CAF9' },
    'text'
  ) as string;
  const blurButtonBackground = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.08)' },
    'background'
  ) as string;
  const blurButtonBorderColor = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.16)' },
    'background'
  ) as string;
  const tintColor = useThemeColor({}, 'tint') as string;
  const [isThumbnailBlurred, setIsThumbnailBlurred] = useState(true);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const strengthFadeAnim = useRef(new Animated.Value(0)).current;
  const strengthScaleAnim = useRef(new Animated.Value(0.9)).current;

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
    setIsLoadingNote,
    isSavingNote,
    isLoadingImage,
    isUploadingImage,
    hasUnsavedChanges,
    lastSavedAt,
    error,
    setError,
    isImageViewerOpen,
    setIsImageViewerOpen,
    remoteUpdateAvailable,
    setRemoteUpdateAvailable,
    clearNote,
  } = useNoteContext();

  const { loadNote, updateNote, forceUpdateNote } = useNote();
  const { loadImage, pickAndUploadImage, takeAndUploadPhoto, compressionProgress } = useImage();

  const DEFAULT_WELCOME_MESSAGE = 'Welcome to your new secure note!';
  const effectiveNoteContent =
    noteContent === DEFAULT_WELCOME_MESSAGE ? '' : noteContent;

  useRealtimeNote();

  // Pass originalContent so autosave knows when content was loaded from server (not user edit)
  const { originalContent } = useNoteContext();
  useAutoSave(effectiveNoteContent, passphrase, updateNote, note !== null && !remoteUpdateAvailable, originalContent);

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

  // Keep a ref to the current AbortController so we can cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (passphrase.length < 3) {
      clearNote();
      return;
    }

    // Cancel any in-flight request when user types again
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Set loading immediately when title becomes valid to show skeleton during debounce
    setIsLoadingNote(true);

    const handle = setTimeout(() => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      loadNote(controller.signal);
    }, 1000);

    return () => {
      clearTimeout(handle);
      // Also abort if component unmounts or passphrase changes before timeout
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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

  // Handle fade animations when state changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [passphrase.length < 3, isLoadingNote]);

  // Handle strength indicator animations
  useEffect(() => {
    if (passphraseStrength) {
      Animated.parallel([
        Animated.timing(strengthFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(strengthScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    } else {
      strengthFadeAnim.setValue(0);
      strengthScaleAnim.setValue(0.9);
    }
  }, [passphraseStrength]);

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

  const gradientColors = useThemeColor({}, 'gradients' as any) as unknown as string[];

  const runReload = (signal?: AbortSignal) => {
    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    loadNote(signal ?? controller.signal);
  };

  const handleReloadNote = () => {
    if (passphrase.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (hasUnsavedChanges) {
      Alert.alert(
        'Reload note?',
        'You have unsaved changes. Reloading will discard local edits and fetch the latest version from the server.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reload', style: 'destructive', onPress: () => runReload() },
        ]
      );
      return;
    }

    runReload();
  };

  // Auto-refresh if a remote update arrives and we have no local edits to protect
  useEffect(() => {
    if (remoteUpdateAvailable && !hasUnsavedChanges) {
      runReload();
    }
  }, [remoteUpdateAvailable, hasUnsavedChanges]);

  // Direct reload for banner button - skips confirmation since user already sees the conflict banner
  const handleBannerReload = () => {
    setRemoteUpdateAvailable(false);
    runReload();
  };

  const handleOverwriteRemote = async () => {
    try {
      // Use forceUpdateNote (no version) to bypass conflict and overwrite server
      await forceUpdateNote(effectiveNoteContent);
      // Only clear flag if save succeeded (no exception thrown)
      setRemoteUpdateAvailable(false);
    } catch {
      // forceUpdateNote already shows an alert on error, flag stays true
    }
  };


  return (
    <LinearGradient
      colors={(gradientColors && gradientColors.length >= 2 ? gradientColors : ['#ffffff', '#f1f5f9']) as unknown as [string, string, ...string[]]}
      style={styles.root}
    >
      <ThemedView style={[styles.mainContainer, {
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 8,
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
        backgroundColor: 'transparent',
      }]}>
        <SeoHead
          title="Instant Public Boards & Private Vaults"
          description="Create notes instantly. Use short titles for public boards (jokes, ads, chat) or complex titles for private, encrypted vaults. No signup."
        />
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

          {/* Remote update banner */}
          {remoteUpdateAvailable && (
            <ThemedView style={[styles.remoteBanner, { backgroundColor: progressBannerBackground }]}>
              <ThemedText style={[styles.remoteBannerText, { color: progressTextColor }]}>
                Someone else edited this note.
              </ThemedText>
              <View style={styles.remoteBannerActions}>
                <Pressable onPress={handleBannerReload} style={[styles.remoteActionBtn, { borderColor: progressTextColor }]}>
                  <ThemedText style={[styles.remoteActionText, { color: progressTextColor }]}>Use theirs</ThemedText>
                </Pressable>
                <Pressable onPress={handleOverwriteRemote} style={[styles.remoteActionBtn, { borderColor: progressTextColor }]}>
                  <ThemedText style={[styles.remoteActionText, { color: progressTextColor }]}>Keep mine</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          )}

          {/* Header: Title Input */}
          <View style={styles.headerSection}>
            <View style={styles.inputContainer}>
              <TextInput
                value={passphrase}
                onChangeText={setPassphrase}
                placeholder="Enter title"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!passphraseVisible}
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="password"
                autoComplete="off"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={[
                  styles.textInput,
                  {
                    color: textColor,
                    backgroundColor: inputBackgroundColor,
                    borderColor: isInputFocused ? tintColor : 'transparent',
                    borderWidth: 2,
                  },
                  isInputFocused && styles.textInputFocused,
                ]}
              />
              {/* Icons positioned inside the input */}
              <View style={styles.inputIconsRow}>
                {passphrase.length > 0 && (
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear title"
                    onPress={() => setPassphrase('')}
                    hitSlop={8}
                    style={styles.inputIcon}
                  >
                    <IconSymbol name="xmark.circle.fill" size={18} color={iconColor} />
                  </AnimatedPressable>
                )}
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel={passphraseVisible ? 'Hide title' : 'Show title'}
                  onPress={() => setPassphraseVisible(!passphraseVisible)}
                  hitSlop={8}
                  style={styles.inputIcon}
                >
                  <IconSymbol name={passphraseVisible ? 'eye.slash.fill' : 'eye.fill'} size={18} color={iconColor} />
                </AnimatedPressable>
              </View>
            </View>

            <View style={styles.inputFooter}>
              <View style={styles.passphraseInfo}>
                <ThemedText style={styles.charCount}>
                  {passphrase.length > 0 ? `${passphrase.length} chars` : 'Min 3 chars'}
                </ThemedText>
                {passphraseStrength && (
                  <Animated.View style={{ opacity: strengthFadeAnim, transform: [{ scale: strengthScaleAnim }] }}>
                    <AnimatedPressable
                      accessibilityRole="button"
                      accessibilityLabel="Title strength information"
                      onPress={() => {
                        console.log('Strength badge clicked!');
                        setInfoModal({
                          visible: true,
                          title: 'Title Strength',
                          message: 'Your title strength is determined by its length:\n\n• Weak: Less than 6 characters\n• Medium: 6-11 characters\n• Strong: 12 or more characters\n\nLonger titles make your note more secure and harder to guess.',
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
                    </AnimatedPressable>
                  </Animated.View>
                )}
                {isPublicNote && (
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Public note warning"
                    onPress={() => {
                      console.log('Public badge clicked!');
                      setInfoModal({
                        visible: true,
                        title: '⚠️ Public Note Warning',
                        message: 'Your title uses common words that are easy to guess. Anyone who tries common phrases like "hello", "test", or "password" could access this note.\n\nFor better privacy, use a unique title with uncommon words, numbers, or special characters.',
                      });
                    }}
                    hitSlop={8}
                    style={styles.publicWarningContainer}
                  >
                    <ThemedText style={styles.publicWarning}>⚠️ Public</ThemedText>
                  </AnimatedPressable>
                )}
              </View>
              <View style={styles.saveSection}>
                <View>
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Reload note"
                    onPress={handleReloadNote}
                    disabled={isLoadingNote || passphrase.length < 3}
                    hitSlop={10}
                    style={[
                      styles.reloadButton,
                      { opacity: isLoadingNote || passphrase.length < 3 ? 0.5 : 1 },
                    ]}
                  >
                    {isLoadingNote ? (
                      <ActivityIndicator size="small" color={tintColor} />
                    ) : (
                      <IconSymbol name="arrow.clockwise" size={18} color={tintColor} />
                    )}
                  </AnimatedPressable>
                  {remoteUpdateAvailable && <View style={[styles.reloadDot, { backgroundColor: tintColor }]} />}
                </View>
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
          <Animated.View style={[styles.noteSection, { opacity: fadeAnim }]}>
            {passphrase.length < 3 ? (
              <WelcomeScreen />
            ) : isLoadingNote ? (
              <NoteSkeleton />
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
          </Animated.View>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mainContainer: {
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputFocused: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    gap: 8,
  },
  reloadButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  reloadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  remoteBanner: {
    flexDirection: 'column',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  remoteBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  remoteBannerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  remoteActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  remoteActionText: {
    fontSize: 13,
    fontWeight: '600',
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
