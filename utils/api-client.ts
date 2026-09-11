import { EncryptedNoteResponse, ErrorResponse, LegacyNoteResponse } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured. Please add it to your .env file.');

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown, public currentVersion?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
export class VersionConflictError extends ApiError {
  constructor(public currentVersion: number) {
    super(409, 'version_conflict', undefined, currentVersion);
    this.name = 'VersionConflictError';
  }
}
export class NoteNotFoundError extends ApiError {
  constructor() {
    super(404, 'Note not found');
    this.name = 'NoteNotFoundError';
  }
}

const tokenHeaders = (lookupToken: string): HeadersInit => ({ 'X-Lookup-Token': lookupToken });
const blobBytes = (value: Uint8Array): ArrayBuffer => Uint8Array.from(value).buffer;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({ error: 'Request failed' }));
    if (response.status === 409 && error.error === 'version_conflict') {
      throw new VersionConflictError(error.currentVersion ?? 0);
    }
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function fetchEncryptedNote(lookupToken: string, signal?: AbortSignal): Promise<EncryptedNoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v2/notes`, { headers: tokenHeaders(lookupToken), signal });
  if (response.status === 404) throw new NoteNotFoundError();
  return handleResponse<EncryptedNoteResponse>(response);
}

export async function createEncryptedNote(lookupToken: string, ciphertext: string): Promise<EncryptedNoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v2/notes`, {
    method: 'POST',
    headers: { ...tokenHeaders(lookupToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciphertext }),
  });
  return handleResponse<EncryptedNoteResponse>(response);
}

export async function saveEncryptedNote(
  lookupToken: string,
  ciphertext: string,
  version: number | undefined,
  force = false,
): Promise<EncryptedNoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v2/notes`, {
    method: 'PUT',
    headers: { ...tokenHeaders(lookupToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciphertext, ...(force ? { force: true } : { version }) }),
  });
  return handleResponse<EncryptedNoteResponse>(response);
}

export async function uploadEncryptedImage(
  lookupToken: string,
  encryptedImage: Uint8Array,
  encryptedMetadata: string,
  version: number,
  signal?: AbortSignal,
): Promise<EncryptedNoteResponse> {
  const form = new FormData();
  form.append('image', new Blob([blobBytes(encryptedImage)], { type: 'application/octet-stream' }), 'image.bin');
  form.append('image_metadata', encryptedMetadata);
  form.append('version', String(version));
  const response = await fetch(`${API_BASE_URL}/v2/notes/image`, {
    method: 'POST',
    headers: tokenHeaders(lookupToken),
    body: form,
    signal,
  });
  return handleResponse<EncryptedNoteResponse>(response);
}

export async function fetchEncryptedImage(
  lookupToken: string,
  signal?: AbortSignal,
): Promise<{ bytes: Uint8Array; metadata: string }> {
  const response = await fetch(`${API_BASE_URL}/v2/notes/image`, { headers: tokenHeaders(lookupToken), signal });
  if (!response.ok) await handleResponse<never>(response);
  return { bytes: new Uint8Array(await response.arrayBuffer()), metadata: response.headers.get('X-Encrypted-Metadata') ?? '' };
}

export async function deleteEncryptedImage(
  lookupToken: string,
  version: number,
  signal?: AbortSignal,
): Promise<EncryptedNoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v2/notes/image`, {
    method: 'DELETE',
    headers: { ...tokenHeaders(lookupToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({ version }),
    signal,
  });
  return handleResponse<EncryptedNoteResponse>(response);
}

export async function fetchLegacyNote(lookupHash: string): Promise<LegacyNoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v2/recovery`, { headers: { 'X-Legacy-Lookup-Hash': lookupHash } });
  if (response.status === 404) throw new NoteNotFoundError();
  return handleResponse<LegacyNoteResponse>(response);
}

export async function fetchLegacyImage(lookupHash: string): Promise<{ bytes: Uint8Array; fileNameCiphertext: string; contentType: string }> {
  const response = await fetch(`${API_BASE_URL}/v2/recovery/image`, { headers: { 'X-Legacy-Lookup-Hash': lookupHash } });
  if (!response.ok) await handleResponse<never>(response);
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    fileNameCiphertext: response.headers.get('X-Encrypted-Metadata') ?? '',
    contentType: response.headers.get('X-Legacy-Content-Type') ?? 'application/octet-stream',
  };
}

export async function importEncryptedNote(
  lookupToken: string,
  ciphertext: string,
  image?: { bytes: Uint8Array; metadata: string },
): Promise<EncryptedNoteResponse> {
  const form = new FormData();
  form.append('ciphertext', ciphertext);
  if (image) {
    form.append('image', new Blob([blobBytes(image.bytes)], { type: 'application/octet-stream' }), 'image.bin');
    form.append('image_metadata', image.metadata);
  }
  const response = await fetch(`${API_BASE_URL}/v2/import`, {
    method: 'POST',
    headers: tokenHeaders(lookupToken),
    body: form,
  });
  return handleResponse<EncryptedNoteResponse>(response);
}

export function handleApiError(error: unknown): string {
  if (error instanceof VersionConflictError) return 'Someone else edited this note. Reload to see their changes.';
  if (error instanceof ApiError) {
    if (error.statusCode === 404) return 'Resource not found.';
    if (error.statusCode === 429) return 'Too many attempts. Please wait and try again.';
    if (error.statusCode >= 500) return 'Server error. Please try again later.';
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.includes('Network request failed')) return 'No internet connection. Please check your network.';
    return error.message;
  }
  return 'An unexpected error occurred.';
}
