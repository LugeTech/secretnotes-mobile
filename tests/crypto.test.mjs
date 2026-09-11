import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import {
  decryptBytes,
  decryptLegacyText,
  decryptText,
  deriveKeys,
  encodeBase64Url,
  encryptBytes,
  encryptText,
  legacyLookupHash,
} from '../utils/crypto-core.ts';

const nonce = Uint8Array.from({ length: 12 }, (_, index) => index);

test('derives the frozen cross-client lookup vector', async () => {
  const keys = await deriveKeys('correct horse battery staple');
  assert.equal(encodeBase64Url(keys.lookupToken), 'Mj5MkVeeTDWO8oVLa_lE0vALXTsYHpEbIAf9W4PB3EY');
});

test('round-trips empty and Unicode notes', async () => {
  const keys = await deriveKeys('exact Case 🔐');
  for (const content of ['', 'Hello, 世界 🌎']) {
    const encrypted = encryptText(content, keys.noteKey, 'note', nonce);
    assert.equal(decryptText(encrypted, keys.noteKey, 'note'), content);
  }
});

test('matches the frozen Go note ciphertext vector', async () => {
  const keys = await deriveKeys('correct horse battery staple');
  assert.equal(
    encryptText('Cross-client note ✓', keys.noteKey, 'note', nonce),
    '{"v":2,"n":"AAECAwQFBgcICQoL","c":"raCDT_nEhRPY1BNd2diOtRRKm_PtaHwZ0wJ4EUO9yAMuoHx2BQ"}',
  );
});

test('rejects wrong keys and tampering', async () => {
  const keys = await deriveKeys('first title');
  const wrongKeys = await deriveKeys('second title');
  const encrypted = encryptBytes(new TextEncoder().encode('secret'), keys.imageKey, 'image', nonce);
  assert.throws(() => decryptBytes(encrypted, wrongKeys.imageKey, 'image'));

  const tampered = { ...encrypted, c: `${encrypted.c[0] === 'A' ? 'B' : 'A'}${encrypted.c.slice(1)}` };
  assert.throws(() => decryptBytes(tampered, keys.imageKey, 'image'));
});

test('preserves exact passphrase bytes', () => {
  assert.notEqual(legacyLookupHash('Title'), legacyLookupHash('title'));
  assert.notEqual(legacyLookupHash('title'), legacyLookupHash('title '));
});

test('decrypts a legacy server vector', () => {
  assert.equal(decryptLegacyText('AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxGmIL2lY1UoeIkAaBVXHhs7VSire+lfPJLo5HrYTaU=', 'legacy-title'), 'Legacy note ✓');
});

test('API boundary cannot send plaintext credentials or content', async () => {
  const source = await readFile(new URL('../utils/api-client.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /X-Passphrase/u);
  assert.doesNotMatch(source, /passphrase/u);
  assert.doesNotMatch(source, /JSON\.stringify\(\{\s*message/u);
  assert.doesNotMatch(source, /form\.append\(['"](?:file_name|content_type)/u);
  assert.match(source, /form\.append\('image_metadata'/u);
  assert.match(source, /method: 'POST'[\s\S]*?body: JSON\.stringify\(\{ ciphertext \}\)/u);
});
