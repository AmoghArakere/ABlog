import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function ImageAdjuster({
  imageData,
  onSave,
  onCancel,
  aspectRatio = 1,
  minScale = 1,
  maxScale = 3,
  title = "Adjust Image"
}) {
  const [scale, setScale] = useState(1.2); // Start with a slightly larger scale for better control
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Initialize the image when it loads
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Function to calculate the optimal initial scale
  const calculateOptimalScale = useCallback((imgWidth, imgHeight, containerWidth, containerHeight) => {
    // Calculate the scale needed to fit the image in the container while maintaining aspect ratio
    const widthScale = containerWidth / imgWidth;
    const heightScale = containerHeight / imgHeight;

    // Use the larger scale to ensure the image covers the container
    const optimalScale = Math.max(widthScale, heightScale) * 1.1; // Add 10% for better coverage

    return Math.max(minScale, Math.min(maxScale, optimalScale));
  }, [minScale, maxScale]);

  // Initialize the image position to center when component mounts
  useEffect(() => {
    if (imageRef.current && containerRef.current && imageLoaded) {
      const img = imageRef.current;
      const container = containerRef.current;

      // Get dimensions
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Set image dimensions for later use
      setImageDimensions({ width: imgWidth, height: imgHeight });

      // Calculate optimal scale
      const optimalScale = calculateOptimalScale(imgWidth, imgHeight, containerWidth, containerHeight);
      setScale(optimalScale);

      // Center the image
      centerImage();
    }
  }, [imageData, imageLoaded, calculateOptimalScale]);

  const centerImage = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });

    // Change cursor style
    if (imageRef.current) {
      imageRef.current.style.cursor = 'grabbing';
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate the maximum allowed movement
    const maxX = (imageRect.width * scale - containerRect.width) / 2;
    const maxY = (imageRect.height * scale - containerRect.height) / 2;

    // Calculate new position
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Constrain movement
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate the maximum allowed movement
    const maxX = (imageRect.width * scale - containerRect.width) / 2;
    const maxY = (imageRect.height * scale - containerRect.height) / 2;

    // Calculate new position
    let newX = touch.clientX - dragStart.x;
    let newY = touch.clientY - dragStart.y;

    // Constrain movement
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Reset cursor style
    if (imageRef.current) {
      imageRef.current.style.cursor = 'grab';
    }
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
  };

  const handleSave = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions based on the container's aspect ratio
    // but use fixed dimensions to ensure consistent quality
    const outputWidth = aspectRatio === 1 ? 400 : 800; // Square or rectangle
    const outputHeight = aspectRatio === 1 ? 400 : Math.round(800 / aspectRatio);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Get the natural dimensions of the image
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Calculate the visible portion of the image in the container
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Calculate the scaled dimensions of the image
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;

    // Calculate the center point of the container
    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    // Calculate the center point of the image relative to the container
    const imageCenterX = containerCenterX + position.x;
    const imageCenterY = containerCenterY + position.y;

    // Calculate the portion of the original image that's visible in the container
    const visibleRatio = {
      x: containerWidth / scaledWidth,
      y: containerHeight / scaledHeight
    };

    // Calculate the source coordinates in the original image
    const sourceX = (naturalWidth / 2) - ((containerCenterX - position.x) / scale);
    const sourceY = (naturalHeight / 2) - ((containerCenterY - position.y) / scale);
    const sourceWidth = containerWidth / scale;
    const sourceHeight = containerHeight / scale;

    // Ensure source coordinates are within the image bounds
    const adjustedSourceX = Math.max(0, Math.min(naturalWidth - sourceWidth, sourceX));
    const adjustedSourceY = Math.max(0, Math.min(naturalHeight - sourceHeight, sourceY));

    // Draw the cropped image to the canvas
    ctx.drawImage(
      img,
      adjustedSourceX, adjustedSourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    );

    // Convert canvas to data URL with high quality
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.95);

    // Pass the cropped image data to the parent component
    onSave(croppedImageData);
  };

  // Add a preview of the cropped image
  const getCroppedPreview = () => {
    if (!imageRef.current || !containerRef.current || !imageLoaded) return null;

    try {
      const img = imageRef.current;
      const container = containerRef.current;

      // Create a canvas to crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match container (this will be our crop size)
      const previewWidth = 150;
      const previewHeight = aspectRatio === 1 ? 150 : Math.round(150 / aspectRatio);

      canvas.width = previewWidth;
      canvas.height = previewHeight;

      // Calculate the source coordinates for cropping
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Calculate the center of the container
      const containerCenterX = containerWidth / 2;
      const containerCenterY = containerHeight / 2;

      // Calculate the source coordinates for the image
      const sourceX = (img.naturalWidth / 2) - ((containerCenterX - position.x) / scale);
      const sourceY = (img.naturalHeight / 2) - ((containerCenterY - position.y) / scale);
      const sourceWidth = containerWidth / scale;
      const sourceHeight = containerHeight / scale;

      // Ensure source coordinates are within the image bounds
      const adjustedSourceX = Math.max(0, Math.min(img.naturalWidth - sourceWidth, sourceX));
      const adjustedSourceY = Math.max(0, Math.min(img.naturalHeight - sourceHeight, sourceY));

      // Draw the cropped image to the canvas
      ctx.drawImage(
        img,
        adjustedSourceX, adjustedSourceY, sourceWidth, sourceHeight,
        0, 0, previewWidth, previewHeight
      );

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error generating preview:', error);
      return null;
    }
  };

  const previewImage = imageLoaded ? getCroppedPreview() : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Drag to reposition and use the slider to zoom in or out.
            </p>

            <div className="flex items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Zoom:</span>
              <input
                type="range"
                min={minScale}
                max={maxScale}
                step="0.1"
                value={scale}
                onChange={handleScaleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{Math.round(scale * 100)}%</span>
            </div>

            <div className="flex justify-center mb-2">
              <button
                onClick={centerImage}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Center Image
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div
              ref={containerRef}
              className="relative overflow-hidden mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg flex-1"
              style={{
                width: '100%',
                height: aspectRatio === 1 ? '300px' : '200px',
                aspectRatio: aspectRatio,
                background: '#1a1a1a' // Dark background to better see image boundaries
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchEnd={handleMouseUp}
            >
            <img
              ref={imageRef}
              src={imageData}
              alt="Adjust"
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                transformOrigin: 'center',
                maxWidth: 'none',
                userSelect: 'none',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              onLoad={() => setImageLoaded(true)}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              draggable="false"
            />
            </div>

            {previewImage && (
              <div className="md:w-1/3 flex flex-col items-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 text-center">Preview</p>
                <div
                  className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                  style={{
                    width: '150px',
                    height: aspectRatio === 1 ? '150px' : `${150 / aspectRatio}px`,
                    background: '#1a1a1a'
                  }}
                >
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-md hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
