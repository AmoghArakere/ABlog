// Script to clear localStorage and reset the application state
console.log('Clearing localStorage...');

// List of keys to clear
const keysToRemove = [
  'users',
  'posts',
  'comments',
  'likes',
  'bookmarks',
  'follows',
  'currentUser',
  'categories',
  'tags'
];

// Remove each key
keysToRemove.forEach(key => {
  console.log(`Removing ${key}...`);
  localStorage.removeItem(key);
});

console.log('localStorage cleared successfully!');
console.log('Please refresh the page to start with a clean state.');
