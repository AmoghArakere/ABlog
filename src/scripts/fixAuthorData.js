// This script fixes the author data in localStorage
// It ensures that all posts have the correct author information

// Function to get data from localStorage
function getFromStorage(key) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || null;
}

// Function to set data to localStorage
function setToStorage(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

// Function to fix author data
function fixAuthorData() {
  console.log('Starting author data fix...');
  
  try {
    // Get posts and users from localStorage
    const postsData = getFromStorage('posts');
    const usersData = getFromStorage('users');
    
    if (!postsData || !usersData) {
      console.error('Missing posts or users data in localStorage');
      return false;
    }
    
    const posts = JSON.parse(postsData);
    const users = JSON.parse(usersData);
    
    console.log(`Found ${posts.length} posts and ${users.length} users`);
    
    // Get the current user
    const currentUserData = getFromStorage('currentUser');
    if (!currentUserData) {
      console.error('No current user found in localStorage');
      return false;
    }
    
    const currentUser = JSON.parse(currentUserData);
    console.log('Current user:', currentUser);
    
    // Fix posts by adding author information
    let updatedCount = 0;
    const updatedPosts = posts.map(post => {
      // If the post has an author_id but no author object
      if (post.author_id && (!post.author || post.author.id !== post.author_id)) {
        const author = users.find(user => user.id === post.author_id);
        if (author) {
          updatedCount++;
          return { ...post, author };
        }
      }
      return post;
    });
    
    console.log(`Updated ${updatedCount} posts with author information`);
    
    // Save the updated posts back to localStorage
    setToStorage('posts', JSON.stringify(updatedPosts));
    
    return true;
  } catch (error) {
    console.error('Error fixing author data:', error);
    return false;
  }
}

// Execute the fix
if (typeof window !== 'undefined') {
  window.fixAuthorData = fixAuthorData;
  console.log('Author data fix script loaded. Run fixAuthorData() to apply the fix.');
}

export default fixAuthorData;
