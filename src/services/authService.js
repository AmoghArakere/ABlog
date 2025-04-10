import jwt from 'jsonwebtoken';
import userService from './userService';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
  },

  // Verify JWT token
  async verifyToken(token) {
    try {
      if (!token) {
        console.log('No token provided');
        return null;
      }

      console.log('Verifying token...');

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded:', decoded);

      // Get user from database
      const user = await userService.getUserById(decoded.id);
      console.log('User found:', user ? 'Yes' : 'No');

      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      // Check if user exists
      const user = await userService.getUserById(userId);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check if username is being changed and if it's already taken
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await userService.getUserByUsername(userData.username);

        if (existingUsername) {
          return { success: false, error: 'Username already in use' };
        }
      }

      // Update user
      const updatedUser = await userService.updateUser(userId, userData);

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

export default authService;
