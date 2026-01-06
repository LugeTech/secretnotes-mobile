import PocketBase, { RecordSubscription } from 'pocketbase';
import { useEffect, useRef } from 'react';

import { useNoteContext } from '@/components/note/note-provider';

// Derive PocketBase base URL from the configured API base.
// EXPO_PUBLIC_API_BASE_URL is like https://pb.secretnotez.com/api/secretnotes
// PocketBase SDK needs the root URL: https://pb.secretnotez.com
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const PB_BASE_URL = API_BASE_URL ? new URL('/', API_BASE_URL).origin : '';

// Create a single PocketBase instance
const pb = PB_BASE_URL ? new PocketBase(PB_BASE_URL) : null;

export function useRealtimeNote(onRemoteUpdate?: () => void) {
  const {
    note,
    passphrase,
    remoteUpdatedAt,
    hasUnsavedChanges,
    setRemoteUpdateAvailable,
    setRemoteUpdatedAt,
  } = useNoteContext();

  // Keep hasUnsavedChanges in a ref so the SSE callback always has the latest value
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [onRemoteUpdate]);

  // Track the last update timestamp we set locally to filter self-triggered events
  const lastLocalUpdateRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!pb) {
      return;
    }
    if (!note?.id) {
      return;
    }
    if (passphrase.length < 3) {
      return;
    }

    // Subscribe to changes for this specific note only (server-side filtering)
    const unsubscribePromise = pb.collection('notes').subscribe(note.id, (e: RecordSubscription<Record<string, unknown>>) => {
      
      if (e.record?.updated) {
        const serverUpdated = new Date(e.record.updated as string);
        // Filter out self-triggered events: if the server timestamp matches
        // what we just set locally (within 2 seconds), ignore it.
        if (lastLocalUpdateRef.current) {
          const diff = Math.abs(serverUpdated.getTime() - lastLocalUpdateRef.current.getTime());
          if (diff < 2000) {
            return;
          }
        }
        setRemoteUpdatedAt(serverUpdated);
      }
      
      // Only show banner if user has local changes; otherwise just trigger silent update
      if (hasUnsavedChangesRef.current) {
        setRemoteUpdateAvailable(true);
      } else {
        onRemoteUpdateRef.current?.();
      }
    }).catch((err) => {
      console.warn('[PB] Subscribe failed:', err);
    });

    return () => {
      // Unsubscribe when effect cleans up
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }).catch(() => {
        // Ignore unsubscribe errors
      });
      // Also try record-level unsubscribe
      pb.collection('notes').unsubscribe(note.id).catch(() => {});
    };
  }, [note?.id, passphrase, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  // Keep lastLocalUpdateRef in sync with remoteUpdatedAt set by our own saves
  useEffect(() => {
    if (remoteUpdatedAt) {
      lastLocalUpdateRef.current = remoteUpdatedAt;
    }
  }, [remoteUpdatedAt]);
}
