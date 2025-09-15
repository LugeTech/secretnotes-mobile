import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  /** Optional press handler (UI only) */
  onPress?: () => void;
  /** Optional remove handler in preview mode (UI only) */
  onRemove?: () => void;
  /** Optional container style overrides */
  style?: ViewStyle;
  /** Optional test id */
  testID?: string;
};

/**
 * UI-only image attachment section used below the note text area.
 * No pickers, uploads, or backend calls here—purely presentational.
 */
export default function ImageAttachmentSection({
  mode = 'empty',
  appearance = 'plain',
  fileName,
  fileSize,
  thumbnailUri,
  onPress,
  onRemove,
  style,
  testID,
}: ImageAttachmentSectionProps) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  if (mode === 'preview') {
    const containerBase = appearance === 'plain' ? styles.previewPlain : styles.previewContainer;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Attached image preview (UI only)"
        onPress={onPress}
        testID={testID}
      >
        <ThemedView style={[containerBase, appearance !== 'plain' ? { borderColor } : null, style]}>
          <Image
            source={thumbnailUri || undefined}
            style={styles.thumbnail}
            contentFit="cover"
          />
          <View style={styles.metaContainer}>
            <ThemedText numberOfLines={1} style={styles.fileName}>
              {fileName || 'attached-image'}
            </ThemedText>
            {!!fileSize && (
              <ThemedText style={styles.fileSize}>{fileSize}</ThemedText>
            )}
          </View>
          {onRemove ? (
            <Pressable
              style={styles.removeBtn}
              accessibilityRole="button"
              accessibilityLabel="Remove attachment (UI only)"
              onPress={onRemove}
            >
              <ThemedText style={[styles.removeBtnText, { color: textColor }]}>×</ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>
      </Pressable>
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
      accessibilityLabel="Attach image (UI only)"
      onPress={onPress}
      testID={testID}
    >
      <ThemedView style={[emptyStyle as any, style]}>
        <ThemedText style={styles.emptyTitle}>Attach image (UI only)</ThemedText>
        <ThemedText style={styles.emptyHint}>No file picker yet</ThemedText>
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
    borderWidth: 0,
    borderRadius: 12,
    padding: 8,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
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
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  removeBtnText: {
    fontSize: 18,
    lineHeight: 18,
  },
});
