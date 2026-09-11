import { useNoteContext } from '@/components/note/note-provider';
import { EncryptedNoteResponse, NoteResponse } from '@/types';
import {
  fetchEncryptedNote,
  fetchLegacyImage,
  fetchLegacyNote,
  handleApiError,
  importEncryptedNote,
  NoteNotFoundError,
  saveEncryptedNote,
  VersionConflictError,
} from '@/utils/api-client';
import {
  decryptLegacyRawBytes,
  decryptLegacyText,
  legacyLookupHash,
} from '@/utils/crypto-core';
import {
  decryptImageContent,
  decryptImageMetadata,
  decryptNoteContent,
  encryptImageContent,
  encryptImageMetadata,
  encryptNoteContent,
  getCryptoKeys,
  lookupTokenHeader,
} from '@/utils/crypto';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

const toNote = (encrypted: EncryptedNoteResponse, message: string): NoteResponse => ({
  id: encrypted.id,
  message,
  hasImage: encrypted.hasImage,
  version: encrypted.version,
  created: encrypted.created,
  updated: encrypted.updated,
});

export function useNote() {
  const context = useNoteContext();
  const {
    passphrase, note, setNote, setNoteContent, setOriginalContent, setIsLoadingNote,
    setIsSavingNote, setError, setLastSavedAt, clearNote, setRemoteUpdateAvailable,
    setRemoteUpdatedAt, setNoteStatus,
  } = context;
  const passphraseRef = useRef(passphrase);
  const noteRef = useRef(note);
  const saveQueueRef = useRef(Promise.resolve());

  useEffect(() => { passphraseRef.current = passphrase; }, [passphrase]);
  useEffect(() => { noteRef.current = note; }, [note]);

  const applyEncryptedNote = useCallback((encrypted: EncryptedNoteResponse, message: string) => {
    if (passphraseRef.current !== passphrase) return false;
    const plaintext = toNote(encrypted, message);
    setNote(plaintext);
    noteRef.current = plaintext;
    setNoteContent(message);
    setOriginalContent(message);
    setNoteStatus('ready');
    setRemoteUpdateAvailable(false);
    setRemoteUpdatedAt(encrypted.updated ? new Date(encrypted.updated) : null);
    return true;
  }, [passphrase, setNote, setNoteContent, setOriginalContent, setNoteStatus, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  const loadNote = useCallback(async (signal?: AbortSignal) => {
    if (passphrase.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    setIsLoadingNote(true);
    setNoteStatus('loading');
    setError(null);
    try {
      const keys = await getCryptoKeys(passphrase);
      const fetched = await fetchEncryptedNote(lookupTokenHeader(keys), signal);
      applyEncryptedNote(fetched, decryptNoteContent(fetched.ciphertext, keys));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (passphraseRef.current !== passphrase) return;
      if (error instanceof NoteNotFoundError) {
        setNote(null);
        setNoteContent('');
        setOriginalContent('');
        setNoteStatus('missing');
        return;
      }
      const message = handleApiError(error);
      setError(message);
      setNoteStatus('idle');
      Alert.alert('Error Loading Note', message);
    } finally {
      if (passphraseRef.current === passphrase) setIsLoadingNote(false);
    }
  }, [passphrase, applyEncryptedNote, setError, setIsLoadingNote, setNote, setNoteContent, setNoteStatus, setOriginalContent]);

  const silentReload = useCallback(async () => {
    if (passphrase.length < 3) return;
    try {
      const keys = await getCryptoKeys(passphrase);
      const fetched = await fetchEncryptedNote(lookupTokenHeader(keys));
      applyEncryptedNote(fetched, decryptNoteContent(fetched.ciphertext, keys));
    } catch (error) {
      if (passphraseRef.current === passphrase) setError(handleApiError(error));
    }
  }, [passphrase, applyEncryptedNote, setError]);

  const save = useCallback((message: string, force: boolean) => {
    const requestedPassphrase = passphrase;
    const task = async () => {
      if (requestedPassphrase.length < 3 || passphraseRef.current !== requestedPassphrase) return;
      setIsSavingNote(true);
      setError(null);
      try {
        const keys = await getCryptoKeys(requestedPassphrase);
        if (passphraseRef.current !== requestedPassphrase) return;
        const ciphertext = await encryptNoteContent(message, keys);
        const saved = await saveEncryptedNote(
          lookupTokenHeader(keys),
          ciphertext,
          force ? undefined : noteRef.current?.version,
        );
        if (applyEncryptedNote(saved, message)) setLastSavedAt(new Date());
      } catch (error) {
        if (passphraseRef.current !== requestedPassphrase) return;
        if (error instanceof VersionConflictError) setRemoteUpdateAvailable(true);
        const errorMessage = handleApiError(error);
        setError(errorMessage);
        Alert.alert('Error Saving Note', errorMessage);
        throw error;
      } finally {
        if (passphraseRef.current === requestedPassphrase) setIsSavingNote(false);
      }
    };
    const queued = saveQueueRef.current.then(task, task);
    saveQueueRef.current = queued.catch(() => undefined);
    return queued;
  }, [passphrase, applyEncryptedNote, setError, setIsSavingNote, setLastSavedAt, setRemoteUpdateAvailable]);

  const createNote = useCallback(async () => {
    setNoteStatus('creating');
    setError(null);
    try {
      const keys = await getCryptoKeys(passphrase);
      const ciphertext = await encryptNoteContent('', keys);
      const created = await saveEncryptedNote(lookupTokenHeader(keys), ciphertext);
      applyEncryptedNote(created, '');
    } catch (error) {
      if (passphraseRef.current !== passphrase) return;
      const message = handleApiError(error);
      setError(message);
      setNoteStatus('missing');
      Alert.alert('Could Not Create Note', message);
    }
  }, [passphrase, applyEncryptedNote, setError, setNoteStatus]);

  const recoverNote = useCallback(async () => {
    setNoteStatus('recovering');
    setError(null);
    try {
      const keys = await getCryptoKeys(passphrase);
      const hash = legacyLookupHash(passphrase);
      const legacy = await fetchLegacyNote(hash);
      const message = decryptLegacyText(legacy.ciphertext, passphrase);
      const ciphertext = await encryptNoteContent(message, keys);
      let image: { bytes: Uint8Array; metadata: string } | undefined;
      if (legacy.hasImage) {
        const oldImage = await fetchLegacyImage(hash);
        const plaintextImage = decryptLegacyRawBytes(oldImage.bytes, passphrase);
        const fileName = decryptLegacyText(oldImage.fileNameCiphertext, passphrase);
        image = {
          bytes: await encryptImageContent(plaintextImage, keys),
          metadata: await encryptImageMetadata({
            fileName,
            fileSize: plaintextImage.length,
            contentType: oldImage.contentType,
          }, keys),
        };
      }
      const imported = await importEncryptedNote(lookupTokenHeader(keys), ciphertext, image);
      const verified = await fetchEncryptedNote(lookupTokenHeader(keys));
      if (decryptNoteContent(verified.ciphertext, keys) !== message || verified.id !== imported.id) {
        throw new Error('Recovered note verification failed');
      }
      if (image) {
        const encryptedImage = await import('@/utils/api-client').then(module => module.fetchEncryptedImage(lookupTokenHeader(keys)));
        decryptImageContent(encryptedImage.bytes, keys);
        decryptImageMetadata(encryptedImage.metadata, keys);
      }
      applyEncryptedNote(verified, message);
      Alert.alert('Recovery Complete', 'Your existing note is now protected with end-to-end encryption.');
    } catch (error) {
      if (passphraseRef.current !== passphrase) return;
      const message = error instanceof NoteNotFoundError
        ? 'No existing note was found for this exact title.'
        : handleApiError(error);
      setError(message);
      setNoteStatus('missing');
      Alert.alert('Recovery Failed', message);
    }
  }, [passphrase, applyEncryptedNote, setError, setNoteStatus]);

  return {
    loadNote,
    silentReload,
    updateNote: (message: string) => save(message, false),
    forceUpdateNote: (message: string) => save(message, true),
    createNote,
    recoverNote,
    clearNote,
  };
}
