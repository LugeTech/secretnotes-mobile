# Secret Notes Mobile App - Architecture & Implementation Guide

## EXECUTIVE_SUMMARY

Secret Notes is an Expo/React Native mobile application providing zero-knowledge encrypted note storage with image attachment support. The app uses passphrase-based authentication where passphrases serve dual purposes: identity lookup (SHA-256 hash) and encryption keys (AES-256-GCM). No traditional user accounts exist. Notes can be public (simple passphrases) or private (complex passphrases).

**Key Technical Points:**
- Backend: Fully functional REST API at `https://secret-note-backend.lugetech.com`
- Frontend: Expo Router app with TypeScript
- No local backend required
- All encryption/decryption handled server-side
- Single note per passphrase with optional image attachment

---

## ENVIRONMENT_CONFIGURATION

### Backend URL Setup

The backend URL must be configured as an Expo public environment variable accessible at runtime.

**File:** `.env` (create in project root)
```
EXPO_PUBLIC_API_BASE_URL=https://secret-note-backend.lugetech.com/api/secretnotes
EXPO_PUBLIC_AUTO_SAVE_DELAY_MS=1000
```

**Usage in Code:**
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const AUTO_SAVE_DELAY_MS = parseInt(process.env.EXPO_PUBLIC_AUTO_SAVE_DELAY_MS || '1000', 10);
```

**Important Notes:**
- Expo requires `EXPO_PUBLIC_` prefix for public environment variables
- Variables are embedded at build time and accessible client-side
- Restart development server after adding/changing environment variables
- Never commit sensitive secrets to `.env` (this URL is public-facing so acceptable)

---

## APPLICATION_FLOW

### User Journey States

```
STATE_1_INITIAL_LOAD
├─ User opens app
├─ Passphrase input is empty
├─ Note area shows welcome placeholder text
└─ No image loaded

STATE_2_PASSPHRASE_ENTRY
├─ User types passphrase (min 3 chars)
├─ Real-time character counter updates
├─ Show/hide toggle available
└─ Validation: must be ≥3 chars before API call

STATE_3_NOTE_FETCH
├─ API Call: GET /notes with X-Passphrase header
├─ Loading indicator displays
├─ Two scenarios:
│   ├─ NEW_NOTE: 201 Created
│   │   ├─ Default message: "Welcome to your new secure note!"
│   │   ├─ hasImage: false
│   │   └─ Display in editable text area
│   └─ EXISTING_NOTE: 200 OK
│       ├─ Decrypted message content returned
│       ├─ hasImage: true/false
│       └─ Display in editable text area

STATE_4_NOTE_EDITING
├─ User edits note text in main area
├─ Changes tracked in local state
├─ Debounced auto-save (discussed below)
└─ Manual save option available

STATE_5_NOTE_SAVING
├─ API Call: PUT /notes (upsert endpoint)
├─ Payload: { "message": "updated content" }
├─ Header: X-Passphrase
├─ Response: Updated note object
└─ Update local state with response

STATE_6_IMAGE_MANAGEMENT
├─ If hasImage === true:
│   ├─ API Call: GET /notes/image
│   ├─ Response: Binary blob
│   ├─ Create blob URL for display
│   └─ Show in ImageAttachmentSection
├─ Upload new image:
│   ├─ User selects image from device
│   ├─ API Call: POST /notes/image (multipart/form-data)
│   ├─ Field name: "image"
│   ├─ Response: File metadata
│   └─ Reload note to update hasImage flag
└─ Delete image:
    ├─ API Call: DELETE /notes/image
    ├─ Response: Success message
    └─ Update UI to remove image display
```

---

## API_INTEGRATION_STRATEGY

### Authentication Pattern

**All requests (except health check) require passphrase via header:**
```typescript
headers: {
  'X-Passphrase': userPassphrase,
  'Content-Type': 'application/json' // for JSON endpoints
}
```

**Critical:** Passphrase must be ≥3 characters. Validate client-side before API calls.

---

### Endpoint Usage Mapping

#### ENDPOINT_1: Get or Create Note
**When:** Initial note load when user enters passphrase
**Method:** GET
**URL:** `/notes`
**Headers:** `X-Passphrase: {passphrase}`
**Response Scenarios:**
- 201 Created: New note with default welcome message
- 200 OK: Existing note with decrypted content
- 400 Bad Request: Invalid passphrase (< 3 chars)

**TypeScript Interface:**
```typescript
interface NoteResponse {
  id: string;
  message: string;
  hasImage: boolean;
  created: string; // ISO 8601
  updated: string; // ISO 8601
}
```

**Usage:**
```typescript
async function fetchNote(passphrase: string): Promise<NoteResponse> {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'GET',
    headers: { 'X-Passphrase': passphrase }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch note');
  }
  
  return await response.json();
}
```

---

#### ENDPOINT_2: Upsert Note (RECOMMENDED)
**When:** Saving note edits
**Method:** PUT
**URL:** `/notes`
**Headers:** 
- `X-Passphrase: {passphrase}`
- `Content-Type: application/json`
**Body:**
```json
{
  "message": "Updated note content here"
}
```

**Why Upsert (PUT) Over Patch:**
- Handles both create and update in single call
- Reduces API round trips
- No need to check if note exists before updating
- Simpler state management
- Recommended for note editing workflow

**Response:** Same `NoteResponse` interface as GET

**Usage:**
```typescript
async function saveNote(passphrase: string, message: string): Promise<NoteResponse> {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Passphrase': passphrase
    },
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save note');
  }
  
  return await response.json();
}
```

---

#### ENDPOINT_3: Upload Image
**When:** User attaches image to note
**Method:** POST
**URL:** `/notes/image`
**Headers:** `X-Passphrase: {passphrase}`
**Content-Type:** `multipart/form-data` (set automatically by FormData)
**Body:** FormData with field name "image"

**TypeScript Interface:**
```typescript
interface ImageUploadResponse {
  message: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  fileHash: string;
  created: string | null;
  updated: string | null;
}
```

**Usage with Expo ImagePicker:**
```typescript
import * as ImagePicker from 'expo-image-picker';

async function uploadImage(passphrase: string): Promise<ImageUploadResponse> {
  // Request permissions
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error('Camera roll permission required');
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    base64: false
  });

  if (result.canceled) {
    throw new Error('Image selection cancelled');
  }

  // Create FormData
  const asset = result.assets[0];
  const formData = new FormData();
  
  // React Native FormData format
  formData.append('image', {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || 'photo.jpg'
  } as any);

  // Upload
  const response = await fetch(`${API_BASE_URL}/notes/image`, {
    method: 'POST',
    headers: { 'X-Passphrase': passphrase },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return await response.json();
}
```

**Important Notes:**
- Maximum file size: 10 MB (server-side limit)
- Replaces existing image (one image per note)
- After upload, call GET /notes again to refresh hasImage flag
- Supported formats: All common image formats (JPEG, PNG, GIF, WebP)

---

#### ENDPOINT_4: Get Image
**When:** Displaying attached image
**Method:** GET
**URL:** `/notes/image`
**Headers:** `X-Passphrase: {passphrase}`
**Response:** Binary blob with headers:
- `Content-Type`: image MIME type
- `Content-Disposition`: original filename

**Usage:**
```typescript
async function fetchImage(passphrase: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/notes/image`, {
    method: 'GET',
    headers: { 'X-Passphrase': passphrase }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No image found');
    }
    throw new Error('Failed to fetch image');
  }

  const blob = await response.blob();
  
  // For React Native, convert to base64 or use blob URL
  // Option 1: Create blob URL (web-compatible)
  return URL.createObjectURL(blob);
  
  // Option 2: For native, might need different approach
  // Check hasImage flag before calling this
}
```

**Optimization:** Only fetch image if `hasImage === true` in note response

---

#### ENDPOINT_5: Delete Image
**When:** User removes image attachment
**Method:** DELETE
**URL:** `/notes/image`
**Headers:** `X-Passphrase: {passphrase}`
**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

**Usage:**
```typescript
async function deleteImage(passphrase: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notes/image`, {
    method: 'DELETE',
    headers: { 'X-Passphrase': passphrase }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }
}
```

**After deletion:** Update local state to remove image display

---

## STATE_MANAGEMENT_STRATEGY

### Recommended State Structure

```typescript
interface AppState {
  // Authentication
  passphrase: string;
  passphraseVisible: boolean;
  
  // Note data
  note: NoteResponse | null;
  noteContent: string; // Local editable copy
  originalContent: string; // For dirty checking
  
  // Image data
  imageUri: string | null; // Blob URL for display
  imageMetadata: ImageUploadResponse | null;
  
  // UI states
  isLoadingNote: boolean;
  isSavingNote: boolean;
  isLoadingImage: boolean;
  isUploadingImage: boolean;
  error: string | null;
  
  // Auto-save tracking
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}
```

### State Management Options

**Option 1: React Context + Hooks (Recommended for this app)**
- Create `NoteContext` for global note state
- Custom hooks: `useNote()`, `useImage()`
- Good for small-medium apps with simple state

**Option 2: Zustand (Lightweight alternative)**
- Simple store management
- No boilerplate
- Good for this use case

**Option 3: Redux Toolkit (Overkill for this app)**
- More complexity than needed
- Recommended if app grows significantly

**Recommendation:** Start with React Context, migrate to Zustand if complexity increases.

---

## AUTO_SAVE_IMPLEMENTATION

### Strategy: Debounced Auto-Save

**Problem:** Saving on every keystroke causes excessive API calls and poor UX.

**Solution:** Debounced save with visual feedback.

```typescript
import { useEffect, useRef } from 'react';

function useAutoSave(
  noteContent: string,
  passphrase: string,
  onSave: (content: string) => Promise<void>
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef(noteContent);

  useEffect(() => {
    // Don't auto-save if content hasn't changed
    if (noteContent === previousContentRef.current) return;
    
    // Don't auto-save if passphrase is invalid
    if (passphrase.length < 3) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout (configurable delay after last keystroke)
    const autoSaveDelay = parseInt(process.env.EXPO_PUBLIC_AUTO_SAVE_DELAY_MS || '1000', 10);
    timeoutRef.current = setTimeout(async () => {
      await onSave(noteContent);
      previousContentRef.current = noteContent;
    }, autoSaveDelay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [noteContent, passphrase, onSave]);
}
```

**Usage in Component:**
```typescript
const [noteContent, setNoteContent] = useState('');
const [isSaving, setIsSaving] = useState(false);

const handleSave = async (content: string) => {
  setIsSaving(true);
  try {
    await saveNote(passphrase, content);
    // Show "Saved" indicator
  } catch (error) {
    // Show error toast
  } finally {
    setIsSaving(false);
  }
};

useAutoSave(noteContent, passphrase, handleSave);
```

**UX Enhancement:**
- Show "Saving..." when `isSaving === true`
- Show "Saved at HH:MM" after successful save
- Show "Unsaved changes" if dirty

---

## COMPONENT_ARCHITECTURE

### Recommended Component Structure

```
app/
├── (tabs)/
│   └── index.tsx              # Main screen (already exists)
├── _layout.tsx                # Root layout
components/
├── note/
│   ├── note-provider.tsx      # Context provider for note state
│   ├── passphrase-input.tsx   # Extracted passphrase input with controls
│   ├── note-editor.tsx        # Text editing area with auto-save
│   └── save-indicator.tsx     # Visual save status feedback
├── image/
│   ├── image-attachment-section.tsx  # Already exists, enhance
│   ├── image-picker-button.tsx       # Upload trigger
│   └── image-viewer.tsx              # Full-size image view
├── ui/
│   ├── themed-view.tsx        # Already exists
│   ├── themed-text.tsx        # Already exists
│   └── icon-symbol.tsx        # Already exists
hooks/
├── use-note.ts                # Note CRUD operations
├── use-image.ts               # Image CRUD operations
├── use-auto-save.ts           # Auto-save logic
└── use-debounce.ts            # Generic debounce utility
utils/
├── api-client.ts              # Centralized API calls
├── validation.ts              # Passphrase & input validation
└── error-handler.ts           # Consistent error handling
```

### Component Responsibilities

**1. PassphraseInput**
- Accept user input
- Show/hide toggle
- Character counter
- Validation feedback
- Emit passphrase changes

**2. NoteEditor**
- Multiline text input
- Auto-save integration
- Placeholder text
- Character/word count (optional)
- Scroll to bottom on new content

**3. ImageAttachmentSection**
- Display image thumbnail (if exists)
- Show "Add Image" button (if no image)
- Show "Delete" option (if image exists)
- Loading states during upload/delete
- Error display

**4. SaveIndicator**
- "Saving..." during save
- "Saved at HH:MM" after success
- "Unsaved changes" if dirty
- Auto-hide after 3 seconds

---

## ERROR_HANDLING_STRATEGY

### Error Categories

**1. Validation Errors (Client-Side)**
- Passphrase too short (< 3 chars)
- Empty message on save (allow empty, show warning)
- Image too large (> 10 MB, check before upload)

**2. Network Errors**
- No internet connection
- Request timeout
- Server unreachable

**3. API Errors (4xx)**
- 400 Bad Request: Invalid data
- 404 Not Found: Resource doesn't exist

**4. Server Errors (5xx)**
- 500 Internal Server Error: Backend issue
- Encryption/decryption failures

### Error Handling Implementation

```typescript
// utils/error-handler.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    if (error.message.includes('Network request failed')) {
      return 'No internet connection. Please check your network.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

// Usage with Toast/Alert
async function loadNote(passphrase: string) {
  try {
    const note = await fetchNote(passphrase);
    setNote(note);
  } catch (error) {
    const message = handleApiError(error);
    Alert.alert('Error', message);
  }
}
```

---

## SECURITY_CONSIDERATIONS

### Client-Side Security Best Practices

**1. Passphrase Handling**
- Never log passphrases to console in production
- Clear passphrase from memory on app background (optional, UX trade-off)
- Don't persist passphrase in AsyncStorage (security risk)
- Show passphrase strength indicator

**2. HTTPS Enforcement**
- Backend uses HTTPS (already configured)
- All API calls go over secure connection
- Certificate validation handled by native HTTP clients

**3. Sensitive Data Display**
- Implement "Show/Hide" toggle for passphrase (already in UI)
- Consider biometric unlock for saved passphrases (future enhancement)
- Blur/hide content when app goes to background (optional)

**4. Decryption Failures**
- Wrong passphrase = cannot decrypt
- Treat as authentication failure
- Show user-friendly error: "Unable to access note. Check your passphrase."

---

## PERFORMANCE_OPTIMIZATIONS

### Image Optimization

**1. Compression Before Upload**
```typescript
await ImagePicker.launchImageLibraryAsync({
  quality: 0.8, // 80% quality, reduces file size
  allowsEditing: true, // Allow cropping
});
```

**2. Lazy Image Loading**
- Only fetch image if `hasImage === true`
- Show placeholder while loading
- Cache blob URL to avoid re-fetching

**3. Image Memory Management**
```typescript
// Clean up blob URLs when component unmounts
useEffect(() => {
  return () => {
    if (imageUri) {
      URL.revokeObjectURL(imageUri);
    }
  };
}, [imageUri]);
```

### API Call Optimization

**1. Debounced Auto-Save**
- Configurable delay (default: 1 second) after last keystroke
- Prevents excessive PUT requests

**2. Request Caching**
- Cache note data in component state
- Only refetch on passphrase change or explicit refresh

**3. Conditional Image Fetch**
```typescript
if (note.hasImage && !imageUri) {
  fetchImage(passphrase);
}
```

---

## USER_EXPERIENCE_ENHANCEMENTS

### Visual Feedback

**1. Loading States**
- Skeleton loaders for note content
- Spinner during image upload
- Progress indicator for large images

**2. Success Feedback**
- Green checkmark on successful save
- Toast notification for image upload
- "Saved at HH:MM" timestamp

**3. Error Feedback**
- Red error banner for API failures
- Inline validation messages
- Retry button for failed operations

### Passphrase UX

**1. Strength Indicator**
```typescript
function getPassphraseStrength(passphrase: string): 'weak' | 'medium' | 'strong' {
  if (passphrase.length < 8) return 'weak';
  if (passphrase.length < 16) return 'medium';
  return 'strong';
}
```

**2. Public Note Warning**
```typescript
const commonPhrases = ['hello', 'test', 'public', 'password'];
if (commonPhrases.includes(passphrase.toLowerCase())) {
  showWarning('This is a public note. Anyone with this passphrase can access it.');
}
```

### Collaborative Features (Public Notes)

**1. Pull-to-Refresh**
- Reload note content on pull gesture
- Show last updated timestamp
- Useful for shared public notes

**2. Conflict Detection**
```typescript
// Before saving, check if note was updated by another user
if (note.updated !== lastFetchedTimestamp) {
  showAlert('This note was updated by someone else. Reload to see changes?');
}
```

---

## TESTING_STRATEGY

### Unit Tests

**Test Coverage:**
1. API client functions (fetch/save/upload/delete)
2. Validation functions (passphrase length, image size)
3. Auto-save debounce logic
4. Error handling utilities

**Example:**
```typescript
// __tests__/api-client.test.ts
describe('fetchNote', () => {
  it('should fetch note with valid passphrase', async () => {
    const note = await fetchNote('test-passphrase-123');
    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('message');
  });

  it('should throw error for short passphrase', async () => {
    await expect(fetchNote('ab')).rejects.toThrow();
  });
});
```

### Integration Tests

**Test Scenarios:**
1. Complete flow: Enter passphrase → Load note → Edit → Save
2. Image upload flow: Select image → Upload → Display
3. Error recovery: Network error → Retry → Success

### Manual Testing Checklist

- [ ] Create new note with fresh passphrase
- [ ] Access existing note with known passphrase
- [ ] Edit and save note content
- [ ] Upload image to note
- [ ] View uploaded image
- [ ] Delete image from note
- [ ] Test with various passphrase lengths (3, 10, 50 chars)
- [ ] Test with special characters in passphrase
- [ ] Test with large image (near 10 MB limit)
- [ ] Test network error scenarios (airplane mode)
- [ ] Test public note collaboration (same passphrase on two devices)
- [ ] Verify auto-save timing (configurable delay after typing stops)
- [ ] Check "Saved" indicator appears after auto-save

---

## IMPLEMENTATION_CHECKLIST

### Phase 1: Core Setup
- [ ] Create `.env` file with `EXPO_PUBLIC_API_BASE_URL`
- [ ] Install required dependencies: `expo-image-picker`
- [ ] Create `utils/api-client.ts` with all API functions
- [ ] Create TypeScript interfaces for API responses

### Phase 2: State Management
- [ ] Create `NoteContext` provider
- [ ] Implement `useNote()` hook
- [ ] Implement `useImage()` hook
- [ ] Add error handling to all API calls

### Phase 3: UI Components
- [ ] Refactor passphrase input into separate component
- [ ] Implement note editor with auto-save
- [ ] Enhance image attachment section
- [ ] Add save indicator component

### Phase 4: Features
- [ ] Implement GET /notes on passphrase entry
- [ ] Implement PUT /notes (upsert) for saving
- [ ] Implement POST /notes/image for uploads
- [ ] Implement GET /notes/image for display
- [ ] Implement DELETE /notes/image

### Phase 5: Polish
- [ ] Add loading states for all operations
- [ ] Add error handling and user feedback
- [ ] Implement auto-save with debouncing
- [ ] Add passphrase strength indicator
- [ ] Add public note warning

### Phase 6: Testing
- [ ] Test all API endpoints with Bruno collection
- [ ] Test edge cases (empty notes, large images)
- [ ] Test error scenarios (network failures)
- [ ] Test on both iOS and Android

---

## DEBUGGING_TIPS

**1. API Request Inspection**
```typescript
// Add logging middleware
async function fetchWithLogging(url: string, options: RequestInit) {
  console.log('Request:', { url, ...options });
  const response = await fetch(url, options);
  console.log('Response:', response.status, await response.text());
  return response;
}
```

**2. Expo Development Tools**
- Use Expo DevTools to inspect network requests
- Check console for errors in Metro bundler
- Use React DevTools for component state inspection

**3. Bruno Tests**
- Use Bruno collection to verify backend behavior
- Compare app requests to working Bruno requests
- Isolate whether issue is frontend or backend

**4. Common Issues**
- **"Passphrase too short"**: Ensure ≥3 characters
- **CORS errors**: Should not occur (backend configured), but check headers
- **Image upload fails**: Verify FormData format for React Native
- **Decryption fails**: Wrong passphrase or corrupted data

---

## FUTURE_ENHANCEMENTS

**Short-Term:**
1. Offline support with AsyncStorage cache
2. Biometric authentication for saved passphrases
3. Rich text formatting (bold, italic, lists)
4. Multiple image attachments
5. Note export (PDF, text file)

**Medium-Term:**
1. Real-time collaboration via WebSockets
2. Note history/versioning
3. Tags and categories
4. Search within notes
5. Dark mode implementation (placeholder exists)

**Long-Term:**
1. End-to-end encrypted sync across devices
2. Shared notes with permissions
3. Voice note attachments
4. Drawing/sketch attachments
5. Desktop companion app

---

## CRITICAL_IMPLEMENTATION_NOTES

### Why PUT (Upsert) Over PATCH

**Problem:** User edits note immediately after passphrase entry. Note might not exist yet.

**Traditional Approach:**
1. GET /notes (create if not exists)
2. User edits
3. PATCH /notes (update existing)
4. If 404: Handle error, call POST instead

**Upsert Approach:**
1. GET /notes (create if not exists)
2. User edits
3. PUT /notes (create OR update automatically)
4. No error handling for "not exists"

**Benefits:**
- Fewer API calls
- Simpler error handling
- No race conditions
- More reliable auto-save

**Recommendation:** Use PUT (upsert) for all note saves after initial GET.

### Passphrase State Management

**Don't persist passphrase:**
- Security risk if device compromised
- User expects to re-enter on app restart
- AsyncStorage not encrypted on all platforms

**Do provide convenience:**
- Keep passphrase in memory during session
- Clear on app background (configurable)
- Consider biometric unlock (future)

### Image Display Strategy

**React Native gotcha:** Blob URLs don't work the same as web.

**Solution 1: Base64 (Simple, memory-intensive)**
```typescript
const base64 = await response.base64();
<Image source={{ uri: `data:image/jpeg;base64,${base64}` }} />
```

**Solution 2: File System (Efficient, complex)**
```typescript
import * as FileSystem from 'expo-file-system';
const path = FileSystem.cacheDirectory + 'note-image.jpg';
await FileSystem.writeAsStringAsync(path, base64, {
  encoding: FileSystem.EncodingType.Base64
});
<Image source={{ uri: path }} />
```

**Recommendation:** Start with base64, optimize later if needed.

---

## CONCLUSION

This architecture document provides a complete blueprint for implementing the Secret Notes mobile app. The key principles are:

1. **Simplicity:** Use upsert endpoint to reduce complexity
2. **Security:** Handle passphrases carefully, use HTTPS
3. **Performance:** Debounce auto-save, lazy-load images
4. **UX:** Provide clear feedback for all operations
5. **Reliability:** Comprehensive error handling

Follow the implementation checklist sequentially, test each phase before moving to the next, and refer to the API documentation for specific endpoint details.

**Next Steps:**
1. Set up environment variables
2. Create API client utility
3. Implement note loading on passphrase entry
4. Add auto-save functionality
5. Enhance image handling

Good luck with implementation! 🚀
