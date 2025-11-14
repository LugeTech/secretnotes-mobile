import { useEffect, useRef } from 'react';

const AUTO_SAVE_DELAY_MS = parseInt(
  process.env.EXPO_PUBLIC_AUTO_SAVE_DELAY_MS || '1000',
  10
);

export function useAutoSave(
  content: string,
  passphrase: string,
  onSave: (content: string) => Promise<void>,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef(content);

  useEffect(() => {
    if (!enabled) return;
    
    if (content === previousContentRef.current) return;
    
    if (passphrase.length < 3) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(async () => {
      await onSave(content);
      previousContentRef.current = content;
    }, AUTO_SAVE_DELAY_MS) as unknown as NodeJS.Timeout;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, passphrase, onSave, enabled]);
}
