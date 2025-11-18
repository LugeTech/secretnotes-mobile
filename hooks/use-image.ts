import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNoteContext } from '@/components/note/note-provider';
import { uploadImage, fetchImage, deleteImage, handleApiError } from '@/utils/api-client';
import { compressImage, formatFileSize, getCompressionSummary } from '@/utils/image-compression';
import { useNote } from './use-note';

export function useImage() {
  const {
    passphrase,
    note,
    imageUri,
    setImageUri,
    setImageMetadata,
    setIsLoadingImage,
    setIsUploadingImage,
    setError,
  } = useNoteContext();

  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);

  const { loadNote } = useNote();

  const loadImage = useCallback(async () => {
    if (!note?.hasImage || passphrase.length < 3) {
      return;
    }

    setIsLoadingImage(true);
    setError(null);

    try {
      const uri = await fetchImage(passphrase);
      setImageUri(uri);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      console.error('Error loading image:', message);
    } finally {
      setIsLoadingImage(false);
    }
  }, [note?.hasImage, passphrase, setImageUri, setIsLoadingImage, setError]);

  const processAssetAndUpload = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploadingImage(true);
    setError(null);
    setCompressionProgress('Preparing image...');

    try {
      // Show original file size
      if (asset.fileSize) {
        setCompressionProgress(`Original size: ${formatFileSize(asset.fileSize)}`);
      }

      // Compress the image
      setCompressionProgress('Compressing image...');
      const compressionResult = await compressImage(
        asset.uri,
        {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          compressOnlyIfLargerThan: 2 * 1024 * 1024, // 2MB
        },
        asset.mimeType
      );

      // Show compression results
      if (compressionResult.compressed) {
        setCompressionProgress(getCompressionSummary(compressionResult));
        console.log('Image compression completed:', compressionResult);
      } else {
        setCompressionProgress('Image already optimized');
      }

      // Small delay to show compression status
      await new Promise(resolve => setTimeout(resolve, 500));

      setCompressionProgress('Uploading image...');
      const metadata = await uploadImage(
        passphrase,
        compressionResult.uri,
        asset.fileName || 'photo.jpg',
        compressionResult.format
      );

      setImageMetadata(metadata);
      await loadNote();
      await loadImage();

      const successMessage = compressionResult.compressed
        ? `Image uploaded successfully\n${getCompressionSummary(compressionResult)}`
        : 'Image uploaded successfully';

      Alert.alert('Success', successMessage);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);

      // Show more detailed error for compression issues
      if (message.includes('exceeds maximum allowed size')) {
        Alert.alert(
          'Image Too Large',
          'The selected image is too large to process. Please choose a smaller image or try a different format.'
        );
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsUploadingImage(false);
      setCompressionProgress(null);
    }
  }, [passphrase, setImageMetadata, setIsUploadingImage, setError, loadNote, loadImage]);

  const pickAndUploadImage = useCallback(async () => {
    if (passphrase.length < 3) {
      Alert.alert('Error', 'Please enter a title first');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera roll permission is required to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1.0,
      base64: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    await processAssetAndUpload(asset);
  }, [passphrase, processAssetAndUpload]);

  const takeAndUploadPhoto = useCallback(async () => {
    if (passphrase.length < 3) {
      Alert.alert('Error', 'Please enter a title first');
      return;
    }

    if (Platform.OS === 'web') {
      return pickAndUploadImage();
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1.0,
      base64: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    await processAssetAndUpload(asset);
  }, [passphrase, pickAndUploadImage, processAssetAndUpload]);

  const removeImage = useCallback(async () => {
    if (passphrase.length < 3) {
      return;
    }

    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoadingImage(true);
            setError(null);

            try {
              await deleteImage(passphrase);
              
              if (imageUri) {
                URL.revokeObjectURL(imageUri);
              }
              
              setImageUri(null);
              setImageMetadata(null);
              await loadNote();
              
              Alert.alert('Success', 'Image deleted successfully');
            } catch (error) {
              const message = handleApiError(error);
              setError(message);
              Alert.alert('Error Deleting Image', message);
            } finally {
              setIsLoadingImage(false);
            }
          },
        },
      ]
    );
  }, [passphrase, imageUri, setImageUri, setImageMetadata, setIsLoadingImage, setError, loadNote]);

  return {
    loadImage,
    pickAndUploadImage,
    takeAndUploadPhoto,
    removeImage,
    compressionProgress,
  };
}
