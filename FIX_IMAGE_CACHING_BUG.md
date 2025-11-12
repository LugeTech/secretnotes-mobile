# Fix: Image Viewer Caching Bug

## Issue
When opening the image viewer modal and closing it, the image would remain displayed in the thumbnail with a "stuck" appearance. The image would only disappear when clearing the passphrase.

## Root Cause
The `expo-image` component was aggressively caching the base64 data URI. When the viewer modal closed, the Image component continued to display the cached version, making it appear as if the image was "stuck" on screen.

## Solution Implemented
Added `cachePolicy="none"` to both Image components:

### 1. Thumbnail Image (ImageAttachmentSection)
```tsx
<Image
  source={thumbnailUri || undefined}
  style={styles.thumbnail}
  contentFit="cover"
  cachePolicy="none"  // ← Prevents aggressive caching
/>
```

### 2. Full-Size Image (ImageViewer)
```tsx
<Image
  source={{ uri: imageUri }}
  style={styles.image}
  contentFit="contain"
  cachePolicy="none"  // ← Prevents aggressive caching
/>
```

## Why This Works
- `cachePolicy="none"` tells expo-image to not cache the image data
- Each time the component renders, it uses the current URI without cached data
- When the viewer closes, the thumbnail re-renders with fresh data
- No "stuck" image appearance

## Files Modified
- `components/ui/image-attachment-section.tsx`
- `components/image/image-viewer.tsx`

## Testing Steps
1. ✅ Open a note with an image
2. ✅ Click the image thumbnail to open full-screen viewer
3. ✅ Close the viewer with X button
4. ✅ Verify thumbnail displays correctly (not "stuck")
5. ✅ Open viewer again - should work normally
6. ✅ Close and repeat - no issues
7. ✅ Clear passphrase - image disappears as expected
8. ✅ Re-enter passphrase - image loads fresh

## Alternative Solutions Considered

### Option 1: Clear imageUri on viewer close
**Pros:** Simple state management
**Cons:** Forces unnecessary re-fetch from server, poor UX (image disappears and reloads)

### Option 2: Use key prop to force remount
**Pros:** Keeps imageUri in state
**Cons:** More complex, unnecessary re-mounting overhead

### Option 3: Cache policy (Chosen)
**Pros:** Simple, performant, direct solution to caching issue
**Cons:** None - this is the recommended approach for base64 URIs

## Performance Impact
- **Minimal**: Base64 data URIs are already in memory
- **No network calls**: Images are not re-fetched from server
- **Smooth UX**: No flickering or loading delays

## Related Components
- ImageAttachmentSection: Thumbnail display
- ImageViewer: Full-screen modal viewer
- expo-image: Image rendering library with cache control

---

**Status**: ✅ Fixed and tested  
**Impact**: Low-risk change, single property addition  
**Breaking Changes**: None
