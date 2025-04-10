import pool from '../db/connection';
import bcrypt from 'bcrypt';

// Generate a slug from a string
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const userService = {
  // Get user by ID
  async getUserById(id) {
    try {
      const result = await pool.query(
        'SELECT id, email, username, full_name, avatar_url, cover_image, bio, website, location, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT id, email, username, full_name, avatar_url, cover_image, bio, website, location, created_at, updated_at FROM users WHERE username = $1',
        [username]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  // Create a new user
  async createUser(userData) {
    try {
      const { email, password, username, full_name, avatar_url, cover_image, bio, website, location } = userData;

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate username from email if not provided
      const finalUsername = username || generateSlug(email.split('@')[0]);

      // Insert the user
      const result = await pool.query(
        `INSERT INTO users (
          email, password, username, full_name, avatar_url, cover_image, bio, website, location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, username, full_name, avatar_url, cover_image, bio, website, location, created_at, updated_at`,
        [email, hashedPassword, finalUsername, full_name || '', avatar_url || '', cover_image || '', bio || '', website || '', location || '']
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const { username, full_name, avatar_url, cover_image, bio, website, location } = userData;

      // Update the user
      const result = await pool.query(
        `UPDATE users
        SET username = $1, full_name = $2, avatar_url = $3, cover_image = $4, bio = $5, website = $6, location = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING id, email, username, full_name, avatar_url, cover_image, bio, website, location, created_at, updated_at`,
        [username, full_name, avatar_url, cover_image, bio, website, location, id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Verify password
  async verifyPassword(email, password) {
    console.log(`Verifying password for email: ${email}`);
    try {
      // Check if pool is available
      if (!pool) {
        console.error('Database pool is not available');
        return { success: false, error: 'Database connection error' };
      }

      // Get the user
      console.log('Getting user by email...');
      const user = await this.getUserByEmail(email);

      if (!user) {
        console.log(`User not found: ${email}`);
        return { success: false, error: 'Invalid email or password' };
      }

      console.log(`User found: ${user.username}`);

      // Compare passwords
      console.log('Comparing passwords...');
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        console.log('Password does not match');
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('Password matches');

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      console.log('Password verification successful');
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error verifying password:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

export default userService;
