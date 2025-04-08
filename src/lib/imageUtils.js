// Helper functions for handling images

/**
 * Processes an image data URL to ensure it can be stored in localStorage
 * This function handles potential size issues with large images
 * 
 * @param {string} imageDataUrl - The data URL of the image
 * @param {number} maxSize - Maximum size in bytes (default: 1MB)
 * @returns {string} - Processed image data URL
 */
export const processImageForStorage = (imageDataUrl, maxSize = 1024 * 1024) => {
  if (!imageDataUrl) return null;
  
  // If it's a URL to an external image or a placeholder, return as is
  if (imageDataUrl.startsWith('http') || imageDataUrl.startsWith('/images/')) {
    return imageDataUrl;
  }
  
  // For data URLs, ensure they're not too large
  if (imageDataUrl.length > maxSize) {
    console.warn('Image is too large for reliable localStorage storage. Compressing...');
    return compressImage(imageDataUrl);
  }
  
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
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      
      // Calculate new dimensions (max 800px width/height)
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;
      
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with reduced quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      console.error('Failed to load image for compression');
      resolve('/images/placeholder-profile.svg');
    };
    
    img.src = dataUrl;
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
  if (!imageUrl) return fallbackUrl;
  
  // If it's already a URL or a data URL, return as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // If it's a relative path, ensure it starts with /
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }
  
  return imageUrl;
};
