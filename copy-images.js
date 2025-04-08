// Simple script to ensure images are copied to the build directory
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the images directory in the dist folder if it doesn't exist
const distImagesDir = path.join(__dirname, 'dist', 'images');
if (!fs.existsSync(distImagesDir)) {
  fs.mkdirSync(distImagesDir, { recursive: true });
}

// Copy the placeholder images
const imagesToCopy = [
  'placeholder-blog.svg',
  'placeholder-cover.svg',
  'placeholder-profile.svg'
];

imagesToCopy.forEach(image => {
  const sourcePath = path.join(__dirname, 'public', 'images', image);
  const destPath = path.join(distImagesDir, image);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${image} to dist/images/`);
  } else {
    console.error(`Source image not found: ${sourcePath}`);
  }
});

console.log('Image copying complete!');
