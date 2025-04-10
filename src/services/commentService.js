import pool from '../db/connection';

const commentService = {
  // Get comments for a post with pagination
  async getComments(postId, { page = 1, limit = 10 } = {}) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get comments
      const commentsResult = await pool.query(`
        SELECT
          c.id, c.content, c.post_id, c.author_id, c.created_at, c.updated_at,
          u.username, u.full_name, u.avatar_url
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `, [postId, limit, offset]);

      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      // Format comments
      const comments = commentsResult.rows.map(row => ({
        id: row.id,
        content: row.content,
        post_id: row.post_id,
        author_id: row.author_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: {
          id: row.author_id,
          username: row.username,
          full_name: row.full_name,
          avatar_url: row.avatar_url
        }
      }));

      return {
        comments,
        totalCount,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  // Get a comment by ID
  async getCommentById(id) {
    try {
      const result = await pool.query(`
        SELECT
          c.id, c.content, c.post_id, c.author_id, c.created_at, c.updated_at,
          u.username, u.full_name, u.avatar_url
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return {
        id: row.id,
        content: row.content,
        post_id: row.post_id,
        author_id: row.author_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: {
          id: row.author_id,
          username: row.username,
          full_name: row.full_name,
          avatar_url: row.avatar_url
        }
      };
    } catch (error) {
      console.error('Error getting comment by ID:', error);
      throw error;
    }
  },

  // Add a comment to a post
  async addComment(postId, authorId, content) {
    try {
      console.log(`Adding comment to post ${postId} by user ${authorId}`);

      // Check if post exists
      console.log('Checking if post exists...');
      const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);

      if (postCheck.rows.length === 0) {
        console.error(`Post with ID ${postId} not found`);
        return null;
      }

      // Check if user exists
      console.log('Checking if user exists...');
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [authorId]);

      if (userCheck.rows.length === 0) {
        console.error(`User with ID ${authorId} not found`);
        return null;
      }

      // Add comment
      console.log('Inserting comment into database...');
      const result = await pool.query(`
        INSERT INTO comments (post_id, author_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, post_id, author_id, content, created_at, updated_at
      `, [postId, authorId, content]);

      const comment = result.rows[0];
      console.log('Comment inserted:', comment);

      // Get author information
      console.log('Getting author information...');
      const authorResult = await pool.query(`
        SELECT id, username, full_name, avatar_url
        FROM users
        WHERE id = $1
      `, [authorId]);

      const author = authorResult.rows[0];
      console.log('Author information retrieved:', author);

      return {
        ...comment,
        author
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return null; // Return null instead of throwing the error
    }
  },

  // Update a comment
  async updateComment(id, content) {
    try {
      const result = await pool.query(`
        UPDATE comments
        SET content = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, post_id, author_id, content, created_at, updated_at
      `, [content, id]);

      if (result.rows.length === 0) {
        return null;
      }

      const comment = result.rows[0];

      // Get author information
      const authorResult = await pool.query(`
        SELECT id, username, full_name, avatar_url
        FROM users
        WHERE id = $1
      `, [comment.author_id]);

      const author = authorResult.rows[0];

      return {
        ...comment,
        author
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(id) {
    try {
      const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);

      return {
        success: result.rows.length > 0
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

export default commentService;
