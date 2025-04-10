import React, { useState, useEffect, useRef } from 'react';

export default function CloudinaryUploader({ onImageSelect, buttonText = "Upload Image", initialImage = null, aspectRatio = 1, imageType = "profile", uniqueId = Math.random().toString(36).substring(7) }) {
  console.log(`Initializing CloudinaryUploader for ${imageType} with uniqueId: ${uniqueId}`);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const cloudinaryWidget = useRef(null);

  // Create a truly unique ID for this uploader instance that includes the type
  // This ensures profile and cover uploaders don't conflict
  const uploaderId = useRef(`${imageType}-${uniqueId}-${Date.now()}`).current;

  // Store a static reference to track active uploaders globally
  if (!window.activeUploaders) {
    window.activeUploaders = {};
  }

  // Set initial image if provided
  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
      // If we have an initial image, make sure the parent component knows about it
      if (onImageSelect) {
        onImageSelect(initialImage);
      }
    }
  }, [initialImage]);

  // Initialize Cloudinary widget when component mounts
  useEffect(() => {
    console.log(`Setting up Cloudinary widget for ${imageType} with ID: ${uniqueId}`);
    // Check if Cloudinary script is already loaded
    if (!window.cloudinary) {
      // Load Cloudinary script
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => initializeWidget(uniqueId, imageType);
      document.body.appendChild(script);

      return () => {
        // Only remove the script if no other uploaders are using it
        if (!document.querySelector('.cloudinary-uploader-active')) {
          document.body.removeChild(script);
        }
        // Clear any data attributes related to this uploader
        if (document.body.getAttribute('data-active-uploader') === uploaderId) {
          document.body.removeAttribute('data-active-uploader');
        }
      };
    } else {
      initializeWidget(uniqueId, imageType);
    }

    // Cleanup function
    return () => {
      console.log(`Cleaning up Cloudinary widget for ${imageType} with ID: ${uniqueId} (uploaderId: ${uploaderId})`);
      // Clear this uploader from the global tracking object
      if (window.activeUploaders && window.activeUploaders[uploaderId]) {
        delete window.activeUploaders[uploaderId];
        console.log(`Removed uploader ${uploaderId} from global tracking`);
      }

      // Also clean up the old tracking method for backward compatibility
      if (document.body.getAttribute('data-active-uploader') === uploaderId) {
        document.body.removeAttribute('data-active-uploader');
      }
    };
  }, [uniqueId, imageType]);

  const initializeWidget = (widgetId, type) => {
    console.log(`Creating widget for ${type} with ID: ${widgetId} (uploaderId: ${uploaderId})`);
    if (window.cloudinary) {
      // Create a unique widget instance for this component
      cloudinaryWidget.current = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dvrnheiru', // Hardcoded for now
          uploadPreset: 'ablog_upload', // Hardcoded for now
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: true,
          showSkipCropButton: false,
          croppingAspectRatio: aspectRatio,
          folder: `ablog/${type}s`,
          maxFileSize: 5000000, // 5MB
          // Add a unique ID to this widget instance with timestamp and uploader ID to ensure uniqueness
          publicId: `${type}_${uploaderId}_${Date.now()}`,
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
        },
        (error, result) => {
          // Check if this callback is for the active uploader
          const activeUploader = document.body.getAttribute('data-active-uploader');
          const isActiveInNewSystem = window.activeUploaders && window.activeUploaders[uploaderId];

          console.log(`Widget ${widgetId} (${type}) callback:`, result ? result.event : 'No result');
          console.log(`Active uploader (old system): ${activeUploader}, This uploader: ${uploaderId}`);
          console.log(`Is active in new tracking system: ${isActiveInNewSystem ? 'YES' : 'NO'}`);

          // List all active uploaders for debugging
          if (window.activeUploaders) {
            const activeKeys = Object.keys(window.activeUploaders);
            if (activeKeys.length > 0) {
              console.log('Currently active uploaders:', activeKeys);
            }
          }

          // Only process the callback if it's for this uploader or if we're closing
          // Check both the old and new tracking systems
          if (activeUploader === uploaderId || isActiveInNewSystem || (result && result.event === "close")) {
            if (!error && result && result.event === "success") {
              const imageUrl = result.info.secure_url;
              console.log(`${type} upload successful:`, imageUrl);

              // Use the original URL without timestamp for the actual data
              // This prevents issues with URL comparison and duplicate images
              const originalUrl = imageUrl;

              // Add a timestamp parameter only for preview to prevent caching
              const previewUrl = `${imageUrl}?t=${Date.now()}`;
              console.log(`Using timestamped URL for preview:`, previewUrl);

              setPreview(previewUrl);
              setError('');
              if (onImageSelect) {
                // Pass the original URL to the parent component for storage
                onImageSelect(originalUrl);
              }
              setIsUploading(false);
              // Clear this uploader from tracking systems
              if (window.activeUploaders && window.activeUploaders[uploaderId]) {
                delete window.activeUploaders[uploaderId];
                console.log(`Removed ${type} uploader from global tracking after success`);
              }
              // Also clear the old tracking method
              document.body.removeAttribute('data-active-uploader');
            } else if (error) {
              console.error(`${type} upload error:`, error);
              setError('Error uploading image. Please try again.');
              setIsUploading(false);
              // Clear this uploader from tracking systems
              if (window.activeUploaders && window.activeUploaders[uploaderId]) {
                delete window.activeUploaders[uploaderId];
                console.log(`Removed ${type} uploader from global tracking after error`);
              }
              // Also clear the old tracking method
              document.body.removeAttribute('data-active-uploader');
            } else if (result && result.event === "close") {
              setIsUploading(false);
              // Clear this uploader from tracking systems
              if (window.activeUploaders && window.activeUploaders[uploaderId]) {
                delete window.activeUploaders[uploaderId];
                console.log(`Removed ${type} uploader from global tracking after close`);
              }
              // Also clear the old tracking method
              document.body.removeAttribute('data-active-uploader');
            }
          } else {
            console.log(`Ignoring callback for inactive uploader ${uploaderId}`);
          }
        }
      );
    }
  };

  const handleButtonClick = () => {
    console.log(`Opening widget for ${imageType} with ID: ${uniqueId} (uploaderId: ${uploaderId})`);
    if (cloudinaryWidget.current) {
      setIsUploading(true);

      // Clear any existing active uploaders first to prevent conflicts
      if (window.activeUploaders) {
        // Log what was active before
        const activeKeys = Object.keys(window.activeUploaders);
        if (activeKeys.length > 0) {
          console.log('Clearing previously active uploaders:', activeKeys);
        }

        // Reset the tracking object
        window.activeUploaders = {};
      }

      // Register this uploader as the active one
      window.activeUploaders[uploaderId] = {
        type: imageType,
        id: uniqueId,
        timestamp: Date.now()
      };
      console.log(`Set ${imageType} uploader as active:`, uploaderId);

      // Also use the old tracking method for backward compatibility
      document.body.setAttribute('data-active-uploader', uploaderId);
      document.body.classList.add('cloudinary-uploader-active');

      // Open the widget with a specific context to ensure it's the right one
      cloudinaryWidget.current.open();
    } else {
      console.error(`Widget for ${imageType} (${uniqueId}) not initialized`);
      setError('Image upload is not available. Please try again later.');
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${isUploading ? 'border-purple-500 bg-purple-900/10' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-900`}
        >
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isUploading ? 'Uploading...' : 'Click to upload an image'}
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : buttonText}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg object-cover"
            style={{ maxHeight: '200px' }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="p-1 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
              title="Change Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
              title="Remove Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
