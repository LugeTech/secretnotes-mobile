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

export function useRealtimeNote() {
  const {
    note,
    passphrase,
    remoteUpdatedAt,
    setRemoteUpdateAvailable,
    setRemoteUpdatedAt,
  } = useNoteContext();

  // Track the last update timestamp we set locally to filter self-triggered events
  const lastLocalUpdateRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!pb) {
      console.log('[PB] No PocketBase URL configured');
      return;
    }
    if (!note?.id) {
      console.log('[PB] No note.id yet');
      return;
    }
    if (passphrase.length < 3) {
      console.log('[PB] Passphrase too short');
      return;
    }

    console.log('[PB] Subscribing to notes collection, filtering for note:', note.id);

    // Subscribe to all changes in the notes collection
    // We filter client-side for our specific note
    const unsubscribePromise = pb.collection('notes').subscribe('*', (e: RecordSubscription<Record<string, unknown>>) => {
      console.log('[PB] Event received:', e.action, e.record?.id);
      
      // Filter to only our note
      if (e.record?.id !== note.id) {
        console.log('[PB] Event for different note, ignoring');
        return;
      }

      console.log('[PB] Event matches our note!');
      
      if (e.record?.updated) {
        const serverUpdated = new Date(e.record.updated as string);
        // Filter out self-triggered events: if the server timestamp matches
        // what we just set locally (within 2 seconds), ignore it.
        if (lastLocalUpdateRef.current) {
          const diff = Math.abs(serverUpdated.getTime() - lastLocalUpdateRef.current.getTime());
          if (diff < 2000) {
            console.log('[PB] Ignoring self-triggered event (timestamp match)');
            return;
          }
        }
        setRemoteUpdatedAt(serverUpdated);
      }
      
      console.log('[PB] Setting remoteUpdateAvailable = true');
      setRemoteUpdateAvailable(true);
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
      // Also try collection-level unsubscribe
      pb.collection('notes').unsubscribe('*').catch(() => {});
    };
  }, [note?.id, passphrase, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  // Keep lastLocalUpdateRef in sync with remoteUpdatedAt set by our own saves
  useEffect(() => {
    if (remoteUpdatedAt) {
      lastLocalUpdateRef.current = remoteUpdatedAt;
    }
  }, [remoteUpdatedAt]);
}
