import { getImageUrl } from './imageUtils';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Generate a slug from a title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage = (key, defaultValue = '[]') => {
  if (!isBrowser) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe localStorage setter
const setToStorage = (key, value) => {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

// Initialize localStorage with default data if empty
const initializeStorage = () => {
  if (!isBrowser) return;

  try {
    // Initialize empty collections if they don't exist
    if (!getFromStorage('users')) {
      setToStorage('users', JSON.stringify([]));
    }
    if (!getFromStorage('posts')) {
      setToStorage('posts', JSON.stringify([]));
    }
    if (!getFromStorage('comments')) {
      setToStorage('comments', JSON.stringify([]));
    }
    if (!getFromStorage('likes')) {
      setToStorage('likes', JSON.stringify([]));
    }
    if (!getFromStorage('bookmarks')) {
      setToStorage('bookmarks', JSON.stringify([]));
    }
    if (!getFromStorage('follows')) {
      setToStorage('follows', JSON.stringify([]));
    }

    // Fix any users without usernames
    const users = JSON.parse(getFromStorage('users'));
    let hasChanges = false;

    for (let i = 0; i < users.length; i++) {
      if (!users[i].username && users[i].email) {
        console.log(`Fixing user ${users[i].id} missing username`);
        users[i].username = users[i].email.split('@')[0];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log('Saving fixed users to localStorage');
      setToStorage('users', JSON.stringify(users));
    }
    // Reading stats functionality removed
    if (!getFromStorage('categories')) {
      setToStorage('categories', JSON.stringify([
        { id: '1', name: 'Technology', slug: 'technology', description: 'Tech-related posts' },
        { id: '2', name: 'Design', slug: 'design', description: 'Design-related posts' },
        { id: '3', name: 'Business', slug: 'business', description: 'Business-related posts' },
        { id: '4', name: 'Health', slug: 'health', description: 'Health-related posts' },
        { id: '5', name: 'Productivity', slug: 'productivity', description: 'Productivity tips and tricks' }
      ]));
    }
    if (!getFromStorage('tags')) {
      setToStorage('tags', JSON.stringify([
        { id: '1', name: 'JavaScript', slug: 'javascript' },
        { id: '2', name: 'React', slug: 'react' },
        { id: '3', name: 'CSS', slug: 'css' },
        { id: '4', name: 'Web Development', slug: 'web-development' },
        { id: '5', name: 'UI/UX', slug: 'ui-ux' }
      ]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage when the module is imported
initializeStorage();

// Blog Posts
export const blogService = {
  // Get all blog posts
  async getAllPosts() {
    try {
      const posts = JSON.parse(getFromStorage('posts'));
      const users = JSON.parse(getFromStorage('users'));
      const now = new Date();

      // Process scheduled posts - if a scheduled post's publish date has passed, update its status to published
      const updatedPosts = posts.map(post => {
        if (post.status === 'scheduled' && post.scheduled_publish_date) {
          const scheduledDate = new Date(post.scheduled_publish_date);
          if (scheduledDate <= now) {
            // The scheduled time has passed, update the post status to published
            return { ...post, status: 'published' };
          }
        }
        return post;
      });

      // Save the updated posts back to localStorage if any changes were made
      if (JSON.stringify(posts) !== JSON.stringify(updatedPosts)) {
        setToStorage('posts', JSON.stringify(updatedPosts));
      }

      // Add author information to each post
      return updatedPosts.map(post => {
        if (post.author_id) {
          const author = users.find(user => user.id === post.author_id);
          if (author) {
            return { ...post, author };
          } else {
            // If author not found but we have author_id, add author_name
            return { ...post, author_name: 'Amogh' };
          }
        }
        return post;
      });
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  },
  // Get all blog posts with pagination
  async getPosts({ page = 1, limit = 10, category = null, tag = null, search = null, authorId = null, includeScheduled = false } = {}) {
    try {
      let posts = JSON.parse(getFromStorage('posts'));
      const users = JSON.parse(getFromStorage('users'));
      const now = new Date();

      // Process scheduled posts - if a scheduled post's publish date has passed, update its status to published
      posts = posts.map(post => {
        if (post.status === 'scheduled' && post.scheduled_publish_date) {
          const scheduledDate = new Date(post.scheduled_publish_date);
          if (scheduledDate <= now) {
            // The scheduled time has passed, update the post status to published
            return { ...post, status: 'published' };
          }
        }
        return post;
      });

      // Filter out scheduled posts that haven't reached their publish date, unless includeScheduled is true
      if (!includeScheduled) {
        posts = posts.filter(post => {
          return post.status !== 'scheduled';
        });
      }

      // Sort by created_at (newest first)
      posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Add author information to each post
      posts = posts.map(post => {
        if (post.author_id) {
          const author = users.find(user => user.id === post.author_id);
          if (author) {
            return { ...post, author };
          } else {
            // If author not found but we have author_id, add author_name
            return { ...post, author_name: 'Amogh' };
          }
        }
        return post;
      });

      // Filter by category
      if (category) {
        posts = posts.filter(post =>
          post.categories && post.categories.some(cat => cat.slug === category)
        );
      }

      // Filter by tag
      if (tag) {
        posts = posts.filter(post =>
          post.tags && post.tags.some(t => t.slug === tag)
        );
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(post =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower)
        );
      }

      // Filter by author
      if (authorId) {
        posts = posts.filter(post => post.author_id === authorId);
      }

      // Calculate pagination
      const total = posts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = posts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Get a single blog post by slug
  async getPostBySlug(slug) {
    try {
      console.log('getPostBySlug called with slug:', slug);
      if (!slug) {
        console.error('getPostBySlug: No slug provided');
        return null;
      }

      const postsData = getFromStorage('posts');
      if (!postsData) {
        console.error('getPostBySlug: No posts found in storage');
        return null;
      }

      const posts = JSON.parse(postsData);
      console.log('getPostBySlug: Found', posts.length, 'posts in storage');

      const post = posts.find(post => post.slug === slug);
      console.log('getPostBySlug: Post found?', !!post);

      if (post && post.author_id) {
        // Add author information
        const usersData = getFromStorage('users');
        if (usersData) {
          const users = JSON.parse(usersData);
          const author = users.find(user => user.id === post.author_id);
          if (author) {
            post.author = author;
          } else {
            // If author not found but we have author_id, add author_name
            post.author_name = 'Amogh';
          }
        }
      }

      return post || null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  // Create a new blog post
  async createPost({ title, content, excerpt, cover_image, author_id, categories = [], tags = [], status = 'published', scheduled_publish_date = null }) {
    try {
      const posts = JSON.parse(getFromStorage('posts'));
      const allCategories = JSON.parse(getFromStorage('categories'));
      const allTags = JSON.parse(getFromStorage('tags'));

      // Generate slug from title
      const slug = generateSlug(title);

      // Get category and tag objects
      const postCategories = categories.map(catId =>
        allCategories.find(cat => cat.id === catId)
      ).filter(Boolean);

      const postTags = tags.map(tagId =>
        allTags.find(tag => tag.id === tagId)
      ).filter(Boolean);

      // Use the cover image URL directly (it should already be a Cloudinary URL from the frontend)
      let processedCoverImage = cover_image;
      if (cover_image) {
        console.log('Using post cover image URL:', cover_image.substring(0, 50) + '...');
      }

      // Process content to preserve line breaks
      let processedContent = content;

      // If status is 'scheduled', ensure we have a valid scheduled_publish_date
      if (status === 'scheduled' && scheduled_publish_date) {
        // Validate that the scheduled date is in the future
        const scheduledDate = new Date(scheduled_publish_date);
        const now = new Date();

        if (scheduledDate <= now) {
          throw new Error('Scheduled publish date must be in the future');
        }
      }

      // Create new post
      const newPost = {
        id: generateId(),
        title,
        slug,
        content: processedContent,
        excerpt: excerpt || title.substring(0, 150) + '...',
        cover_image: processedCoverImage,
        author_id,
        categories: postCategories,
        tags: postTags,
        status,
        scheduled_publish_date: scheduled_publish_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add author information
      const users = JSON.parse(getFromStorage('users'));
      const author = users.find(user => user.id === author_id);
      if (author) {
        newPost.author = author;
      }

      posts.push(newPost);
      setToStorage('posts', JSON.stringify(posts));

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  // Update an existing blog post
  async updatePost(id, { title, content, excerpt, cover_image, categories = [], tags = [], status, scheduled_publish_date }) {
    try {
      const posts = JSON.parse(getFromStorage('posts'));
      const allCategories = JSON.parse(getFromStorage('categories'));
      const allTags = JSON.parse(getFromStorage('tags'));

      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) return null;

      const post = posts[postIndex];

      // Update post fields
      if (title) {
        post.title = title;
        post.slug = generateSlug(title);
      }

      // Process content to preserve line breaks if provided
      if (content) {
        let processedContent = content;
        post.content = processedContent;
      }
      if (excerpt) post.excerpt = excerpt;

      // Use the cover image URL directly (it should already be a Cloudinary URL from the frontend)
      if (cover_image && cover_image !== post.cover_image) {
        console.log('Using updated post cover image URL:', cover_image.substring(0, 50) + '...');
        post.cover_image = cover_image;
      }

      if (status) post.status = status;

      // Update scheduled publish date if provided
      if (scheduled_publish_date !== undefined) {
        // If status is 'scheduled', ensure we have a valid scheduled_publish_date
        if (status === 'scheduled' && scheduled_publish_date) {
          // Validate that the scheduled date is in the future
          const scheduledDate = new Date(scheduled_publish_date);
          const now = new Date();

          if (scheduledDate <= now) {
            throw new Error('Scheduled publish date must be in the future');
          }
          post.scheduled_publish_date = scheduled_publish_date;
        } else if (status !== 'scheduled') {
          // If status is not scheduled, clear the scheduled date
          post.scheduled_publish_date = null;
        }
      }

      // Update categories if provided
      if (categories.length > 0) {
        post.categories = categories.map(catId =>
          allCategories.find(cat => cat.id === catId)
        ).filter(Boolean);
      }

      // Update tags if provided
      if (tags.length > 0) {
        post.tags = tags.map(tagId =>
          allTags.find(tag => tag.id === tagId)
        ).filter(Boolean);
      }

      post.updated_at = new Date().toISOString();

      posts[postIndex] = post;
      setToStorage('posts', JSON.stringify(posts));

      return { success: true, post };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error: 'Failed to update post' };
    }
  },

  // Delete a blog post
  async deletePost(id) {
    try {
      const posts = JSON.parse(getFromStorage('posts'));
      const filteredPosts = posts.filter(post => post.id !== id);

      setToStorage('posts', JSON.stringify(filteredPosts));

      // Also delete related comments, likes, and bookmarks
      const comments = JSON.parse(getFromStorage('comments'));
      const filteredComments = comments.filter(comment => comment.post_id !== id);
      setToStorage('comments', JSON.stringify(filteredComments));

      const likes = JSON.parse(getFromStorage('likes'));
      const filteredLikes = likes.filter(like => like.post_id !== id);
      setToStorage('likes', JSON.stringify(filteredLikes));

      const bookmarks = JSON.parse(getFromStorage('bookmarks'));
      const filteredBookmarks = bookmarks.filter(bookmark => bookmark.post_id !== id);
      setToStorage('bookmarks', JSON.stringify(filteredBookmarks));

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  // Get all categories
  async getCategories() {
    try {
      return JSON.parse(getFromStorage('categories'));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get all tags
  async getTags() {
    try {
      return JSON.parse(getFromStorage('tags'));
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
};

// User Profiles
export const profileService = {
  // Get all user profiles
  async getAllProfiles() {
    try {
      const users = JSON.parse(getFromStorage('users'));
      return users;
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }
  },
  // Get user profile
  async getProfile(userId) {
    try {
      const users = JSON.parse(getFromStorage('users'));
      return users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId, { username, full_name, bio, avatar_url, cover_image, website, location }) {
    try {
      console.log('updateProfile called with:', {
        userId,
        avatar_url: avatar_url ? (typeof avatar_url === 'string' ? `${avatar_url.substring(0, 30)}...` : '[non-string value]') : null,
        cover_image: cover_image ? (typeof cover_image === 'string' ? `${cover_image.substring(0, 30)}...` : '[non-string value]') : null
      });

      // Get the current user from localStorage
      const currentUserJson = getFromStorage('currentUser');
      if (!currentUserJson) {
        console.error('No current user found in localStorage');
        return null;
      }

      const currentUser = JSON.parse(currentUserJson);
      if (currentUser.id !== userId) {
        console.error('User ID mismatch:', currentUser.id, userId);
        return null;
      }

      console.log('Found current user:', currentUser.username);

      // Username cannot be changed - always use the existing username
      username = currentUser.username;
      console.log('Using existing username:', username);

      // Use the image URLs directly (they should already be Cloudinary URLs from the frontend)
      let processedAvatarUrl = null;
      let processedCoverImage = null;

      // Process avatar URL if it's provided
      if (avatar_url) {
        // Remove any timestamp parameters if they exist
        let cleanAvatarUrl = avatar_url;
        if (cleanAvatarUrl.includes('?t=')) {
          cleanAvatarUrl = cleanAvatarUrl.split('?t=')[0];
          console.log('Cleaned avatar URL from timestamp parameter');
        }
        console.log('Using avatar URL:', cleanAvatarUrl.substring(0, 50) + '...');
        processedAvatarUrl = cleanAvatarUrl;
      }

      // Process cover image if it's provided
      if (cover_image) {
        // Remove any timestamp parameters if they exist
        let cleanCoverImage = cover_image;
        if (cleanCoverImage.includes('?t=')) {
          cleanCoverImage = cleanCoverImage.split('?t=')[0];
          console.log('Cleaned cover image URL from timestamp parameter');
        }
        console.log('Using cover image URL:', cleanCoverImage.substring(0, 50) + '...');
        processedCoverImage = cleanCoverImage;
      }

      // Create updated user object
      const updatedUser = { ...currentUser };

      // Update user fields - only update fields that were provided
      if (username) updatedUser.username = username;
      if (full_name) updatedUser.full_name = full_name;
      if (bio !== undefined) updatedUser.bio = bio;
      if (processedAvatarUrl) updatedUser.avatar_url = processedAvatarUrl; // Only update if new avatar was provided
      if (processedCoverImage) updatedUser.cover_image = processedCoverImage; // Only update if new cover was provided
      if (website !== undefined) updatedUser.website = website;
      if (location !== undefined) updatedUser.location = location;

      // Save the updated user to localStorage
      console.log('Saving updated user:', updatedUser.username);
      setToStorage('currentUser', JSON.stringify(updatedUser));

      // Try to update the users array if it exists
      try {
        const usersJson = getFromStorage('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const userIndex = users.findIndex(user => user.id === userId);
          if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            setToStorage('users', JSON.stringify(users));
          }
        }
      } catch (err) {
        console.error('Error updating users array:', err);
        // Continue even if this fails
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    try {
      if (!username) {
        console.error('getUserByUsername called with no username');
        return null;
      }

      console.log('Getting user by username:', username);

      // First check if this is the current user
      const currentUserJson = getFromStorage('currentUser');
      if (currentUserJson) {
        try {
          const currentUser = JSON.parse(currentUserJson);
          if (currentUser && currentUser.username === username) {
            console.log('Username matches current user:', currentUser.username);
            return currentUser;
          }
        } catch (e) {
          console.error('Error parsing current user:', e);
        }
      }

      // If we get here, either the current user doesn't match or there was an error
      // Try to get from the users array if it exists
      const usersJson = getFromStorage('users');
      if (!usersJson) {
        console.error('No users found in localStorage');
        return null;
      }

      try {
        const users = JSON.parse(usersJson);
        console.log('Total users in storage:', users.length);

        const user = users.find(user => user.username === username);
        if (user) {
          console.log('Found user:', user.id, user.username);
          return user;
        } else {
          console.error('No user found with username:', username);
          // Log all usernames to help debug
          console.log('Available usernames:', users.map(u => u.username));
        }
      } catch (e) {
        console.error('Error parsing users array:', e);
      }

      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  },

  // Follow/unfollow functionality
  async followUser(followerId, followingId) {
    try {
      const follows = JSON.parse(getFromStorage('follows'));

      // Check if already following
      const alreadyFollowing = follows.some(
        follow => follow.follower_id === followerId && follow.following_id === followingId
      );

      if (alreadyFollowing) return true;

      follows.push({
        id: generateId(),
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });

      setToStorage('follows', JSON.stringify(follows));

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    try {
      const follows = JSON.parse(getFromStorage('follows'));
      const filteredFollows = follows.filter(
        follow => !(follow.follower_id === followerId && follow.following_id === followingId)
      );

      setToStorage('follows', JSON.stringify(filteredFollows));

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  // Check if a user is following another user
  async isFollowing(followerId, followingId) {
    try {
      const follows = JSON.parse(getFromStorage('follows'));
      return follows.some(
        follow => follow.follower_id === followerId && follow.following_id === followingId
      );
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  // Get followers of a user
  async getFollowers(userId, { page = 1, limit = 10 } = {}) {
    try {
      const follows = JSON.parse(getFromStorage('follows'));
      const users = JSON.parse(getFromStorage('users'));

      const userFollows = follows.filter(follow => follow.following_id === userId);
      const followers = userFollows.map(follow => {
        const follower = users.find(user => user.id === follow.follower_id);
        return follower;
      }).filter(Boolean);

      // Calculate pagination
      const total = followers.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFollowers = followers.slice(startIndex, endIndex);

      return {
        followers: paginatedFollowers,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { followers: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Get users that a user is following
  async getFollowing(userId, { page = 1, limit = 10 } = {}) {
    try {
      const follows = JSON.parse(getFromStorage('follows'));
      const users = JSON.parse(getFromStorage('users'));

      const userFollows = follows.filter(follow => follow.follower_id === userId);
      const following = userFollows.map(follow => {
        const followedUser = users.find(user => user.id === follow.following_id);
        return followedUser;
      }).filter(Boolean);

      // Calculate pagination
      const total = following.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFollowing = following.slice(startIndex, endIndex);

      return {
        following: paginatedFollowing,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching following:', error);
      return { following: [], total: 0, page, limit, totalPages: 0 };
    }
  }
};

// Comments
export const commentService = {
  // Get comments for a post
  async getComments(postId, { page = 1, limit = 10 } = {}) {
    try {
      const comments = JSON.parse(getFromStorage('comments'));
      const users = JSON.parse(getFromStorage('users'));

      // Filter comments for this post
      let postComments = comments.filter(comment => comment.post_id === postId);

      // Sort by created_at (newest first)
      postComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Add author information
      postComments = postComments.map(comment => {
        const author = users.find(user => user.id === comment.author_id);
        return { ...comment, author };
      });

      // Calculate pagination
      const total = postComments.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedComments = postComments.slice(startIndex, endIndex);

      return {
        comments: paginatedComments,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Add a comment to a post
  async addComment(postId, authorId, content) {
    try {
      const comments = JSON.parse(getFromStorage('comments'));
      const users = JSON.parse(getFromStorage('users'));

      const author = users.find(user => user.id === authorId);

      const newComment = {
        id: generateId(),
        post_id: postId,
        author_id: authorId,
        content,
        created_at: new Date().toISOString(),
        author
      };

      comments.push(newComment);
      setToStorage('comments', JSON.stringify(comments));

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    try {
      const comments = JSON.parse(getFromStorage('comments'));
      const commentIndex = comments.findIndex(comment => comment.id === commentId);

      if (commentIndex === -1) return null;

      comments[commentIndex].content = content;
      comments[commentIndex].updated_at = new Date().toISOString();

      setToStorage('comments', JSON.stringify(comments));

      return comments[commentIndex];
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const comments = JSON.parse(getFromStorage('comments'));
      const filteredComments = comments.filter(comment => comment.id !== commentId);

      setToStorage('comments', JSON.stringify(filteredComments));

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }
};

// Likes
export const likeService = {
  // Like a post
  async likePost(postId, userId) {
    try {
      const likes = JSON.parse(getFromStorage('likes'));

      // Check if already liked
      const alreadyLiked = likes.some(
        like => like.post_id === postId && like.user_id === userId
      );

      if (alreadyLiked) return true;

      likes.push({
        id: generateId(),
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });

      setToStorage('likes', JSON.stringify(likes));

      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  },

  // Unlike a post
  async unlikePost(postId, userId) {
    try {
      const likes = JSON.parse(getFromStorage('likes'));
      const filteredLikes = likes.filter(
        like => !(like.post_id === postId && like.user_id === userId)
      );

      setToStorage('likes', JSON.stringify(filteredLikes));

      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  },

  // Check if a user has liked a post
  async hasLiked(postId, userId) {
    try {
      const likes = JSON.parse(getFromStorage('likes'));
      return likes.some(
        like => like.post_id === postId && like.user_id === userId
      );
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },

  // Get like count for a post
  async getLikeCount(postId) {
    try {
      const likes = JSON.parse(getFromStorage('likes'));
      return likes.filter(like => like.post_id === postId).length;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  }
};

// Bookmarks
export const bookmarkService = {
  // Bookmark a post
  async bookmarkPost(postId, userId) {
    try {
      const bookmarks = JSON.parse(getFromStorage('bookmarks'));

      // Check if already bookmarked
      const alreadyBookmarked = bookmarks.some(
        bookmark => bookmark.post_id === postId && bookmark.user_id === userId
      );

      if (alreadyBookmarked) return true;

      bookmarks.push({
        id: generateId(),
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });

      setToStorage('bookmarks', JSON.stringify(bookmarks));

      return true;
    } catch (error) {
      console.error('Error bookmarking post:', error);
      return false;
    }
  },

  // Remove a bookmark
  async removeBookmark(postId, userId) {
    try {
      const bookmarks = JSON.parse(getFromStorage('bookmarks'));
      const filteredBookmarks = bookmarks.filter(
        bookmark => !(bookmark.post_id === postId && bookmark.user_id === userId)
      );

      setToStorage('bookmarks', JSON.stringify(filteredBookmarks));

      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  },

  // Check if a user has bookmarked a post
  async hasBookmarked(postId, userId) {
    try {
      const bookmarks = JSON.parse(getFromStorage('bookmarks'));
      return bookmarks.some(
        bookmark => bookmark.post_id === postId && bookmark.user_id === userId
      );
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  },

  // Get bookmarked posts for a user
  async getBookmarkedPosts(userId, { page = 1, limit = 10 } = {}) {
    try {
      const bookmarks = JSON.parse(getFromStorage('bookmarks'));
      const posts = JSON.parse(getFromStorage('posts'));

      // Get bookmarks for this user
      const userBookmarks = bookmarks.filter(bookmark => bookmark.user_id === userId);

      // Get the actual posts
      const bookmarkedPosts = userBookmarks.map(bookmark => {
        const post = posts.find(post => post.id === bookmark.post_id);
        return post;
      }).filter(Boolean);

      // Sort by bookmark created_at (newest first)
      bookmarkedPosts.sort((a, b) => {
        const bookmarkA = userBookmarks.find(bookmark => bookmark.post_id === a.id);
        const bookmarkB = userBookmarks.find(bookmark => bookmark.post_id === b.id);
        return new Date(bookmarkB.created_at) - new Date(bookmarkA.created_at);
      });

      // Calculate pagination
      const total = bookmarkedPosts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = bookmarkedPosts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
      return { posts: [], total: 0, page, limit, totalPages: 0 };
    }
  }
};
