import pool from '../db/connection';

// Generate a slug from a title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const postService = {
  // Get all posts with pagination
  async getPosts({ page = 1, limit = 10, category = null, tag = null, search = null, authorId = null, includeScheduled = false } = {}) {
    try {
      let query = `
        SELECT
          p.id, p.title, p.slug, p.content, p.excerpt, p.cover_image,
          p.author_id, p.status, p.scheduled_publish_date, p.created_at, p.updated_at,
          u.username, u.full_name, u.avatar_url
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE 1=1
      `;

      const queryParams = [];
      let paramIndex = 1;

      // Filter by status - show all posts for debugging
      console.log('includeScheduled:', includeScheduled);
      if (!includeScheduled) {
        // Temporarily show all posts regardless of status for debugging
        // query += ` AND (p.status = 'published' OR (p.status = 'scheduled' AND p.scheduled_publish_date <= NOW()))`;
      }
      console.log('Query will include all posts regardless of status for debugging');

      // Filter by author
      if (authorId) {
        query += ` AND p.author_id = $${paramIndex}`;
        queryParams.push(authorId);
        paramIndex++;
      }

      // Filter by search term
      if (search) {
        query += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Filter by category
      if (category) {
        query += `
          AND p.id IN (
            SELECT pc.post_id
            FROM post_categories pc
            JOIN categories c ON pc.category_id = c.id
            WHERE c.slug = $${paramIndex}
          )
        `;
        queryParams.push(category);
        paramIndex++;
      }

      // Filter by tag
      if (tag) {
        query += `
          AND p.id IN (
            SELECT pt.post_id
            FROM post_tags pt
            JOIN tags t ON pt.tag_id = t.id
            WHERE t.slug = $${paramIndex}
          )
        `;
        queryParams.push(tag);
        paramIndex++;
      }

      // Count total posts
      console.log('Counting total posts...');
      const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
      console.log('Count query:', countQuery);
      console.log('Count query params:', queryParams);
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);
      console.log(`Total posts: ${total}`);

      // Add order and pagination
      query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, (page - 1) * limit);
      console.log('Final query:', query);
      console.log('Final query params:', queryParams);

      // Execute the query
      console.log('Executing query...');
      const result = await pool.query(query, queryParams);
      console.log(`Query returned ${result.rows.length} posts`);

      // Get posts with categories and tags
      const posts = await Promise.all(result.rows.map(async (post) => {
        // Get categories for this post
        const categoriesResult = await pool.query(`
          SELECT c.id, c.name, c.slug, c.description
          FROM categories c
          JOIN post_categories pc ON c.id = pc.category_id
          WHERE pc.post_id = $1
        `, [post.id]);

        // Get tags for this post
        const tagsResult = await pool.query(`
          SELECT t.id, t.name, t.slug
          FROM tags t
          JOIN post_tags pt ON t.id = pt.tag_id
          WHERE pt.post_id = $1
        `, [post.id]);

        return {
          ...post,
          author: {
            id: post.author_id,
            username: post.username,
            full_name: post.full_name,
            avatar_url: post.avatar_url
          },
          categories: categoriesResult.rows,
          tags: tagsResult.rows
        };
      }));

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      console.log(`Total pages: ${totalPages}`);

      const response = {
        posts,
        total,
        page,
        limit,
        totalPages
      };

      console.log('Returning response:', {
        postsCount: posts.length,
        total,
        page,
        limit,
        totalPages
      });

      return response;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  // Get a post by slug
  async getPostBySlug(slug) {
    try {
      console.log(`DB: Fetching post with slug: ${slug}`);

      // Get the post
      const query = `
        SELECT
          p.id, p.title, p.slug, p.content, p.excerpt, p.cover_image,
          p.author_id, p.status, p.scheduled_publish_date, p.created_at, p.updated_at,
          u.username, u.full_name, u.avatar_url, u.bio, u.website
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.slug = $1
      `;

      console.log(`DB: Executing query: ${query}`);
      console.log(`DB: Query params: [${slug}]`);

      const result = await pool.query(query, [slug]);
      console.log(`DB: Query returned ${result.rows.length} rows`);

      if (result.rows.length === 0) {
        console.log(`DB: No post found with slug: ${slug}`);
        return null;
      }

      const post = result.rows[0];
      console.log(`DB: Found post with ID: ${post.id}, Title: ${post.title}`);
      console.log(`DB: Post status: ${post.status}`);
      console.log(`DB: Post author: ${post.author_id} (${post.username})`);
      console.log(`DB: Post created at: ${post.created_at}`);
      console.log(`DB: Post updated at: ${post.updated_at}`);

      // Get categories for this post
      const categoriesResult = await pool.query(`
        SELECT c.id, c.name, c.slug, c.description
        FROM categories c
        JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = $1
      `, [post.id]);

      // Get tags for this post
      const tagsResult = await pool.query(`
        SELECT t.id, t.name, t.slug
        FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = $1
      `, [post.id]);

      const formattedPost = {
        ...post,
        author: {
          id: post.author_id,
          username: post.username,
          full_name: post.full_name,
          avatar_url: post.avatar_url,
          bio: post.bio,
          website: post.website
        },
        categories: categoriesResult.rows,
        tags: tagsResult.rows
      };

      console.log(`DB: Returning formatted post with ${categoriesResult.rows.length} categories and ${tagsResult.rows.length} tags`);
      return formattedPost;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null; // Return null instead of throwing to prevent crashes
    }
  },

  // Create a new post
  async createPost({ title, content, excerpt, cover_image, author_id, categoryIds = [], tagIds = [], status = 'published', scheduled_publish_date = null }) {
    try {
      // Generate slug from title
      let slug = generateSlug(title);

      // Check if slug already exists
      const slugCheck = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);

      if (slugCheck.rows.length > 0) {
        // Append a random string to make the slug unique
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      }

      // Start a transaction
      await pool.query('BEGIN');

      // Create the post
      const postResult = await pool.query(`
        INSERT INTO posts (
          title, slug, content, excerpt, cover_image, author_id, status, scheduled_publish_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, slug, content, excerpt, cover_image, author_id, status, scheduled_publish_date, created_at, updated_at
      `, [
        title,
        slug,
        content,
        excerpt || `${title.substring(0, 150)}...`,
        cover_image || '',
        author_id,
        status,
        status === 'scheduled' ? scheduled_publish_date : null
      ]);

      const post = postResult.rows[0];

      // Add categories
      if (categoryIds.length > 0) {
        const categoryValues = categoryIds.map(categoryId => {
          return `(${post.id}, ${categoryId})`;
        }).join(', ');

        await pool.query(`
          INSERT INTO post_categories (post_id, category_id)
          VALUES ${categoryValues}
        `);
      }

      // Add tags
      if (tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => {
          return `(${post.id}, ${tagId})`;
        }).join(', ');

        await pool.query(`
          INSERT INTO post_tags (post_id, tag_id)
          VALUES ${tagValues}
        `);
      }

      // Commit the transaction
      await pool.query('COMMIT');

      // Get the complete post
      return await this.getPostBySlug(post.slug);
    } catch (error) {
      // Rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update a post
  async updatePost(id, { title, content, excerpt, cover_image, categoryIds, tagIds, status, scheduled_publish_date }) {
    try {
      // Start a transaction
      await pool.query('BEGIN');

      // Prepare update fields
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(title);
        paramIndex++;

        // Update slug if title changes
        const currentPost = await pool.query('SELECT title FROM posts WHERE id = $1', [id]);

        if (currentPost.rows.length > 0 && currentPost.rows[0].title !== title) {
          const newSlug = generateSlug(title);

          // Check if new slug already exists (excluding this post)
          const slugCheck = await pool.query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [newSlug, id]);

          if (slugCheck.rows.length > 0) {
            // Append a random string to make the slug unique
            updates.push(`slug = $${paramIndex}`);
            values.push(`${newSlug}-${Math.random().toString(36).substring(2, 8)}`);
          } else {
            updates.push(`slug = $${paramIndex}`);
            values.push(newSlug);
          }

          paramIndex++;
        }
      }

      if (content !== undefined) {
        updates.push(`content = $${paramIndex}`);
        values.push(content);
        paramIndex++;
      }

      if (excerpt !== undefined) {
        updates.push(`excerpt = $${paramIndex}`);
        values.push(excerpt);
        paramIndex++;
      }

      if (cover_image !== undefined) {
        updates.push(`cover_image = $${paramIndex}`);
        values.push(cover_image);
        paramIndex++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      if (status === 'scheduled' && scheduled_publish_date) {
        updates.push(`scheduled_publish_date = $${paramIndex}`);
        values.push(scheduled_publish_date);
        paramIndex++;
      } else if (status !== 'scheduled') {
        updates.push(`scheduled_publish_date = NULL`);
      }

      // Add updated_at
      updates.push(`updated_at = NOW()`);

      // Update the post if there are fields to update
      if (updates.length > 0) {
        values.push(id);

        await pool.query(`
          UPDATE posts
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
        `, values);
      }

      // Update categories if provided
      if (categoryIds !== undefined) {
        // Delete existing categories
        await pool.query('DELETE FROM post_categories WHERE post_id = $1', [id]);

        // Add new categories
        if (categoryIds.length > 0) {
          const categoryValues = categoryIds.map(categoryId => {
            return `(${id}, ${categoryId})`;
          }).join(', ');

          await pool.query(`
            INSERT INTO post_categories (post_id, category_id)
            VALUES ${categoryValues}
          `);
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        // Delete existing tags
        await pool.query('DELETE FROM post_tags WHERE post_id = $1', [id]);

        // Add new tags
        if (tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => {
            return `(${id}, ${tagId})`;
          }).join(', ');

          await pool.query(`
            INSERT INTO post_tags (post_id, tag_id)
            VALUES ${tagValues}
          `);
        }
      }

      // Commit the transaction
      await pool.query('COMMIT');

      // Get the updated post
      const postResult = await pool.query('SELECT slug FROM posts WHERE id = $1', [id]);

      if (postResult.rows.length === 0) {
        return { success: false, error: 'Post not found' };
      }

      const post = await this.getPostBySlug(postResult.rows[0].slug);

      return { success: true, post };
    } catch (error) {
      // Rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(id) {
    try {
      // Start a transaction
      await pool.query('BEGIN');

      // Delete related records
      await pool.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
      await pool.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
      await pool.query('DELETE FROM comments WHERE post_id = $1', [id]);
      await pool.query('DELETE FROM likes WHERE post_id = $1', [id]);
      await pool.query('DELETE FROM bookmarks WHERE post_id = $1', [id]);

      // Delete the post
      const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);

      // Commit the transaction
      await pool.query('COMMIT');

      return { success: result.rows.length > 0 };
    } catch (error) {
      // Rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get all categories
  async getCategories() {
    try {
      const result = await pool.query('SELECT * FROM categories ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Get all tags
  async getTags() {
    try {
      const result = await pool.query('SELECT * FROM tags ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(name, description = '') {
    try {
      const slug = generateSlug(name);

      // Check if category already exists
      const existingCategory = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);

      if (existingCategory.rows.length > 0) {
        return { success: false, error: 'Category already exists' };
      }

      // Create the category
      const result = await pool.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [name, slug, description]);

      return { success: true, category: result.rows[0] };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Create a new tag
  async createTag(name) {
    try {
      const slug = generateSlug(name);

      // Check if tag already exists
      const existingTag = await pool.query('SELECT id FROM tags WHERE slug = $1', [slug]);

      if (existingTag.rows.length > 0) {
        return { success: false, error: 'Tag already exists' };
      }

      // Create the tag
      const result = await pool.query(`
        INSERT INTO tags (name, slug)
        VALUES ($1, $2)
        RETURNING *
      `, [name, slug]);

      return { success: true, tag: result.rows[0] };
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }
};

export default postService;
