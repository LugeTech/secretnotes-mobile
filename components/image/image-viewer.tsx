import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ImageViewerProps {
  visible: boolean;
  imageUri: string | null;
  fileName?: string;
  onClose: () => void;
}

export function ImageViewer({ visible, imageUri, fileName, onClose }: ImageViewerProps) {
  const handleSave = async () => {
    if (!imageUri) return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to save images.'
        );
        return;
      }

      if (imageUri.startsWith('data:')) {
        const mimeMatch = imageUri.match(/data:image\/(\w+);base64,/);
        const fileExtension = mimeMatch ? mimeMatch[1] : 'jpg';
        const base64Data = imageUri.split(';base64,')[1];

        const tempFile = new File(Paths.document, `${fileName || 'image'}.${fileExtension}`);
        
        // Convert base64 to Uint8Array and write to file
        const binaryString = atob(base64Data);
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        tempFile.write(bytes);

        const asset = await MediaLibrary.createAssetAsync(tempFile.uri);
        tempFile.delete();
        
        await MediaLibrary.createAlbumAsync('Secret Notes', asset, false).catch(() => {});

        Alert.alert('Success', 'Image saved to photo library');
      } else {
        const asset = await MediaLibrary.createAssetAsync(imageUri);
        await MediaLibrary.createAlbumAsync('Secret Notes', asset, false).catch(() => {});
        
        Alert.alert('Success', 'Image saved to photo library');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image to photo library');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          {/* Header with controls */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>{fileName || 'Image'}</ThemedText>
            <View style={styles.controls}>
              <Pressable
                onPress={handleSave}
                style={styles.button}
                hitSlop={8}
              >
                <IconSymbol name="paperplane.fill" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </Pressable>
              <Pressable
                onPress={onClose}
                style={styles.button}
                hitSlop={8}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="white" />
                <ThemedText style={styles.buttonText}>Close</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Full-size image */}
          <View style={styles.imageContainer}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="contain"
                cachePolicy="none"
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
