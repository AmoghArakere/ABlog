// API-based blog service
const apiBlogService = {
  // Get all blog posts with pagination
  async getPosts({ page = 1, limit = 10, category = null, tag = null, search = null, authorId = null, includeScheduled = false } = {}) {
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (category) params.append('category', category);
      if (tag) params.append('tag', tag);
      if (search) params.append('search', search);
      if (authorId) params.append('authorId', authorId);
      if (includeScheduled) params.append('includeScheduled', 'true');

      // Fetch posts from API
      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Get a single blog post by slug
  async getPostBySlug(slug) {
    try {
      if (!slug) {
        console.error('getPostBySlug: No slug provided');
        return null;
      }

      console.log(`API: Fetching post with slug '${slug}'`);

      // Fetch post from API
      const response = await fetch(`/api/posts/${slug}`);
      console.log(`API: Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`API: Post with slug '${slug}' not found (404)`);
          return null;
        }
        console.error(`API: Error response: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API: Response data:`, data);

      if (!data.success) {
        console.error('API: getPostBySlug error:', data.error);
        return null;
      }

      console.log(`API: Successfully fetched post with slug '${slug}'`);
      return data.post;
    } catch (error) {
      console.error('API: Error fetching post by slug:', error);
      return null;
    }
  },

  // Create a new blog post
  async createPost({ title, content, excerpt, cover_image, categoryIds = [], tagIds = [], status = 'published', scheduled_publish_date = null }, token) {
    try {
      if (!token) {
        console.error('createPost: No authentication token provided');
        return null;
      }

      // Create post via API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          cover_image,
          categoryIds,
          tagIds,
          status,
          scheduled_publish_date
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.error('createPost: API error:', data.error);
        return null;
      }

      return data.post;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  // Update an existing blog post
  async updatePost(slug, { title, content, excerpt, cover_image, categoryIds = [], tagIds = [], status, scheduled_publish_date }, token) {
    try {
      if (!token) {
        return { success: false, error: 'No authentication token provided' };
      }

      // Update post via API
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          cover_image,
          categoryIds,
          tagIds,
          status,
          scheduled_publish_date
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `API error: ${response.status}`
        };
      }

      const data = await response.json();

      return {
        success: data.success,
        post: data.post,
        error: data.error
      };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Delete a blog post
  async deletePost(slug, token) {
    try {
      if (!token) {
        return { success: false, error: 'No authentication token provided' };
      }

      // Delete post via API
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `API error: ${response.status}`
        };
      }

      const data = await response.json();

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get all categories
  async getCategories() {
    try {
      // Fetch categories from API
      const response = await fetch('/api/categories');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.error('getCategories: API error:', data.error);
        return [];
      }

      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get all tags
  async getTags() {
    try {
      // Fetch tags from API
      const response = await fetch('/api/tags');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.error('getTags: API error:', data.error);
        return [];
      }

      return data.tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
};

export default apiBlogService;
