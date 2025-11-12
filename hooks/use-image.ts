import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNoteContext } from '@/components/note/note-provider';
import { uploadImage, fetchImage, deleteImage, handleApiError } from '@/utils/api-client';
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

  const pickAndUploadImage = useCallback(async () => {
    if (passphrase.length < 3) {
      Alert.alert('Error', 'Please enter a passphrase first');
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
      quality: 0.8,
      base64: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    
    const MAX_SIZE = 10 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > MAX_SIZE) {
      Alert.alert(
        'Image Too Large',
        `Image size is ${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB. Maximum size is 10MB. Please select a smaller image.`
      );
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const metadata = await uploadImage(
        passphrase,
        asset.uri,
        asset.fileName,
        asset.mimeType
      );
      
      setImageMetadata(metadata);
      await loadNote();
      await loadImage();
      
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      Alert.alert('Error Uploading Image', message);
    } finally {
      setIsUploadingImage(false);
    }
  }, [passphrase, setImageMetadata, setIsUploadingImage, setError, loadNote, loadImage]);

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
    removeImage,
  };
}
