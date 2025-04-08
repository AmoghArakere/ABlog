// Cloudinary client-side service for image uploads
// This version uses the Cloudinary Upload Widget instead of the server-side SDK

/**
 * Uploads an image to Cloudinary using the Upload Widget
 * 
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadImageWithWidget = (options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary script is already loaded
    if (!window.cloudinary) {
      reject(new Error('Cloudinary widget not loaded'));
      return;
    }

    const uploadOptions = {
      cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
      uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
      sources: ['local', 'url', 'camera'],
      multiple: false,
      cropping: options.cropping !== false,
      croppingAspectRatio: options.aspectRatio || 1,
      maxFileSize: 5000000, // 5MB
      folder: options.folder || 'ablog',
      ...options,
      styles: {
        palette: {
          window: "#000000",
          sourceBg: "#222222",
          windowBorder: "#555555",
          tabIcon: "#FFFFFF",
          inactiveTabIcon: "#AAAAAA",
          menuIcons: "#CCCCCC",
          link: "#8A46F0",
          action: "#8A46F0",
          inProgress: "#8A46F0",
          complete: "#33ff00",
          error: "#EA2727",
          textDark: "#000000",
          textLight: "#FFFFFF"
        }
      }
    };

    const widget = window.cloudinary.createUploadWidget(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
          return;
        }

        if (result && result.event === 'success') {
          const imageUrl = result.info.secure_url;
          console.log('Cloudinary upload successful:', imageUrl);
          resolve(imageUrl);
        } else if (result && result.event === 'close') {
          // User closed the widget without uploading
          reject(new Error('Upload cancelled'));
        }
      }
    );

    widget.open();
  });
};

/**
 * Uploads a profile image to Cloudinary
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadProfileImage = (userId) => {
  return uploadImageWithWidget({
    folder: 'ablog/profiles',
    public_id: `user_${userId}_${Date.now()}`,
    cropping: true,
    croppingAspectRatio: 1,
    gravity: 'face',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }
    ]
  });
};

/**
 * Uploads a cover image to Cloudinary
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadCoverImage = (userId) => {
  return uploadImageWithWidget({
    folder: 'ablog/covers',
    public_id: `cover_${userId}_${Date.now()}`,
    cropping: true,
    croppingAspectRatio: 3,
    gravity: 'auto',
    transformation: [
      { width: 1200, height: 400, crop: 'fill', gravity: 'auto' }
    ]
  });
};

/**
 * Uploads a blog post image to Cloudinary
 * 
 * @param {string} postId - The post ID
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadPostImage = (postId) => {
  return uploadImageWithWidget({
    folder: 'ablog/posts',
    public_id: `post_${postId}_${Date.now()}`,
    cropping: true,
    croppingAspectRatio: 16/9
  });
};

export default {
  uploadImageWithWidget,
  uploadProfileImage,
  uploadCoverImage,
  uploadPostImage
};
