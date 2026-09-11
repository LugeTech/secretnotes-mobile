# Secret Notes

**Secure, Anonymous, Encrypted Notes for Everyone.**

Secret Notes is a mobile and web application designed for storing your thoughts, passwords, or shared messages securely without the need for accounts, emails, or complicated setups.

## 🔒 How It Works

Secret Notes uses a unique **Passphrase-Driven** system. You don't create an account; you simply create a passphrase.

1.  **Enter a Passphrase**: Type in any phrase, word, or combination of characters.
2.  **Your Note Appears**:
    *   If the passphrase has never been used, a brand new blank note is created just for you.
    *   If the passphrase already exists, the note associated with it is unlocked and decrypted.
3.  **Auto-Save**: Just type. Your notes are automatically saved and encrypted as you work.

## ✨ Key Features

*   **End-to-End Encryption**: Notes, images, filenames, and media types are encrypted on your device. The server receives only a derived lookup token and authenticated ciphertext.
*   **No Sign-Ups**: No email, no phone number, no username. Just you and your passphrase.
*   **Image Attachments**: Securely attach images to your notes. They are encrypted too!
*   **Instant Sharing**: Want to share a note? Just tell someone the passphrase.
*   **Cross-Platform**: Access your notes from iOS, Android, or the Web.

## 🛡️ Security & Privacy

### The Power of Your Passphrase
Your passphrase is both your **ID** and your **Encryption Key**.

*   **Simple Passphrases (Public/Shared)**: If you use a common word like "shopping", you might land on a note used by others. This is great for quick public sharing but not for secrets.
*   **Complex Passphrases (Private)**: For true privacy, use a long, unique passphrase that only you know. The stronger the passphrase, the more secure your note.

### Important Warning
**There is no "Forgot Password" button.**
Because we don't know who you are and we can't decrypt your data, if you forget your passphrase, your note is lost forever.

## Web deployment

The web app is a static Expo export served by PM2. The production API URL is embedded during the export, so configure `.env` before building.

```bash
git pull --ff-only origin subs
pnpm install --frozen-lockfile
pnpm exec expo export --platform web --output-dir web-build
pm2 startOrReload ecosystem.config.js --update-env
pm2 save
```

The PM2 configuration serves `web-build` on port `3002`. Deploy the backend v2 routes before releasing this client. Verify the public site and `/api/health` after restarting.

---
*Simple. Secure. Secret.*
