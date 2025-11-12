# Image Viewer Feature

## Overview
Added a full-screen image viewer modal that allows users to view and save encrypted images from their notes.

---

## Features Implemented

### 1. **Full-Screen Image Viewer**
- Opens when clicking on image thumbnail in note
- Black background with semi-transparent header
- Image displays at full size with proper aspect ratio
- Modal overlay that can be dismissed

### 2. **Image Controls**

#### Save Button
- Downloads image to device photo library
- Handles both base64 data URIs and regular URIs
- Creates "Secret Notes" album automatically
- Shows success/error alerts
- Requests media library permissions

#### Close Button
- Closes the viewer and returns to note
- Uses X icon for clear UX

### 3. **Replace Image (Instead of Delete)**
- Changed from "delete" to "replace" pattern
- Click image thumbnail → view full image
- Click ↻ (refresh icon) → pick new image to replace
- More intuitive workflow

---

## User Flow

```
Before:
[Thumbnail] [×Delete]

After:
[Thumbnail - Click to View] [↻Replace]
       ↓
[Full Screen Viewer]
  - Save to gallery
  - Close
```

---

## Technical Implementation

### New Files Created

**`components/image/image-viewer.tsx`**
- Full-screen modal component
- Save functionality with expo-media-library
- Base64 → file conversion
- Permission handling

### Modified Files

**`components/ui/image-attachment-section.tsx`**
- Changed `onRemove` → `onReplace`
- Made thumbnail clickable (opens viewer)
- Replace button (↻) instead of delete (×)

**`components/note/note-provider.tsx`**
- Added `isImageViewerOpen` state
- Added `setIsImageViewerOpen` setter

**`app/(tabs)/index.tsx`**
- Integrated ImageViewer modal
- Wired up open/close handlers
- onPress → opens viewer
- onReplace → picks new image

**`hooks/use-image.ts`**
- Removed `removeImage` (no longer needed)
- Keep only upload and load functions

---

## Dependencies Added

```bash
npm install expo-media-library expo-file-system
```

**`expo-media-library`** - Save images to photo gallery  
**`expo-file-system`** - Write base64 to temp files

---

## Permissions Required

### iOS (info.plist)
- Photo Library Usage Description
- Photo Library Additions Usage Description

### Android (AndroidManifest.xml)
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

*Note: Expo handles these automatically when using expo-media-library*

---

## How It Works

### Viewing Images
1. User clicks image thumbnail
2. `setIsImageViewerOpen(true)` opens modal
3. Modal displays full-size image with controls
4. User can close with X button

### Saving Images
1. User clicks "Save" in viewer
2. Request media library permissions
3. Convert base64 data URI to temp file
4. Create asset in media library
5. Create/add to "Secret Notes" album
6. Clean up temp file
7. Show success alert

### Replacing Images
1. User clicks ↻ on thumbnail
2. Opens image picker (existing flow)
3. Uploads new image (replaces old one server-side)
4. Refreshes note and loads new image

---

## Key Design Decisions

### Why Replace Instead of Delete?
- Simpler UX: "view or replace" vs "view, delete, then upload"
- Server already handles replacement on upload
- Reduces number of operations user needs to understand
- Aligns with "one image per note" model

### Why Save Button in Viewer?
- Natural place for download action
- User sees full image before saving
- Follows common photo viewer patterns
- Prevents accidental saves from thumbnail view

### Why Not Pinch-to-Zoom?
- Can be added later if needed
- Image scales to fit screen automatically
- contentFit="contain" ensures full image visible
- Future enhancement: use react-native-gesture-handler

---

## Testing Checklist

- [x] Image thumbnail clickable
- [x] Viewer opens on thumbnail click
- [x] Full-size image displays correctly
- [x] Close button works
- [x] Save button requests permissions
- [x] Save button downloads to gallery
- [x] "Secret Notes" album created
- [x] Replace button opens picker
- [x] Replace uploads new image
- [x] No lint errors
- [x] Works with base64 data URIs

---

## Future Enhancements

### Potential Features
- ✨ Pinch-to-zoom with react-native-gesture-handler
- ✨ Swipe to close gesture
- ✨ Share button (share encrypted image)
- ✨ Image info overlay (size, type, date)
- ✨ Double-tap to zoom
- ✨ Multiple images per note (gallery view)

### Known Limitations
- One image per note (by design)
- No zoom controls (contentFit handles it)
- Album creation may fail silently on some devices (non-critical)

---

## Summary

The image viewer provides a complete, intuitive experience for viewing and saving encrypted images. The replace-instead-of-delete pattern simplifies the UX and aligns with the app's one-image-per-note model. All functionality works seamlessly with the existing encrypted note infrastructure.
