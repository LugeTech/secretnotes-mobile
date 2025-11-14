import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionResult {
  uri: string;
  size: number;
  format: string;
  compressed: boolean;
  originalSize?: number;
  compressionRatio?: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
  compressOnlyIfLargerThan?: number; // in bytes
}

const DEFAULT_OPTIONS: Required<Omit<CompressionOptions, 'format' | 'compressOnlyIfLargerThan'>> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
};

const COMPRESSION_THRESHOLDS = [
  { size: 5 * 1024 * 1024, quality: 0.6 }, // 5MB -> 60% quality
  { size: 3 * 1024 * 1024, quality: 0.7 }, // 3MB -> 70% quality
  { size: 2 * 1024 * 1024, quality: 0.8 }, // 2MB -> 80% quality
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB hard limit

export async function getImageSize(uri: string): Promise<{ width: number; height: number; size?: number }> {
  try {
    const info = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });

    // Try to get file size
    const response = await fetch(uri);
    const blob = await response.blob();

    // Extract dimensions from the manipulated image info or use a default
    return {
      width: info.width || 1024,
      height: info.height || 1024,
      size: blob.size
    };
  } catch (error) {
    console.warn('Could not get image info:', error);
    return { width: 1024, height: 1024 };
  }
}

function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

function getOptimalQuality(fileSize: number): number {
  for (const threshold of COMPRESSION_THRESHOLDS) {
    if (fileSize > threshold.size) {
      return threshold.quality;
    }
  }
  return DEFAULT_OPTIONS.quality;
}

function determineFormat(mimeType?: string): ImageManipulator.SaveFormat {
  if (mimeType) {
    if (mimeType.includes('png')) return ImageManipulator.SaveFormat.PNG;
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return ImageManipulator.SaveFormat.JPEG;
    if (mimeType.includes('webp')) return ImageManipulator.SaveFormat.WEBP;
  }
  return ImageManipulator.SaveFormat.JPEG; // Default to JPEG for better compression
}

export async function compressImage(
  uri: string,
  options: CompressionOptions = {},
  mimeType?: string
): Promise<CompressionResult> {
  const {
    maxWidth = DEFAULT_OPTIONS.maxWidth,
    maxHeight = DEFAULT_OPTIONS.maxHeight,
    quality: baseQuality = DEFAULT_OPTIONS.quality,
    format = determineFormat(mimeType),
    compressOnlyIfLargerThan = 2 * 1024 * 1024, // 2MB
  } = options;

  try {
    // Get original image info
    const { width: originalWidth, height: originalHeight, size: originalSize } = await getImageSize(uri);

    // Validate file size
    if (originalSize && originalSize > MAX_FILE_SIZE) {
      throw new Error(`Image size ${(originalSize / (1024 * 1024)).toFixed(1)}MB exceeds maximum allowed size of ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`);
    }

    // Check if compression is needed
    if (originalSize && originalSize <= compressOnlyIfLargerThan) {
      return {
        uri,
        size: originalSize,
        format: mimeType || 'image/jpeg',
        compressed: false,
      };
    }

    // Calculate new dimensions
    const { width, height } = calculateResizeDimensions(originalWidth, originalHeight, maxWidth, maxHeight);

    // Determine optimal quality based on file size
    const optimalQuality = originalSize ? getOptimalQuality(originalSize) : baseQuality;

    // Perform compression with progressive fallback
    const compressionAttempts = [
      { quality: optimalQuality, width, height },
      { quality: Math.max(0.4, optimalQuality - 0.2), width: Math.max(800, width * 0.8), height: Math.max(800, height * 0.8) },
      { quality: 0.4, width: Math.max(600, width * 0.6), height: Math.max(600, height * 0.6) },
    ];

    for (let i = 0; i < compressionAttempts.length; i++) {
      const attempt = compressionAttempts[i];

      try {
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: attempt.width, height: attempt.height } }],
          {
            format,
            compress: attempt.quality,
            base64: false,
          }
        );

        // Get compressed file size
        const response = await fetch(result.uri);
        const blob = await response.blob();
        const compressedSize = blob.size;

        // Calculate compression ratio
        const compressionRatio = originalSize ? compressedSize / originalSize : 1;

        console.log(`Compression attempt ${i + 1}: ${originalSize ? (originalSize / (1024 * 1024)).toFixed(2) + 'MB' : 'Unknown'} -> ${(compressedSize / (1024 * 1024)).toFixed(2)}MB (${(compressionRatio * 100).toFixed(1)}%)`);

        // If this is a good result or it's the last attempt, return it
        if (i === compressionAttempts.length - 1 || compressedSize <= MAX_FILE_SIZE) {
          return {
            uri: result.uri,
            size: compressedSize,
            format: format === ImageManipulator.SaveFormat.JPEG ? 'image/jpeg' :
                   format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/webp',
            compressed: true,
            originalSize,
            compressionRatio,
          };
        }
      } catch (attemptError) {
        console.warn(`Compression attempt ${i + 1} failed:`, attemptError);

        // If this isn't the last attempt, try the next one
        if (i < compressionAttempts.length - 1) {
          continue;
        }

        throw attemptError;
      }
    }

    throw new Error('All compression attempts failed');
  } catch (error) {
    console.error('Image compression failed:', error);

    // Return original image as fallback
    return {
      uri,
      size: 0, // Unknown size
      format: mimeType || 'image/jpeg',
      compressed: false,
    };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return 'Unknown size';

  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)}MB`;
  }

  const kb = bytes / 1024;
  return `${kb.toFixed(0)}KB`;
}

export function getCompressionSummary(result: CompressionResult): string {
  if (!result.compressed || !result.originalSize) {
    return `Original size: ${formatFileSize(result.size)}`;
  }

  const savedBytes = result.originalSize - result.size;
  const savedPercent = (savedBytes / result.originalSize) * 100;

  return `Compressed: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.size)} (saved ${savedPercent.toFixed(0)}%)`;
}