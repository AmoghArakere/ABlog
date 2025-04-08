// Helper functions for handling images

/**
 * Processes an image data URL to ensure it can be stored in localStorage
 * This function handles potential size issues with large images
 *
 * @param {string} imageDataUrl - The data URL of the image
 * @param {number} maxSize - Maximum size in bytes (default: 1MB)
 * @returns {string} - Processed image data URL
 */
export const processImageForStorage = async (imageDataUrl, maxSize = 1024 * 1024) => {
  if (!imageDataUrl) {
    console.log('processImageForStorage: No image data provided');
    return null;
  }

  // If it's a URL to an external image or a placeholder, return as is
  if (imageDataUrl.startsWith('http') || imageDataUrl.startsWith('/images/')) {
    console.log('processImageForStorage: External URL or placeholder, returning as is');
    return imageDataUrl;
  }

  // For data URLs, ensure they're not too large
  if (imageDataUrl.length > maxSize) {
    console.warn(`Image is too large (${imageDataUrl.length} bytes) for reliable localStorage storage. Compressing...`);
    try {
      const compressed = await compressImage(imageDataUrl);
      console.log(`Compressed image from ${imageDataUrl.length} to ${compressed.length} bytes`);
      return compressed;
    } catch (error) {
      console.error('Error compressing image:', error);
      return imageDataUrl; // Return original if compression fails
    }
  }

  console.log(`Image size is acceptable: ${imageDataUrl.length} bytes`);
  return imageDataUrl;
};

/**
 * Compresses an image data URL to reduce its size
 *
 * @param {string} dataUrl - The data URL to compress
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Compressed data URL
 */
const compressImage = (dataUrl, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();

      // Set a timeout in case the image loading hangs
      const timeout = setTimeout(() => {
        console.error('Image loading timed out');
        reject(new Error('Image loading timed out'));
      }, 5000); // 5 second timeout

      img.onerror = (err) => {
        clearTimeout(timeout);
        console.error('Failed to load image for compression:', err);
        reject(new Error('Failed to load image for compression'));
      };

      img.onload = function() {
        clearTimeout(timeout);
        this.onload = null; // Prevent potential memory leaks

        try {
          // Create a canvas element
          const canvas = document.createElement('canvas');

          // Calculate new dimensions (max 800px width/height)
          let width = img.width;
          let height = img.height;
          const maxDimension = 800;

          console.log(`Original image dimensions: ${width}x${height}`);

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          console.log(`Resized dimensions: ${width}x${height}`);

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with reduced quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          console.log(`Compression complete. Original size: ${Math.round(dataUrl.length/1024)}KB, Compressed: ${Math.round(compressedDataUrl.length/1024)}KB`);
          resolve(compressedDataUrl);
        } catch (err) {
          console.error('Error during canvas operations:', err);
          reject(err);
        }
      };

      img.src = dataUrl;
    } catch (err) {
      console.error('Error in compressImage:', err);
      reject(err);
    }
  });
};

/**
 * Gets the appropriate image URL for display
 * Handles fallbacks for missing or invalid images
 *
 * @param {string} imageUrl - The image URL to process
 * @param {string} fallbackUrl - Fallback URL if image is missing
 * @returns {string} - Final image URL to use
 */
export const getImageUrl = (imageUrl, fallbackUrl = '/images/placeholder-profile.svg') => {
  if (!imageUrl) {
    console.log(`getImageUrl: No image URL provided, using fallback: ${fallbackUrl}`);
    return fallbackUrl;
  }

  // If it's already a URL or a data URL, return as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
    // For data URLs, check if they're valid
    if (imageUrl.startsWith('data:image/')) {
      // Very basic validation - check if it has a reasonable length
      if (imageUrl.length < 100) {
        console.warn(`getImageUrl: Data URL seems invalid (too short: ${imageUrl.length} chars), using fallback`);
        return fallbackUrl;
      }
    }
    return imageUrl;
  }

  // If it's a relative path, ensure it starts with /
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }

  return imageUrl;
};

/**
 * Checks if an image URL is valid and accessible
 *
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - Whether the image is valid
 */
export const isImageValid = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    // Data URLs are considered valid without checking
    if (url.startsWith('data:image/')) {
      resolve(true);
      return;
    }

    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = url;
  });
};
