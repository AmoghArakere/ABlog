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
const blogService = {
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

      // Process cover image if it's a base64 string
      let processedCoverImage = cover_image;
      if (cover_image && cover_image.startsWith('data:')) {
        // For now, we're keeping the base64 data as is
        // In a real app, you would upload this to a server and store the URL
        console.log('Base64 image detected, using as is');
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

      // Process cover image if it's a base64 string
      if (cover_image) {
        if (cover_image.startsWith('data:')) {
          // For now, we're keeping the base64 data as is
          // In a real app, you would upload this to a server and store the URL
          console.log('Base64 image detected in update, using as is');
        }
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

export { blogService as b };
