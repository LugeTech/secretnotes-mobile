import { Platform } from 'react-native';
import { NoteResponse, ImageUploadResponse, ErrorResponse } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_BASE_URL is not configured. Please add it to your .env file.'
  );
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'Unknown error occurred'
    }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return await response.json();
}

export async function fetchNote(passphrase: string): Promise<NoteResponse> {
  if (passphrase.length < 3) {
    throw new ApiError(400, 'Title must be at least 3 characters long');
  }

  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'GET',
    headers: {
      'X-Passphrase': passphrase
    }
  });

  return handleResponse<NoteResponse>(response);
}

export async function saveNote(
  passphrase: string,
  message: string
): Promise<NoteResponse> {
  if (passphrase.length < 3) {
    throw new ApiError(400, 'Title must be at least 3 characters long');
  }

  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Passphrase': passphrase
    },
    body: JSON.stringify({ message })
  });

  return handleResponse<NoteResponse>(response);
}

export async function uploadImage(
  passphrase: string,
  imageUri: string,
  fileName?: string,
  fileType?: string
): Promise<ImageUploadResponse> {
  if (passphrase.length < 3) {
    throw new ApiError(400, 'Title must be at least 3 characters long');
  }

  try {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const imageResponse = await fetch(imageUri);
      if (!imageResponse.ok) {
        throw new Error(`Failed to read image from URI: ${imageResponse.statusText}`);
      }
      const blob = await imageResponse.blob();

      formData.append('image', blob, fileName || 'photo.jpg');
    } else {
      const name = fileName || 'photo.jpg';
      const type = fileType || 'image/jpeg';

      formData.append('image', { uri: imageUri, name, type } as any);
    }

    const response = await fetch(`${API_BASE_URL}/notes/image`, {
      method: 'POST',
      headers: {
        'X-Passphrase': passphrase,
        // Don't set Content-Type - let fetch set it with the boundary
      },
      body: formData
    });

    return handleResponse<ImageUploadResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchImage(passphrase: string): Promise<string> {
  if (passphrase.length < 3) {
    throw new ApiError(400, 'Title must be at least 3 characters long');
  }

  const response = await fetch(`${API_BASE_URL}/notes/image`, {
    method: 'GET',
    headers: {
      'X-Passphrase': passphrase
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, 'No image found');
    }
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'Failed to fetch image'
    }));
    throw new ApiError(response.status, error.error);
  }

  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image blob'));
    reader.readAsDataURL(blob);
  });
}

export async function deleteImage(passphrase: string): Promise<void> {
  if (passphrase.length < 3) {
    throw new ApiError(400, 'Title must be at least 3 characters long');
  }

  const response = await fetch(`${API_BASE_URL}/notes/image`, {
    method: 'DELETE',
    headers: {
      'X-Passphrase': passphrase
    }
  });

  await handleResponse<{ message: string }>(response);
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Network request failed')) {
      return 'No internet connection. Please check your network.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}
