import * as Crypto from 'expo-crypto';

import {
  CryptoKeys,
  decryptBytes,
  decryptText,
  deriveKeys,
  encodeBase64Url,
  encryptBytes,
  encryptText,
  ImageMetadata,
  parseMetadata,
  serializeMetadata,
} from '@/utils/crypto-core';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';

let activePassphrase: string | null = null;
let activeKeys: CryptoKeys | null = null;
let pendingKeys: Promise<CryptoKeys> | null = null;
let generation = 0;

export async function getCryptoKeys(passphrase: string): Promise<CryptoKeys> {
  if (activePassphrase === passphrase && activeKeys) {
    return activeKeys;
  }
  if (activePassphrase === passphrase && pendingKeys) {
    return pendingKeys;
  }

  clearCryptoKeys();
  activePassphrase = passphrase;
  const requestGeneration = generation;
  pendingKeys = deriveKeys(passphrase);

  try {
    const keys = await pendingKeys;
    if (requestGeneration !== generation || activePassphrase !== passphrase) {
      clearKeys(keys);
      throw new Error('Title changed while preparing encryption');
    }
    activeKeys = keys;
    return keys;
  } finally {
    if (requestGeneration === generation) {
      pendingKeys = null;
    }
  }
}

export function clearCryptoKeys(): void {
  generation += 1;
  activePassphrase = null;
  pendingKeys = null;
  if (activeKeys) {
    clearKeys(activeKeys);
    activeKeys = null;
  }
}

export async function encryptNoteContent(content: string, keys: CryptoKeys): Promise<string> {
  return encryptText(content, keys.noteKey, 'note', await Crypto.getRandomBytesAsync(12));
}

export function decryptNoteContent(ciphertext: string, keys: CryptoKeys): string {
  return decryptText(ciphertext, keys.noteKey, 'note');
}

export async function encryptImageContent(content: Uint8Array, keys: CryptoKeys): Promise<Uint8Array> {
  const envelope = encryptBytes(content, keys.imageKey, 'image', await Crypto.getRandomBytesAsync(12));
  return utf8ToBytes(JSON.stringify(envelope));
}

export function decryptImageContent(content: Uint8Array, keys: CryptoKeys): Uint8Array {
  return decryptBytes(bytesToUtf8(content), keys.imageKey, 'image');
}

export async function encryptImageMetadata(metadata: ImageMetadata, keys: CryptoKeys): Promise<string> {
  return encryptText(
    serializeMetadata(metadata),
    keys.imageMetadataKey,
    'imageMetadata',
    await Crypto.getRandomBytesAsync(12),
  );
}

export function decryptImageMetadata(ciphertext: string, keys: CryptoKeys): ImageMetadata {
  return parseMetadata(decryptText(ciphertext, keys.imageMetadataKey, 'imageMetadata'));
}

export function lookupTokenHeader(keys: CryptoKeys): string {
  return encodeBase64Url(keys.lookupToken);
}

function clearKeys(keys: CryptoKeys): void {
  keys.lookupToken.fill(0);
  keys.noteKey.fill(0);
  keys.imageKey.fill(0);
  keys.imageMetadataKey.fill(0);
}
