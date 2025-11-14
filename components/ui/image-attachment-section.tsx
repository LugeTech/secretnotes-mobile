import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ImageAttachmentSectionProps = {
  /**
   * Display mode for the attachment area.
   * - 'empty': shows a placeholder inviting an image attachment.
   * - 'preview': shows a thumbnail with file metadata and an optional remove affordance.
   */
  mode?: 'empty' | 'preview';
  /** Visual appearance of the empty state */
  appearance?: 'plain' | 'outlined' | 'dashed';
  /** Filename shown in preview mode */
  fileName?: string;
  /** Human-friendly file size (e.g., "234 KB") shown in preview mode */
  fileSize?: string;
  /** Thumbnail URI for the preview image */
  thumbnailUri?: string;
  /** Press handler - for preview mode opens viewer, for empty mode opens picker */
  onPress?: () => void;
  /** Optional replace handler in preview mode */
  onReplace?: () => void;
  /** Optional container style overrides */
  style?: ViewStyle;
  /** Optional test id */
  testID?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Whether to apply blur effect to the thumbnail */
  blur?: boolean;
  /** Custom blur radius (default: 20) */
  blurRadius?: number;
};

/**
 * Image attachment section used below the note text area.
 */
export default function ImageAttachmentSection({
  mode = 'empty',
  appearance = 'plain',
  fileName,
  fileSize,
  thumbnailUri,
  onPress,
  onReplace,
  style,
  testID,
  isLoading = false,
  blur = false,
  blurRadius = 20,
}: ImageAttachmentSectionProps) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  if (isLoading) {
    return (
      <ThemedView style={[styles.emptyPlain, style]}>
        <ActivityIndicator size="small" />
        <ThemedText style={styles.emptyHint}>Loading image...</ThemedText>
      </ThemedView>
    );
  }

  if (mode === 'preview') {
    const containerBase = appearance === 'plain' ? styles.previewPlain : styles.previewContainer;
    return (
      <ThemedView style={[containerBase, appearance !== 'plain' ? { borderColor } : null, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View full image"
          onPress={onPress}
          style={styles.thumbnailButton}
        >
          <View style={styles.thumbnailWrapper}>
            <Image
              source={thumbnailUri || undefined}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="none"
              blurRadius={blur ? blurRadius : 0}
            />
            {blur && (
              <View
                pointerEvents="none"
                style={[
                  styles.thumbnailBlurOverlay,
                  Platform.OS !== 'web' && styles.nativeThumbnailBlurOverlay,
                ]}
              />
            )}
          </View>
        </Pressable>
        <View style={styles.metaContainer}>
          <ThemedText numberOfLines={1} style={styles.fileName}>
            {fileName || 'attached-image'}
          </ThemedText>
          {!!fileSize && (
            <ThemedText style={styles.fileSize}>{fileSize}</ThemedText>
          )}
        </View>
        {onReplace && (
          <Pressable
            style={styles.replaceBtn}
            accessibilityRole="button"
            accessibilityLabel="Replace image"
            onPress={onReplace}
            hitSlop={8}
          >
            <IconSymbol name="plus" size={14} color={textColor} />
            <ThemedText style={[styles.replaceBtnText, { color: textColor }]}>Replace</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  }

  // Empty state (default)
  const emptyStyle =
    appearance === 'dashed'
      ? [styles.emptyDashed, { borderColor }]
      : appearance === 'outlined'
      ? [styles.emptyOutlined, { borderColor }]
      : [styles.emptyPlain];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Attach image"
      onPress={onPress}
      testID={testID}
    >
      <ThemedView style={[emptyStyle as any, style]}>
        <ThemedText style={styles.emptyTitle}>Attach image</ThemedText>
        <ThemedText style={styles.emptyHint}>Tap to select from gallery</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyPlain: {
    paddingVertical: 8,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyDashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyOutlined: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 12,
    opacity: 0.7,
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  previewPlain: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    borderColor: 'rgba(25, 118, 210, 0.15)',
  },
  thumbnailButton: {
    borderRadius: 8,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbnailBlurOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  nativeThumbnailBlurOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  metaContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  replaceBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
