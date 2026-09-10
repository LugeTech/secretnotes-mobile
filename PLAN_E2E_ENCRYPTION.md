# Execution Plan — End-to-End Encryption

**Status:** planned, not started
**Goal:** move key derivation and encryption onto the device, so the server stores blobs it cannot read.

---

## Where we are

After migration `006` deploys, the public database hole is closed, but the trust model is unchanged:

- The title is sent in the `X-Passphrase` header on every request.
- The server derives the key from it, decrypts the note, and returns plaintext.
- The server can read every note and image.

The app copy now states this honestly. This plan is how we make the stronger claim true.

## Where we're going

- The title never leaves the device.
- The server stores an opaque envelope and an opaque lookup token.
- The server cannot decrypt, ever.

---

## Design

### Key schedule — one slow hash, split two ways

```
root     = Argon2id(title, APP_SALT, m=64MB, t=3, p=1)
T_lookup = HKDF(root, info="lookup", 32)   -> SENT to server
K_enc    = HKDF(root, info="enc",    32)   -> NEVER leaves device
```

HKDF is one-way: holding `T_lookup` reveals nothing about `K_enc`. The server gets a meaningless
tag to find the row by, and a key it never sees.

`APP_SALT` is a fixed app-wide constant. It must be constant, because the same title has to
produce the same token forever, or the note can never be found again.

### Envelope format

```json
{ "v": 2, "kdf": { "alg": "argon2id", "m": 65536, "t": 3, "p": 1 },
  "iv": "<base64, 12 bytes>", "ct": "<base64, ciphertext+tag>" }
```

Stored in the existing `message` text column. KDF parameters travel with the note so they can be
changed later without losing access to old notes.

### Why the lookup token is stronger

`T_lookup` is Argon2id output rather than a fast hash of the title. That means an offline guess
costs real time and memory per attempt, so weak titles stop falling in bulk. Derived from the
title alone, never stored in recoverable form.

---

## Phase 1 — Benchmark (blocking gate)

**Nothing else starts until this number exists.**

Argon2id at 64MB is deliberately slow, and Hermes is not fast at pure-JS crypto. If a derivation
takes ~2s, typing a title feels broken and we must change parameters or move to native before
building on top of the choice.

| Device class | Good | Acceptable | Too slow |
|---|---|---|---|
| Modern iPhone | < 300ms | < 800ms | > 800ms |
| Mid-range Android | < 500ms | < 1200ms | > 1200ms |

If too slow, in order of preference:
1. Lower memory to 32MB / t=2.
2. `react-native-quick-crypto` (native, JSI) — dev builds already supported via `expo run:ios`.
3. PBKDF2-SHA256 at 600k iterations — weaker against GPU/ASIC, so last resort.

**Deliverable:** measured ms per derivation on at least one real device, plus the chosen parameters.
**Rollback:** none needed — measurement only.

## Phase 2 — Client crypto module (ships dark)

`utils/crypto.ts`: `deriveKeys`, `encryptNote`, `decryptNote`, `encryptImage`, `decryptImage`.
Pure functions, no wiring, no behaviour change.

**Verification:** round-trip tests; known-answer vectors; tamper detection (flip a byte, expect
failure, never silent garbage); correct title vs wrong title; empty and 20KB payloads.
**Rollback:** delete the file — nothing imports it yet.

## Phase 3 — Realtime replacement

Migration `006` breaks PocketBase realtime, because subscriptions require the collection to be
viewable by the client. Replace it with a small custom SSE endpoint on the Go backend that emits
only `{ id, updated }`, authorized by the lookup token. No content, no title, no hash.

This survives Phase 4 unchanged, because the payload never carries note content — the client
refetches and decrypts locally.

*Alternative if this is deferred:* soften the realtime wording in the app copy.

## Phase 4 — Backend dual-mode

- Add `crypto_version` to `notes` and `encrypted_files` (1 = legacy server-side, 2 = client E2E).
- Add `lookup_token`; keep `phrase_hash` during the transition.
- Accept `X-Lookup-Token` **in addition to** `X-Passphrase`.
- Write path: if the body carries a `v2` envelope, store it **verbatim** — never encrypt it. This
  is the change that makes the server unable to decrypt.
- Read path: `crypto_version = 2` → return the envelope untouched. `= 1` → legacy decrypt.

**Verification:** v2 store and return is byte-identical; v1 notes still load; unauthenticated
collection access still 403; app still loads and saves.
**Rollback:** revert the commit; existing data is untouched because the write path is additive.

## Phase 5 — Client dual-mode + lazy upgrade

Client reads either format, decrypts locally, and writes v2 on save. A v1 note upgrades the first
time it is opened and saved — no bulk job, no user action, no re-entering titles.

**Verification:** open a v1 note, save, confirm `crypto_version` flips to 2 and content round-trips.
**Rollback:** keep writing v1 — the read path handles both.

## Phase 6 — Copy flip

Only now can the app claim end-to-end encryption. Must include the weak-title caveat plainly:
whoever steals the lookup token can still guess titles offline, cheaply for obvious ones.

## Phase 7 — Retire v1

Delete the legacy decrypt path, the `X-Passphrase` support, the server-side encryption code, and the
`phrase_hash` column. Irreversible — do last, after old clients have aged out.

---

## ⚠️ The risk that decides the schedule: old app versions

We cannot force users to update. An installed old client still sends the title.

The failure: a new client upgrades a note to v2, then the old client opens it. The server can no
longer decrypt, so the old client gets garbage or an error instead of its own note.

Options:

| Approach | Trade-off |
|---|---|
| **Hard break** — server returns a clear "update the app" error for v1 requests against v2 notes | Simple, honest; old clients genuinely blocked on migrated notes |
| **Delay upgrades** — ship the new client first, wait for adoption, then enable v2 writes | No breakage; slow, and adoption is unmeasurable |
| **Shadow copy** — keep a server-encrypted copy during the transition | No breakage, but **the server can still read notes**, so it defeats the point |

Recommendation: **hard break**, with a delayed v2-write switch so the new client is in the wild first.
The shadow copy is listed only so it can be consciously rejected.

---

## Decisions needed before Phase 4

1. **Realtime** — build the SSE endpoint (Phase 3), or soften the copy for now?
2. **Old clients** — hard break, or accept delay?
3. **KDF parameters** — depends on the Phase 1 number.
4. **Where `APP_SALT` lives** — a constant in the client is fine, but it is then public, so it must
   not be treated as a secret. Argon2id's work factor is what protects titles.

## Known risks

- Argon2id too slow on Hermes (Phase 1 exists to find this out early).
- Base64 inflates payloads ~33%; a 20KB note becomes ~27KB.
- Encrypting images in memory on low-end devices.
- Realtime stays broken between deploying `006` and shipping Phase 3.
- Old clients on migrated notes (above).
- Losing the title means losing the note permanently — already true, but now with no server-side
  recovery path at all. State it clearly in the copy.
