// Netlify function to handle API requests
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Schema SQL as a string
const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  cover_image TEXT,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  scheduled_publish_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Post categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
`;

// Initialize the database
async function initDatabase() {
  try {
    console.log('Initializing database...');
    await pool.query(schema);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// User service functions
const userService = {
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
      const finalUsername = username || email.split('@')[0];

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

  // Verify password
  async verifyPassword(email, password) {
    try {
      // Get the user
      const user = await this.getUserByEmail(email);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Compare passwords
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error verifying password:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

// Auth service functions
const authService = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      // Verify password
      const result = await userService.verifyPassword(email, password);

      if (!result.success) {
        return result;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: result.user,
        token
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      // Check if email already exists
      const existingUser = await userService.getUserByEmail(email);

      if (existingUser) {
        return { success: false, error: 'Email already in use' };
      }

      // Check if username already exists
      if (userData.username) {
        const existingUsername = await userService.getUserByUsername(userData.username);

        if (existingUsername) {
          return { success: false, error: 'Username already in use' };
        }
      }

      // Create user
      const user = await userService.createUser({
        email,
        password,
        username: userData.username,
        full_name: userData.full_name || '',
        avatar_url: userData.avatar_url || '',
        cover_image: userData.cover_image || '',
        bio: userData.bio || '',
        website: userData.website || '',
        location: userData.location || ''
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

// Handler function
exports.handler = async function(event, context) {
  // Initialize database
  await initDatabase();

  // Log the full event for debugging
  console.log('Full event:', JSON.stringify(event, null, 2));

  // Get the path from the event
  let path = '';
  if (event.path.includes('/.netlify/functions/api/')) {
    path = event.path.replace('/.netlify/functions/api/', '');
  } else if (event.path.includes('/api/')) {
    path = event.path.replace('/api/', '');
  } else {
    // Handle case where path doesn't include expected prefix
    path = event.rawUrl ? new URL(event.rawUrl).pathname.replace('/api/', '') : '';
  }

  const segments = path.split('/');

  console.log(`API request to: ${path}`);
  console.log('HTTP method:', event.httpMethod);
  console.log('Path segments:', segments);

  // Special case for when the path is empty or just "auth"
  if (path === '' || path === 'auth') {
    // Check if this is a login or register request based on the body
    try {
      const body = JSON.parse(event.body || '{}');
      if (body.email && body.password) {
        if (event.httpMethod === 'POST') {
          // Check if this is a register request (has username)
          if (body.username) {
            console.log(`Registration attempt for: ${body.email}`);

            const result = await authService.signUp(body.email, body.password, {
              username: body.username,
              full_name: body.full_name || '',
              avatar_url: body.avatar_url || '',
              bio: body.bio || '',
              website: body.website || '',
              location: body.location || ''
            });

            return {
              statusCode: result.success ? 201 : 400,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(result)
            };
          } else {
            // Assume it's a login request
            console.log(`Login attempt for: ${body.email}`);

            const result = await authService.signIn(body.email, body.password);

            return {
              statusCode: result.success ? 200 : 401,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(result)
            };
          }
        }
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
    }
  }

  // Handle different API endpoints
  if (segments[0] === 'auth') {
    // Auth endpoints
    if (segments[1] === 'login' && event.httpMethod === 'POST') {
      try {
        const body = JSON.parse(event.body);
        const { email, password } = body;

        console.log(`Login attempt for: ${email}`);

        const result = await authService.signIn(email, password);

        return {
          statusCode: result.success ? 200 : 401,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(result)
        };
      } catch (error) {
        console.error('Error in login endpoint:', error);

        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'An unexpected error occurred'
          })
        };
      }
    } else if (segments[1] === 'register' && event.httpMethod === 'POST') {
      try {
        const body = JSON.parse(event.body);
        const { email, password, username, full_name } = body;

        console.log(`Registration attempt for: ${email}`);

        const result = await authService.signUp(email, password, {
          username,
          full_name,
          avatar_url: body.avatar_url || '',
          bio: body.bio || '',
          website: body.website || '',
          location: body.location || ''
        });

        return {
          statusCode: result.success ? 201 : 400,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(result)
        };
      } catch (error) {
        console.error('Error in register endpoint:', error);

        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'An unexpected error occurred'
          })
        };
      }
    }
  } else if (segments[0] === 'test' && event.httpMethod === 'GET') {
    // Test endpoint
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'API is working',
        path: path
      })
    };
  }

  // If no endpoint matched, return 404
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: 'API endpoint not found'
    })
  };
};
