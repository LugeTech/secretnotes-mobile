import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NoteResponse, ImageUploadResponse } from '@/types';

interface NoteContextType {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  passphraseVisible: boolean;
  setPassphraseVisible: (visible: boolean) => void;
  note: NoteResponse | null;
  setNote: (note: NoteResponse | null) => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  originalContent: string;
  setOriginalContent: (content: string) => void;
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  imageMetadata: ImageUploadResponse | null;
  setImageMetadata: (metadata: ImageUploadResponse | null) => void;
  isLoadingNote: boolean;
  setIsLoadingNote: (loading: boolean) => void;
  isSavingNote: boolean;
  setIsSavingNote: (saving: boolean) => void;
  isLoadingImage: boolean;
  setIsLoadingImage: (loading: boolean) => void;
  isUploadingImage: boolean;
  setIsUploadingImage: (uploading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  setLastSavedAt: (date: Date | null) => void;
  isImageViewerOpen: boolean;
  setIsImageViewerOpen: (open: boolean) => void;
  clearNote: () => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [passphrase, setPassphrase] = useState('');
  const [passphraseVisible, setPassphraseVisible] = useState(false);
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageUploadResponse | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const hasUnsavedChanges = noteContent !== originalContent;

  const clearNote = useCallback(() => {
    setNote(null);
    setNoteContent('');
    setOriginalContent('');
    setImageUri(null);
    setImageMetadata(null);
    setError(null);
    setLastSavedAt(null);
  }, []);

  const value: NoteContextType = {
    passphrase,
    setPassphrase,
    passphraseVisible,
    setPassphraseVisible,
    note,
    setNote,
    noteContent,
    setNoteContent,
    originalContent,
    setOriginalContent,
    imageUri,
    setImageUri,
    imageMetadata,
    setImageMetadata,
    isLoadingNote,
    setIsLoadingNote,
    isSavingNote,
    setIsSavingNote,
    isLoadingImage,
    setIsLoadingImage,
    isUploadingImage,
    setIsUploadingImage,
    error,
    setError,
    hasUnsavedChanges,
    lastSavedAt,
    setLastSavedAt,
    isImageViewerOpen,
    setIsImageViewerOpen,
    clearNote,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNoteContext() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
}
