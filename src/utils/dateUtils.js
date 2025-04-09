/**
 * Format a date into a readable string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate read time for content
 * @param {string} content - The content to calculate read time for
 * @param {number} wordsPerMinute - Words per minute reading speed
 * @returns {number} - Estimated read time in minutes
 */
export function calculateReadTime(content, wordsPerMinute = 200) {
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return readTime > 0 ? readTime : 1; // Minimum 1 minute read time
}
