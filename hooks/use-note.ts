import { useNoteContext } from '@/components/note/note-provider';
import { fetchNote, handleApiError, saveNote } from '@/utils/api-client';
import { useCallback } from 'react';
import { Alert } from 'react-native';

export function useNote() {
  const {
    passphrase,
    setNote,
    noteContent,
    setNoteContent,
    setOriginalContent,
    setIsLoadingNote,
    setIsSavingNote,
    setError,
    setLastSavedAt,
    clearNote,
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
      const updatedNote = await saveNote(passphrase, message);
      setNote(updatedNote);
      setOriginalContent(message);
      setLastSavedAt(new Date());
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      Alert.alert('Error Saving Note', errorMessage);
    } finally {
      setIsSavingNote(false);
    }
  }, [passphrase, setNote, setOriginalContent, setIsSavingNote, setError, setLastSavedAt]);

  return {
    loadNote,
    updateNote,
    clearNote,
  };
}
