import PocketBase from 'pocketbase';
import { useEffect, useRef } from 'react';

import { useNoteContext } from '@/components/note/note-provider';
import { lookupTopicHash } from '@/utils/crypto-core';
import { getCryptoKeys, lookupTokenHeader } from '@/utils/crypto';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const PB_BASE_URL = API_BASE_URL ? new URL('/', API_BASE_URL).origin : '';
const pb = PB_BASE_URL ? new PocketBase(PB_BASE_URL) : null;

type NoteUpdate = { id: string; version: number; updated: string };

export function useRealtimeNote(onRemoteUpdate?: () => void) {
  const {
    note, passphrase, hasUnsavedChanges, setRemoteUpdateAvailable, setRemoteUpdatedAt,
  } = useNoteContext();
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);

  useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);
  useEffect(() => { onRemoteUpdateRef.current = onRemoteUpdate; }, [onRemoteUpdate]);

  useEffect(() => {
    if (!pb || !note?.id || passphrase.length < 3) return;
    let cancelled = false;
    let unsubscribe: (() => Promise<void>) | undefined;

    getCryptoKeys(passphrase).then(async keys => {
      if (cancelled) return;
      const topic = `secretnotez:v2:${lookupTopicHash(keys)}`;
      unsubscribe = await pb.realtime.subscribe(topic, (value: unknown) => {
        if (!isNoteUpdate(value)) return;
        const update = value;
        if (update.id !== note.id || update.version <= note.version) return;
        setRemoteUpdatedAt(new Date(update.updated));
        if (hasUnsavedChangesRef.current) setRemoteUpdateAvailable(true);
        else onRemoteUpdateRef.current?.();
      }, { headers: { 'X-Lookup-Token': lookupTokenHeader(keys) } });
    }).catch(error => {
      if (!cancelled) console.warn('[PB] Encrypted note subscription failed:', error);
    });

    return () => {
      cancelled = true;
      void unsubscribe?.();
    };
  }, [note?.id, note?.version, passphrase, setRemoteUpdateAvailable, setRemoteUpdatedAt]);
}

function isNoteUpdate(value: unknown): value is NoteUpdate {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<NoteUpdate>;
  return typeof candidate.id === 'string'
    && typeof candidate.version === 'number'
    && typeof candidate.updated === 'string';
}
