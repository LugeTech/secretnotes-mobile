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
    if (!REALTIME_URL) {
      console.log('[SSE] No REALTIME_URL configured');
      return;
    }
    if (!note?.id) {
      console.log('[SSE] No note.id yet');
      return;
    }
    if (passphrase.length < 3) {
      console.log('[SSE] Passphrase too short');
      return;
    }

    console.log('[SSE] Connecting to:', REALTIME_URL);
    const source = new EventSource(REALTIME_URL);
    eventSourceRef.current = source;

    const handleConnect = async (event: PBMessageEvent) => {
      try {
        console.log('[SSE] PB_CONNECT received:', event.data);
        const data = JSON.parse(event.data);
        const clientId = data.clientId as string | undefined;
        if (!clientId) {
          console.warn('[SSE] No clientId in connect event');
          return;
        }
        clientIdRef.current = clientId;

        // Subscribe to the entire notes collection (not individual record)
        // PocketBase uses "notes" for collection, "notes/ID" for single record
        const subscription = 'notes'; // Subscribe to all notes changes
        console.log('[SSE] Subscribing with clientId:', clientId, 'to:', subscription);
        
        const response = await fetch(REALTIME_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            subscriptions: [subscription],
          }),
        });
        console.log('[SSE] Subscribe response status:', response.status);
      } catch (error) {
        console.warn('[SSE] Realtime connect/subscribe failed', error);
      }
    };

    const handleEvent = (event: PBMessageEvent) => {
      try {
        console.log('[SSE] PB_EVENT received:', event.data);
        const payload = JSON.parse(event.data);
        const { record } = payload || {};
        if (!record?.id) {
          console.log('[SSE] No record.id in event');
          return;
        }
        // Filter to only our note
        if (record.id !== note.id) {
          console.log('[SSE] Event for different note:', record.id, 'vs', note.id);
          return;
        }

        console.log('[SSE] Event matches our note!');
        if (record.updated) {
          const serverUpdated = new Date(record.updated);
          // Filter out self-triggered events: if the server timestamp matches
          // what we just set locally (within 2 seconds), ignore it.
          if (lastLocalUpdateRef.current) {
            const diff = Math.abs(serverUpdated.getTime() - lastLocalUpdateRef.current.getTime());
            if (diff < 2000) {
              console.log('[SSE] Ignoring self-triggered event (timestamp match)');
              return;
            }
          }
          setRemoteUpdatedAt(serverUpdated);
        }
        console.log('[SSE] Setting remoteUpdateAvailable = true');
        setRemoteUpdateAvailable(true);
      } catch (error) {
        console.warn('[SSE] Realtime event parse failed', error);
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
        try {
          source.close();
        } catch {
          // Ignore close errors on web
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          // Re-run effect by closing and letting cleanup trigger
          eventSourceRef.current = null;
        }, RECONNECT_DELAY_MS * reconnectAttemptsRef.current);
      }
    });

    // Reset reconnect counter on successful connection
    reconnectAttemptsRef.current = 0;

    return () => {
      try {
        source.close();
      } catch {
        // Ignore close errors - can happen on web if connection not fully initialized
      }
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
