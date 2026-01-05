import { useEffect, useRef } from 'react';

const AUTO_SAVE_DELAY_MS = parseInt(
  process.env.EXPO_PUBLIC_AUTO_SAVE_DELAY_MS || '1000',
  10
);

export function useAutoSave(
  content: string,
  passphrase: string,
  onSave: (content: string) => Promise<void>,
  enabled: boolean = true,
  originalContent?: string // When this changes (e.g., after reload), sync our baseline
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef(content);

  // Sync baseline when originalContent changes (e.g., after server reload)
  // This prevents autosave from triggering when we just loaded fresh content
  useEffect(() => {
    if (originalContent !== undefined) {
      previousContentRef.current = originalContent;
    }
  }, [originalContent]);

  useEffect(() => {
    if (!enabled) return;
    
    if (content === previousContentRef.current) return;
    
    if (passphrase.length < 3) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(async () => {
      try {
        await onSave(content);
        previousContentRef.current = content;
      } catch {
        // Intentionally swallow errors to prevent uncaught promise rejections.
        // The caller (e.g., useNote/updateNote) is responsible for user-visible error handling.
      }
    }, AUTO_SAVE_DELAY_MS) as unknown as NodeJS.Timeout;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, passphrase, onSave, enabled]);
}
