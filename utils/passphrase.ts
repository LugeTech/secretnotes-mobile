export type PassphraseStrength = 'weak' | 'medium' | 'strong';

const COMMON_PHRASES = [
  'hello',
  'test',
  'public',
  'password',
  'demo',
  '123',
  'abc',
  'temp',
];

export function getPassphraseStrength(passphrase: string): PassphraseStrength {
  if (passphrase.length < 6) return 'weak';
  if (passphrase.length < 12) return 'medium';
  return 'strong';
}

export function isCommonPhrase(passphrase: string): boolean {
  const lower = passphrase.toLowerCase();
  return COMMON_PHRASES.some(phrase => lower.includes(phrase));
}

export function getPassphraseColor(strength: PassphraseStrength): string {
  switch (strength) {
    case 'weak':
      return '#ef4444'; // Red-500
    case 'medium':
      return '#f59e0b'; // Amber-500
    case 'strong':
      return '#10b981'; // Emerald-500
  }
}
