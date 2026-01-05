import { useNoteContext } from '@/components/note/note-provider';
import { fetchNote, handleApiError, saveNote, VersionConflictError } from '@/utils/api-client';
import { useCallback } from 'react';
import { Alert } from 'react-native';

export function useNote() {
  const {
    passphrase,
    note,
    setNote,
    noteContent,
    setNoteContent,
    setOriginalContent,
    setIsLoadingNote,
    setIsSavingNote,
    setError,
    setLastSavedAt,
    clearNote,
    setRemoteUpdateAvailable,
    setRemoteUpdatedAt,
  } = useNoteContext();

  const loadNote = useCallback(async (signal?: AbortSignal) => {
    if (passphrase.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    setIsLoadingNote(true);
    setError(null);

    try {
      const fetchedNote = await fetchNote(passphrase, signal);
      setNote(fetchedNote);
      setNoteContent(fetchedNote.message);
      setOriginalContent(fetchedNote.message);
      setRemoteUpdateAvailable(false);
      if (fetchedNote.updated) {
        setRemoteUpdatedAt(new Date(fetchedNote.updated));
      } else {
        setRemoteUpdatedAt(null);
      }
    } catch (error) {
      // Silently ignore aborted requests - user typed again while loading
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      const message = handleApiError(error);
      setError(message);
      Alert.alert('Error Loading Note', message);
    } finally {
      setIsLoadingNote(false);
    }
  }, [passphrase, setNote, setNoteContent, setOriginalContent, setIsLoadingNote, setError]);

  const updateNote = useCallback(async (message: string) => {
    if (passphrase.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    setIsSavingNote(true);
    setError(null);

    try {
      // Pass current version for optimistic locking
      const updatedNote = await saveNote(passphrase, message, note?.version);
      setNote(updatedNote);
      setOriginalContent(message);
      setLastSavedAt(new Date());
      setRemoteUpdateAvailable(false);
      if (updatedNote.updated) {
        setRemoteUpdatedAt(new Date(updatedNote.updated));
      }
    } catch (error) {
      // On version conflict, set remote update flag so user sees the conflict UI
      if (error instanceof VersionConflictError) {
        setRemoteUpdateAvailable(true);
      }
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      Alert.alert('Error Saving Note', errorMessage);
      throw error; // Re-throw so callers know save failed
    } finally {
      setIsSavingNote(false);
    }
  }, [passphrase, note?.version, setNote, setOriginalContent, setIsSavingNote, setError, setLastSavedAt, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  // Force save without version check (last-write-wins) - used for "Overwrite" action
  const forceUpdateNote = useCallback(async (message: string) => {
    if (passphrase.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    setIsSavingNote(true);
    setError(null);

    try {
      // Omit version to use last-write-wins mode
      const updatedNote = await saveNote(passphrase, message);
      setNote(updatedNote);
      setOriginalContent(message);
      setLastSavedAt(new Date());
      setRemoteUpdateAvailable(false);
      if (updatedNote.updated) {
        setRemoteUpdatedAt(new Date(updatedNote.updated));
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      Alert.alert('Error Saving Note', errorMessage);
      throw error;
    } finally {
      setIsSavingNote(false);
    }
  }, [passphrase, setNote, setOriginalContent, setIsSavingNote, setError, setLastSavedAt, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  return {
    loadNote,
    updateNote,
    forceUpdateNote,
    clearNote,
  };
}
