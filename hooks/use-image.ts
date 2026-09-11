import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { useNoteContext } from '@/components/note/note-provider';
import {
  deleteEncryptedImage,
  fetchEncryptedImage,
  handleApiError,
  uploadEncryptedImage,
} from '@/utils/api-client';
import { encodeBase64 } from '@/utils/crypto-core';
import {
  decryptImageContent,
  decryptImageMetadata,
  encryptImageContent,
  encryptImageMetadata,
  getCryptoKeys,
  lookupTokenHeader,
} from '@/utils/crypto';
import { compressImage, formatFileSize, getCompressionSummary } from '@/utils/image-compression';

export function useImage() {
  const {
    passphrase, note, setNote, imageUri, setImageUri, setImageMetadata,
    setIsLoadingImage, setIsUploadingImage, setError,
  } = useNoteContext();
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);

  const loadImage = useCallback(async () => {
    if (!note?.hasImage || passphrase.length < 3) return;
    setIsLoadingImage(true);
    setError(null);
    try {
      const keys = await getCryptoKeys(passphrase);
      const encrypted = await fetchEncryptedImage(lookupTokenHeader(keys));
      const metadata = decryptImageMetadata(encrypted.metadata, keys);
      const plaintext = decryptImageContent(encrypted.bytes, keys);
      setImageUri(`data:${metadata.contentType};base64,${encodeBase64(plaintext)}`);
      setImageMetadata({
        message: 'Image decrypted locally',
        ...metadata,
        fileHash: '',
        created: note.created,
        updated: note.updated,
      });
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      console.error('Error loading image:', message);
    } finally {
      setIsLoadingImage(false);
    }
  }, [note, passphrase, setError, setImageMetadata, setImageUri, setIsLoadingImage]);

  const processAssetAndUpload = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    if (!note) return;
    setIsUploadingImage(true);
    setError(null);
    setCompressionProgress('Preparing image...');
    try {
      if (asset.fileSize) setCompressionProgress(`Original size: ${formatFileSize(asset.fileSize)}`);
      setCompressionProgress('Compressing image...');
      const compressed = await compressImage(asset.uri, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        compressOnlyIfLargerThan: 2 * 1024 * 1024,
      }, asset.mimeType);
      setCompressionProgress(compressed.compressed ? getCompressionSummary(compressed) : 'Image already optimized');

      const response = await fetch(compressed.uri);
      if (!response.ok) throw new Error('Could not read the selected image');
      const plaintext = new Uint8Array(await response.arrayBuffer());
      const keys = await getCryptoKeys(passphrase);
      const metadata = {
        fileName: asset.fileName || 'photo.jpg',
        fileSize: plaintext.length,
        contentType: compressed.format || asset.mimeType || 'image/jpeg',
      };
      setCompressionProgress('Encrypting and uploading image...');
      const updated = await uploadEncryptedImage(
        lookupTokenHeader(keys),
        await encryptImageContent(plaintext, keys),
        await encryptImageMetadata(metadata, keys),
        note.version,
      );
      setNote({ ...note, hasImage: true, version: updated.version, updated: updated.updated });
      setImageMetadata({
        message: 'Image encrypted locally',
        ...metadata,
        fileHash: '',
        created: note.created,
        updated: updated.updated,
      });
      setImageUri(`data:${metadata.contentType};base64,${encodeBase64(plaintext)}`);
      Alert.alert('Success', compressed.compressed
        ? `Image encrypted and uploaded\n${getCompressionSummary(compressed)}`
        : 'Image encrypted and uploaded');
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      Alert.alert('Image Error', message);
    } finally {
      setIsUploadingImage(false);
      setCompressionProgress(null);
    }
  }, [note, passphrase, setError, setImageMetadata, setImageUri, setIsUploadingImage, setNote]);

  const pickAndUploadImage = useCallback(async () => {
    if (!note) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera roll permission is required to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
    if (!result.canceled) await processAssetAndUpload(result.assets[0]);
  }, [note, processAssetAndUpload]);

  const takeAndUploadPhoto = useCallback(async () => {
    if (!note) return;
    if (Platform.OS === 'web') return pickAndUploadImage();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
    if (!result.canceled) await processAssetAndUpload(result.assets[0]);
  }, [note, pickAndUploadImage, processAssetAndUpload]);

  const removeImage = useCallback(() => {
    if (!note) return;
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsLoadingImage(true);
          try {
            const keys = await getCryptoKeys(passphrase);
            const updated = await deleteEncryptedImage(lookupTokenHeader(keys), note.version);
            setNote({ ...note, hasImage: false, version: updated.version, updated: updated.updated });
            setImageUri(null);
            setImageMetadata(null);
          } catch (error) {
            const message = handleApiError(error);
            setError(message);
            Alert.alert('Error Deleting Image', message);
          } finally {
            setIsLoadingImage(false);
          }
        },
      },
    ]);
  }, [note, passphrase, setError, setImageMetadata, setImageUri, setIsLoadingImage, setNote]);

  return { loadImage, pickAndUploadImage, takeAndUploadPhoto, removeImage, compressionProgress };
}
