# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Secret Notes Mobile is an Expo/React Native application providing zero-knowledge encrypted note storage with image attachments. The app uses passphrase-based authentication where passphrases serve dual purposes: identity lookup (via SHA-256 hash) and encryption keys (AES-256-GCM). All encryption/decryption happens server-side.

**Backend:** Fully functional REST API at `https://secret-note-backend.lugetech.com`
**Frontend:** Expo Router v6 with TypeScript and React 19
**Key Concept:** One note per passphrase, with optional image attachment. Simple passphrases create "public" notes (shared), complex passphrases create private notes.

## Development Commands

### Starting Development
```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Start on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Linting
```bash
npm run lint
```

### TypeScript Check
```bash
npx tsc --noEmit
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=https://secret-note-backend.lugetech.com/api/secretnotes
EXPO_PUBLIC_AUTO_SAVE_DELAY_MS=1000
```

**Important:** Expo requires the `EXPO_PUBLIC_` prefix for client-accessible environment variables. These values are embedded at build time. Restart the development server after changing environment variables.

## Application Architecture

### High-Level Flow

1. **Passphrase Entry** → User enters passphrase (min 3 chars)
2. **Note Load** → GET `/notes` creates new note or retrieves existing
3. **Auto-Save** → Debounced PUT `/notes` (upsert) saves changes after 1 second of inactivity
4. **Image Management** → POST/GET/DELETE `/notes/image` for attachments

### Directory Structure

```
app/
├── (tabs)/                    # Tab-based navigation
│   ├── index.tsx             # Main note editing screen
│   └── about.tsx             # About/info screen
├── _layout.tsx               # Root layout
└── modal.tsx                 # Modal screens

components/
├── note/
│   ├── note-provider.tsx     # React Context for global note state
│   └── save-indicator.tsx    # Visual save status feedback
├── image/
│   └── image-viewer.tsx      # Full-screen image modal
├── ui/
│   ├── image-attachment-section.tsx  # Image preview/upload component
│   ├── icon-symbol.tsx       # SF Symbols wrapper
│   └── themed-*.tsx          # Theme-aware components
└── welcome-screen.tsx        # Initial landing screen

hooks/
├── use-note.ts               # Note CRUD operations (load, save)
├── use-image.ts              # Image CRUD operations (upload, load, delete)
└── use-auto-save.ts          # Debounced auto-save logic

utils/
├── api-client.ts             # All API calls with error handling
├── passphrase.ts             # Passphrase strength/validation
├── image-compression.ts      # Image compression before upload
└── format.ts                 # Formatting utilities

types.ts                      # TypeScript interfaces
```

### State Management

Uses React Context (`note-provider.tsx`) for global state:

```typescript
interface AppState {
  passphrase: string;
  passphraseVisible: boolean;
  note: NoteResponse | null;
  noteContent: string;        // Local editable copy
  originalContent: string;    // For dirty checking
  imageUri: string | null;    // Base64 data URL for display
  imageMetadata: ImageUploadResponse | null;
  isLoadingNote: boolean;
  isSavingNote: boolean;
  isLoadingImage: boolean;
  isUploadingImage: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isImageViewerOpen: boolean;
}
```

Access state via: `const { passphrase, note, ... } = useNoteContext();`

## API Integration

### Backend URL
Production: `https://secret-note-backend.lugetech.com/api/secretnotes`

### Authentication Pattern
All requests require passphrase via header:
```typescript
headers: {
  'X-Passphrase': userPassphrase,
  'Content-Type': 'application/json' // for JSON endpoints
}
```

### Key Endpoints

**GET /notes** - Load or create note
- Returns 201 if new, 200 if existing
- Auto-creates with "Welcome to your new secure note!" message

**PUT /notes** - Upsert note (recommended for saves)
- Creates OR updates in single call
- Handles race conditions better than PATCH
- Used by auto-save

**POST /notes/image** - Upload image (multipart/form-data)
- Max 10 MB file size
- Replaces existing image
- Field name must be "image"

**GET /notes/image** - Fetch image
- Returns binary blob
- Converted to base64 data URL for React Native display

**DELETE /notes/image** - Remove image

Detailed API docs: See `API_DOCUMENTATION.md`

## Critical Implementation Details

### Auto-Save Strategy
- Debounced save with 1 second delay (configurable via `EXPO_PUBLIC_AUTO_SAVE_DELAY_MS`)
- Only saves if content changed and passphrase ≥3 chars
- Uses PUT (upsert) endpoint to handle note creation/update seamlessly
- Visual feedback via `SaveIndicator` component

### Image Handling
- Images compressed before upload (see `utils/image-compression.ts`)
- Target: 1920x1920 max, 0.7 quality
- Stored as base64 data URLs in state (`imageUri`)
- FileReader API converts blob to base64 for React Native compatibility
- Thumbnail blur toggle for privacy

### Passphrase Validation
- Minimum 3 characters (enforced client and server-side)
- Strength indicator: weak (< 8), medium (8-15), strong (≥16)
- Common phrase detection warns about "public" notes (e.g., "hello", "test")
- Show/hide toggle for security

### Error Handling
- Custom `ApiError` class with status codes
- User-friendly error messages via `handleApiError()`
- Global error banner in main screen
- Network error detection (offline handling)

## Common Development Tasks

### Adding a New API Endpoint
1. Add function to `utils/api-client.ts`
2. Create custom hook in `hooks/` if needed
3. Update types in `types.ts`
4. Handle errors with `handleApiError()`

### Modifying State
1. Update `AppState` interface in `types.ts`
2. Add to `NoteContext` in `components/note/note-provider.tsx`
3. Expose via context value

### Styling
- Uses StyleSheet from React Native
- Theme-aware components: `ThemedView`, `ThemedText`
- Color schemes defined in `constants/theme.ts`
- Theme detection via `useColorScheme()` hook

## Testing Notes

### Bruno API Tests
Bruno test collection available in `bruno-tests/` directory for backend verification.

### Manual Testing Checklist
- Create new note with fresh passphrase
- Access existing note
- Edit and verify auto-save (check "Saved" indicator)
- Upload image (ensure compression progress shows)
- View full-size image in modal
- Delete image
- Test passphrase strength indicators
- Test public note warning for common phrases
- Test with passphrase < 3 chars (should show validation)
- Test offline behavior (should show network error)

## Important Constraints

### Security
- Never log passphrases in production
- Use HTTPS (backend already configured)
- Don't persist passphrases in AsyncStorage
- Blur toggle for thumbnail privacy

### Performance
- Debounced auto-save prevents excessive API calls
- Lazy image loading (only fetch if `hasImage === true`)
- Image compression before upload
- Blob URLs cleaned up on unmount

### React Native Gotchas
- Blob URLs don't work natively → use FileReader to convert to base64
- FormData format differs from web (handled in `api-client.ts`)
- `outlineStyle: 'none'` requires type assertion for TextInput

## Key Files to Review When...

**Working on note editing:**
- `app/(tabs)/index.tsx` - Main screen
- `hooks/use-note.ts` - Note operations
- `hooks/use-auto-save.ts` - Auto-save logic

**Working on images:**
- `hooks/use-image.ts` - Image operations
- `utils/image-compression.ts` - Compression logic
- `components/ui/image-attachment-section.tsx` - UI component

**Working on API calls:**
- `utils/api-client.ts` - All API functions
- `API_DOCUMENTATION.md` - Complete API reference

**Working on state:**
- `components/note/note-provider.tsx` - Global state
- `types.ts` - Type definitions

**Debugging:**
- Check Metro bundler console for errors
- Verify `.env` file exists with correct values
- Use Bruno tests to isolate frontend vs backend issues
- Check passphrase length (must be ≥3)

## Architecture Philosophy

**Why PUT (Upsert) Over PATCH:**
- Simpler error handling (no need to check if note exists)
- Fewer API calls
- Better for auto-save (handles race conditions)
- Recommended for all note saves after initial GET

**Why Context Over Redux:**
- Simple state requirements
- No complex async workflows beyond API calls
- Performance adequate for single-screen focus

**Why Base64 for Images:**
- React Native blob URL limitations
- Simpler than filesystem caching
- Adequate for single image use case
- Can optimize later if needed

## Reference Documentation

- `README.md` - Basic setup instructions
- `API_DOCUMENTATION.md` - Complete API reference with examples
- `APP_ARCHITECTURE.md` - Detailed implementation guide
- Expo docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
