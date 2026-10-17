import { gcm } from '@noble/ciphers/aes.js';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { sha256 } from '@noble/hashes/sha2.js';

const PROTOCOL_SALT = utf8ToBytes('secretnotez/e2ee/v2');
const SCRYPT_N = 65_536;
const SCRYPT_R = 8;
const SCRYPT_P = 2;
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;

const PURPOSES = {
  lookup: utf8ToBytes('secretnotez:v2:lookup'),
  note: utf8ToBytes('secretnotez:v2:note'),
  image: utf8ToBytes('secretnotez:v2:image'),
  imageMetadata: utf8ToBytes('secretnotez:v2:image-metadata'),
} as const;

export type CryptoKeys = Readonly<{
  lookupToken: Uint8Array;
  noteKey: Uint8Array;
  imageKey: Uint8Array;
  imageMetadataKey: Uint8Array;
}>;

export type EncryptedEnvelope = Readonly<{
  v: 2;
  n: string;
  c: string;
}>;

export type ImageMetadata = Readonly<{
  fileName: string;
  fileSize: number;
  contentType: string;
}>;

export async function deriveKeys(passphrase: string): Promise<CryptoKeys> {
  const root = await scryptAsync(utf8ToBytes(passphrase), PROTOCOL_SALT, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    dkLen: KEY_LENGTH,
    asyncTick: 8,
    maxmem: 128 << 20,
  });

  const keys = {
    lookupToken: derivePurposeKey(root, PURPOSES.lookup),
    noteKey: derivePurposeKey(root, PURPOSES.note),
    imageKey: derivePurposeKey(root, PURPOSES.image),
    imageMetadataKey: derivePurposeKey(root, PURPOSES.imageMetadata),
  };
  root.fill(0);
  return keys;
}

export function encryptBytes(
  plaintext: Uint8Array,
  key: Uint8Array,
  purpose: keyof typeof PURPOSES,
  nonce: Uint8Array,
): EncryptedEnvelope {
  if (nonce.length !== NONCE_LENGTH) {
    throw new Error('Encryption nonce must be 12 bytes');
  }
  const ciphertext = gcm(key, nonce, PURPOSES[purpose]).encrypt(plaintext);
  return { v: 2, n: encodeBase64Url(nonce), c: encodeBase64Url(ciphertext) };
}

export function decryptBytes(
  envelope: string | EncryptedEnvelope,
  key: Uint8Array,
  purpose: keyof typeof PURPOSES,
): Uint8Array {
  const parsed = parseEnvelope(envelope);
  try {
    return gcm(key, decodeBase64Url(parsed.n), PURPOSES[purpose]).decrypt(
      decodeBase64Url(parsed.c),
    );
  } catch {
    throw new Error('Encrypted content could not be authenticated');
  }
}

export function encryptText(
  plaintext: string,
  key: Uint8Array,
  purpose: 'note' | 'imageMetadata',
  nonce: Uint8Array,
): string {
  return JSON.stringify(encryptBytes(utf8ToBytes(plaintext), key, purpose, nonce));
}

export function decryptText(
  envelope: string,
  key: Uint8Array,
  purpose: 'note' | 'imageMetadata',
): string {
  return bytesToUtf8(decryptBytes(envelope, key, purpose));
}

export function decryptLegacyBytes(encodedCiphertext: string, passphrase: string): Uint8Array {
  return decryptLegacyRawBytes(decodeBase64(encodedCiphertext), passphrase);
}

export function decryptLegacyRawBytes(encrypted: Uint8Array, passphrase: string): Uint8Array {
  if (encrypted.length < 16 + NONCE_LENGTH + 16) {
    throw new Error('Legacy encrypted content is malformed');
  }
  const salt = encrypted.slice(0, 16);
  const nonce = encrypted.slice(16, 16 + NONCE_LENGTH);
  const ciphertext = encrypted.slice(16 + NONCE_LENGTH);
  const key = pbkdf2(sha256, utf8ToBytes(passphrase), salt, { c: 10_000, dkLen: KEY_LENGTH });
  try {
    return gcm(key, nonce).decrypt(ciphertext);
  } catch {
    throw new Error('The existing note could not be recovered with this title');
  } finally {
    key.fill(0);
  }
}

export function decryptLegacyText(encodedCiphertext: string, passphrase: string): string {
  return bytesToUtf8(decryptLegacyBytes(encodedCiphertext, passphrase));
}

export function legacyLookupHash(passphrase: string): string {
  return Array.from(sha256(utf8ToBytes(passphrase)), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function lookupTopicHash(keys: CryptoKeys): string {
  return Array.from(sha256(keys.lookupToken), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function serializeMetadata(metadata: ImageMetadata): string {
  return JSON.stringify(metadata);
}

export function parseMetadata(value: string): ImageMetadata {
  const parsed: unknown = JSON.parse(value);
  if (!isObject(parsed)) {
    throw new Error('Encrypted image metadata is malformed');
  }
  const { fileName, fileSize, contentType } = parsed;
  if (typeof fileName !== 'string' || typeof fileSize !== 'number' || typeof contentType !== 'string') {
    throw new Error('Encrypted image metadata is malformed');
  }
  return { fileName, fileSize, contentType };
}

export function encodeBase64Url(value: Uint8Array): string {
  return encodeBase64(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

export function decodeBase64Url(value: string): Uint8Array {
  const standard = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (standard.length % 4)) % 4);
  return decodeBase64(standard + padding);
}

export function encodeBase64(value: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < value.length; index += 1) {
    binary += String.fromCharCode(value[index]);
  }
  return btoa(binary);
}

export function decodeBase64(value: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(value);
  } catch {
    throw new Error('Encrypted content is not valid base64');
  }
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function derivePurposeKey(root: Uint8Array, purpose: Uint8Array): Uint8Array {
  return hkdf(sha256, root, PROTOCOL_SALT, purpose, KEY_LENGTH);
}

function parseEnvelope(value: string | EncryptedEnvelope): EncryptedEnvelope {
  const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
  if (!isObject(parsed) || parsed.v !== 2 || typeof parsed.n !== 'string' || typeof parsed.c !== 'string') {
    throw new Error('Encrypted content uses an unsupported format');
  }
  const nonce = decodeBase64Url(parsed.n);
  const ciphertext = decodeBase64Url(parsed.c);
  if (nonce.length !== NONCE_LENGTH || ciphertext.length < 16) {
    throw new Error('Encrypted content is malformed');
  }
  return { v: 2, n: parsed.n, c: parsed.c };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
