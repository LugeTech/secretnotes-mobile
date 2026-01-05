import { useEffect, useRef } from 'react';
import EventSource from 'react-native-event-source';

import { useNoteContext } from '@/components/note/note-provider';

type PBMessageEvent = { data: string };

// Derive PocketBase realtime URL from the configured API base.
// EXPO_PUBLIC_API_BASE_URL is like https://pb.secretnotez.com/api/secretnotes
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const REALTIME_URL = API_BASE_URL ? new URL('/api/realtime', API_BASE_URL).toString() : '';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useRealtimeNote() {
  const {
    note,
    passphrase,
    remoteUpdatedAt,
    setRemoteUpdateAvailable,
    setRemoteUpdatedAt,
  } = useNoteContext();

  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last update timestamp we set locally to filter self-triggered events
  const lastLocalUpdateRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!REALTIME_URL) return;
    if (!note?.id) return;
    if (passphrase.length < 3) return;

    const source = new EventSource(REALTIME_URL);
    eventSourceRef.current = source;

    const handleConnect = async (event: PBMessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const clientId = data.clientId as string | undefined;
        if (!clientId) return;
        clientIdRef.current = clientId;

        // Subscribe to this specific note record
        await fetch(REALTIME_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            subscriptions: [`notes/${note.id}`],
          }),
        });
      } catch (error) {
        console.warn('Realtime connect/subscribe failed', error);
      }
    };

    const handleEvent = (event: PBMessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        const { record } = payload || {};
        if (!record?.id) return;
        if (record.id !== note.id) return; // extra guard

        if (record.updated) {
          const serverUpdated = new Date(record.updated);
          // Filter out self-triggered events: if the server timestamp matches
          // what we just set locally (within 2 seconds), ignore it.
          if (lastLocalUpdateRef.current) {
            const diff = Math.abs(serverUpdated.getTime() - lastLocalUpdateRef.current.getTime());
            if (diff < 2000) {
              // This is likely our own save, ignore
              return;
            }
          }
          setRemoteUpdatedAt(serverUpdated);
        }
        setRemoteUpdateAvailable(true);
      } catch (error) {
        console.warn('Realtime event parse failed', error);
      }
    };

    source.addEventListener('PB_CONNECT', handleConnect as any);
    source.addEventListener('PB_EVENT', handleEvent as any);
    source.addEventListener('error', (err: any) => {
      console.warn('Realtime SSE error', err);
      // Attempt reconnection on error
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        console.log(`SSE reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
        source.close();
        reconnectTimeoutRef.current = setTimeout(() => {
          // Re-run effect by closing and letting cleanup trigger
          eventSourceRef.current = null;
        }, RECONNECT_DELAY_MS * reconnectAttemptsRef.current);
      }
    });

    // Reset reconnect counter on successful connection
    reconnectAttemptsRef.current = 0;

    return () => {
      source.close();
      eventSourceRef.current = null;
      clientIdRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [note?.id, passphrase, setRemoteUpdateAvailable, setRemoteUpdatedAt]);

  // Keep lastLocalUpdateRef in sync with remoteUpdatedAt set by our own saves
  useEffect(() => {
    if (remoteUpdatedAt) {
      lastLocalUpdateRef.current = remoteUpdatedAt;
    }
  }, [remoteUpdatedAt]);
}
