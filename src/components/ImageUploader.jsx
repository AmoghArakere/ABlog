import React, { useState, useRef, useEffect } from 'react';

export default function ImageUploader({ onImageSelect, buttonText = "Upload Image", initialImage = null }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');

    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG, GIF)');
      return;
    }

    // Check file size (limit to 2MB for better localStorage compatibility)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB for better compatibility');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setPreview(imageData);

      // Optimize the image before passing it to the parent component
      optimizeImage(imageData, file.type, (optimizedImage) => {
        if (onImageSelect) {
          onImageSelect(optimizedImage);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // Function to optimize the image
  const optimizeImage = (src, fileType, callback) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set maximum dimensions - reduce to save localStorage space
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 900;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Ensure dimensions are integers
        width = Math.floor(width);
        height = Math.floor(height);

        // Set canvas dimensions and draw the resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to data URL with reduced quality
        // Use different quality settings based on image size
        let quality = 0.8; // Default quality

        // Adjust quality based on image dimensions
        if (width * height > 1000000) { // For larger images
          quality = 0.7;
        }
        if (width * height > 2000000) { // For very large images
          quality = 0.6;
        }

        const optimizedDataUrl = canvas.toDataURL(fileType, quality);

        console.log('Image optimized successfully. Original size vs optimized:',
          Math.round(src.length / 1024), 'KB vs',
          Math.round(optimizedDataUrl.length / 1024), 'KB');

        // Check if the optimized image is still too large for localStorage
        if (optimizedDataUrl.length > 1.5 * 1024 * 1024) {
          console.warn('Image still large after optimization. Trying with lower quality...');

          // Try again with even lower quality
          const lowerQualityDataUrl = canvas.toDataURL(fileType, 0.5);

          if (lowerQualityDataUrl.length > 1.5 * 1024 * 1024) {
            console.warn('Image still too large even with lower quality.');
            setError('Image is too large for storage. Please use a smaller image.');
          } else {
            console.log('Successfully optimized large image with lower quality');
            callback(lowerQualityDataUrl);
            return;
          }
        }

        callback(optimizedDataUrl);
      } catch (err) {
        console.error('Error during image optimization:', err);
        setError('Error processing image. Please try another image.');
        callback('/images/placeholder-cover.svg'); // Use placeholder instead
      }
    };

    // Handle image loading errors
    img.onerror = () => {
      console.error('Error loading image for optimization');
      setError('Error loading image. Please try another image.');
      callback('/images/placeholder-cover.svg'); // Use placeholder instead
    };

    img.src = src;
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-purple-500 bg-purple-900/10' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-900`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold dark:text-purple-300">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, JPEG or GIF (MAX. 2MB)</p>

            <button
              type="button"
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              {buttonText}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              console.error('Error loading preview image');
              e.target.onerror = null;
              e.target.src = '/images/placeholder-cover.svg';
              setError('Error displaying image preview. The image may be corrupted.');
            }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Change image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
