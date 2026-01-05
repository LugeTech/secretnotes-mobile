export interface NoteResponse {
  id: string;
  message: string;
  hasImage: boolean;
  version: number;
  created: string;
  updated: string;
}

export interface ImageUploadResponse {
  message: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  fileHash: string;
  created: string | null;
  updated: string | null;
}

export interface ErrorResponse {
  error: string;
  currentVersion?: number;
}

export interface AppState {
  passphrase: string;
  passphraseVisible: boolean;
  note: NoteResponse | null;
  noteContent: string;
  originalContent: string;
  imageUri: string | null;
  imageMetadata: ImageUploadResponse | null;
  isLoadingNote: boolean;
  isSavingNote: boolean;
  isLoadingImage: boolean;
  isUploadingImage: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}
