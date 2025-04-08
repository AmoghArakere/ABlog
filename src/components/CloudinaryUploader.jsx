import React, { useState, useEffect, useRef } from 'react';

export default function CloudinaryUploader({ onImageSelect, buttonText = "Upload Image", initialImage = null }) {
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const cloudinaryWidget = useRef(null);

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
    // Check if Cloudinary script is already loaded
    if (!window.cloudinary) {
      // Load Cloudinary script
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeWidget();
    }
  }, []);

  const initializeWidget = () => {
    if (window.cloudinary) {
      cloudinaryWidget.current = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvrnheiru',
          uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ablog_upload',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: true,
          showSkipCropButton: false,
          croppingAspectRatio: 1,
          maxFileSize: 5000000, // 5MB
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
          if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            console.log('Cloudinary upload successful:', imageUrl);
            setPreview(imageUrl);
            setError('');
            if (onImageSelect) {
              onImageSelect(imageUrl);
            }
            setIsUploading(false);
          } else if (error) {
            console.error('Cloudinary upload error:', error);
            setError('Error uploading image. Please try again.');
            setIsUploading(false);
          } else if (result && result.event === "close") {
            setIsUploading(false);
          }
        }
      );
    }
  };

  const handleButtonClick = () => {
    if (cloudinaryWidget.current) {
      setIsUploading(true);
      cloudinaryWidget.current.open();
    } else {
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
