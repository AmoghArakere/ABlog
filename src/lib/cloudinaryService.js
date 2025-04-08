// Cloudinary service for image uploads
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary with environment variables
// These should be set in your .env file or in your hosting environment
cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY || '123456789012345',
  api_secret: import.meta.env.PUBLIC_CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz12',
  secure: true
});

/**
 * Uploads an image to Cloudinary
 * 
 * @param {string} imageData - The image data URL or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadImage = async (imageData, options = {}) => {
  try {
    // If it's a data URL, upload directly
    if (imageData.startsWith('data:image')) {
      console.log('Uploading data URL to Cloudinary...');
      const result = await cloudinary.uploader.upload(imageData, {
        folder: 'ablog',
        ...options
      });
      console.log('Cloudinary upload successful:', result.secure_url);
      return result;
    }
    
    // If it's a file path, upload the file
    console.log('Uploading file to Cloudinary:', imageData);
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'ablog',
      ...options
    });
    console.log('Cloudinary upload successful:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads a profile image to Cloudinary
 * 
 * @param {string} imageData - The image data URL or file path
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadProfileImage = async (imageData, userId) => {
  try {
    if (!imageData) return null;
    
    // If it's already a Cloudinary URL, return it
    if (imageData.includes('cloudinary.com')) {
      return imageData;
    }
    
    // If it's a placeholder image, return it
    if (imageData.startsWith('/images/')) {
      return imageData;
    }
    
    const result = await uploadImage(imageData, {
      folder: 'ablog/profiles',
      public_id: `user_${userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return '/images/placeholder-profile.svg';
  }
};

/**
 * Uploads a cover image to Cloudinary
 * 
 * @param {string} imageData - The image data URL or file path
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadCoverImage = async (imageData, userId) => {
  try {
    if (!imageData) return null;
    
    // If it's already a Cloudinary URL, return it
    if (imageData.includes('cloudinary.com')) {
      return imageData;
    }
    
    // If it's a placeholder image, return it
    if (imageData.startsWith('/images/')) {
      return imageData;
    }
    
    const result = await uploadImage(imageData, {
      folder: 'ablog/covers',
      public_id: `cover_${userId}_${Date.now()}`,
      transformation: [
        { width: 1200, height: 400, crop: 'fill', gravity: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return '/images/placeholder-cover.svg';
  }
};

/**
 * Uploads a blog post image to Cloudinary
 * 
 * @param {string} imageData - The image data URL or file path
 * @param {string} postId - The post ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadPostImage = async (imageData, postId) => {
  try {
    if (!imageData) return null;
    
    // If it's already a Cloudinary URL, return it
    if (imageData.includes('cloudinary.com')) {
      return imageData;
    }
    
    // If it's a placeholder image, return it
    if (imageData.startsWith('/images/')) {
      return imageData;
    }
    
    const result = await uploadImage(imageData, {
      folder: 'ablog/posts',
      public_id: `post_${postId}_${Date.now()}`
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading post image:', error);
    return '/images/placeholder-blog.svg';
  }
};

export default {
  uploadImage,
  uploadProfileImage,
  uploadCoverImage,
  uploadPostImage
};
