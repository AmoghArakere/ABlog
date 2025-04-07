import { e as createComponent, f as createAstro, h as addAttribute, k as renderHead, i as renderComponent, r as renderTemplate, l as renderSlot } from './astro/server_9nBo-_fU.mjs';
import 'kleur/colors';
import 'html-escaper';
/* empty css                         */
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { createContext, useState, useEffect, useContext } from 'react';
import nodemailer from 'nodemailer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { Menu, ChevronDown, User, PenSquare, LogOut } from 'lucide-react';

// Email configuration
let transporter;

/**
 * Initialize the email transporter
 * This function creates a transporter based on environment variables
 * For production, it uses the configured SMTP settings
 * For development, it creates a test account with Ethereal
 */
async function initializeTransporter() {
  if (transporter) return transporter;

  // Check if we're in a production environment with configured email settings
  if (process.env.EMAIL_HOST && 
      process.env.EMAIL_PORT && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS) {
    
    // Create a production transporter with the provided credentials
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('Email service initialized with production settings');
    return transporter;
  }
  
  // For development/testing, create a test account with Ethereal
  try {
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the test account
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Email test account created:', testAccount.user);
    return transporter;
  } catch (error) {
    console.error('Failed to create email test account:', error);
    
    // Fallback to a mock transporter that logs emails instead of sending them
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('Email would be sent with the following options:');
        console.log(mailOptions);
        return {
          messageId: 'mock-message-id',
          previewURL: null,
        };
      },
    };
    
    return transporter;
  }
}

/**
 * Send a password reset email
 * @param {string} email - The recipient's email address
 * @param {string} resetLink - The password reset link
 * @returns {Promise<object>} - The result of the email sending operation
 */
async function sendPasswordResetEmail(email, resetLink) {
  try {
    const transport = await initializeTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ABlog Support" <support@ablog.com>',
      to: email,
      subject: 'Reset Your ABlog Password',
      text: `
        Hello,
        
        You recently requested to reset your password for your ABlog account. Click the link below to reset it:
        
        ${resetLink}
        
        This link will expire in 24 hours.
        
        If you did not request a password reset, please ignore this email or contact support if you have questions.
        
        Thanks,
        The ABlog Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #6d28d9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello,</p>
            <p>You recently requested to reset your password for your ABlog account. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="margin-bottom: 5px;">If the button doesn't work, you can also click on the link below or copy it to your browser:</p>
            <p style="margin-top: 0; word-break: break-all; color: #6d28d9;">
              <a href="${resetLink}" style="color: #6d28d9;">${resetLink}</a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p style="margin-top: 30px; margin-bottom: 5px;">Thanks,</p>
            <p style="margin-top: 0;"><strong>The ABlog Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2025 ABlog. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // Send the email
    const info = await transport.sendMail(mailOptions);
    
    console.log('Password reset email sent:', info.messageId);
    
    // For Ethereal test accounts, return the preview URL
    if (info.messageId && nodemailer.getTestMessageUrl && info.messageId.includes('ethereal')) {
      const previewURL = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewURL);
      return {
        success: true,
        messageId: info.messageId,
        previewURL: previewURL,
      };
    }
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send a welcome email to a new user
 * @param {string} email - The recipient's email address
 * @param {string} name - The recipient's name
 * @returns {Promise<object>} - The result of the email sending operation
 */
async function sendWelcomeEmail(email, name) {
  try {
    const transport = await initializeTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ABlog Team" <welcome@ablog.com>',
      to: email,
      subject: 'Welcome to ABlog!',
      text: `
        Hello ${name},
        
        Welcome to ABlog! We're excited to have you join our community of bloggers and readers.
        
        Get started by exploring the latest posts or creating your own blog post to share your thoughts with the world.
        
        If you have any questions or need assistance, feel free to reach out to our support team.
        
        Happy blogging!
        
        The ABlog Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #6d28d9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ABlog!</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello ${name},</p>
            <p>Welcome to ABlog! We're excited to have you join our community of bloggers and readers.</p>
            <p>Get started by exploring the latest posts or creating your own blog post to share your thoughts with the world.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SITE_URL || 'http://localhost:4322'}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Start Exploring</a>
            </div>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p style="margin-top: 30px; margin-bottom: 5px;">Happy blogging!</p>
            <p style="margin-top: 0;"><strong>The ABlog Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2025 ABlog. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // Send the email
    const info = await transport.sendMail(mailOptions);
    
    console.log('Welcome email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

const emailService = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Check if we're in a browser environment
const isBrowser$1 = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage$2 = (key, defaultValue = '[]') => {
  if (!isBrowser$1) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe localStorage setter
const setToStorage$2 = (key, value) => {
  if (!isBrowser$1) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

// Simple authentication service using localStorage
const authService = {
  // Get the current user
  getCurrentUser() {
    const userJson = getFromStorage$2('currentUser', null);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const users = JSON.parse(getFromStorage$2('users'));
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Don't store the password in the current user
      const { password: _, ...userWithoutPassword } = user;

      // Store the current user in localStorage
      setToStorage$2('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const users = JSON.parse(getFromStorage$2('users'));

      // Check if email already exists
      if (users.some(u => u.email === email)) {
        return { success: false, error: 'Email already in use' };
      }

      // Check if username already exists
      if (userData.username && users.some(u => u.username === userData.username)) {
        return { success: false, error: 'Username already in use' };
      }

      // Create new user
      const newUser = {
        id: generateId(),
        email,
        password,
        username: userData.username || email.split('@')[0],
        full_name: userData.full_name || '',
        avatar_url: userData.avatar_url || '',
        cover_image: userData.cover_image || '',
        bio: userData.bio || '',
        website: userData.website || '',
        location: userData.location || '',
        created_at: new Date().toISOString()
      };

      // Add user to users array
      users.push(newUser);
      setToStorage$2('users', JSON.stringify(users));

      // Don't store the password in the current user
      const { password: _, ...userWithoutPassword } = newUser;

      // Store the current user in localStorage
      setToStorage$2('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign out
  async signOut() {
    try {
      if (isBrowser$1) {
        localStorage.removeItem('currentUser');
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Generate a reset token
  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  // Request password reset
  async resetPassword(email) {
    try {
      const users = JSON.parse(getFromStorage$2('users'));
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, error: 'Email not found' };
      }

      // Generate a reset token and expiration time (24 hours from now)
      const resetToken = this.generateResetToken();
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 24);

      // Update the user with the reset token and expiration
      users[userIndex].resetToken = resetToken;
      users[userIndex].resetTokenExpires = resetTokenExpires.toISOString();
      setToStorage$2('users', JSON.stringify(users));

      // Create the reset link
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Send the password reset email
      const emailResult = await emailService.sendPasswordResetEmail(email, resetLink);

      if (emailResult.success) {
        console.log(`Password reset email sent to ${email}`);

        // If using Ethereal for testing, provide the preview URL
        if (emailResult.previewURL) {
          console.log('Email preview URL:', emailResult.previewURL);
          return {
            success: true,
            message: 'Password reset instructions have been sent to your email. Please check your inbox.',
            previewURL: emailResult.previewURL
          };
        }

        return {
          success: true,
          message: 'Password reset instructions have been sent to your email. Please check your inbox.'
        };
      } else {
        console.error('Failed to send password reset email:', emailResult.error);
        return {
          success: false,
          error: 'Failed to send password reset email. Please try again later.'
        };
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Complete password reset
  async completePasswordReset(email, token, newPassword) {
    try {
      const users = JSON.parse(getFromStorage$2('users'));
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, error: 'Email not found' };
      }

      const user = users[userIndex];

      // Verify the reset token
      if (!user.resetToken || user.resetToken !== token) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Check if the token has expired
      const tokenExpires = new Date(user.resetTokenExpires);
      const now = new Date();
      if (now > tokenExpires) {
        return { success: false, error: 'Reset token has expired. Please request a new password reset.' };
      }

      // Update the user's password and clear the reset token
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;
      users[userIndex] = user;
      setToStorage$2('users', JSON.stringify(users));

      return { success: true };
    } catch (error) {
      console.error('Error completing password reset:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      const users = JSON.parse(getFromStorage$2('users'));
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Update user data
      users[userIndex] = { ...users[userIndex], ...userData };

      // Don't update password
      if (userData.password) {
        delete userData.password;
      }

      setToStorage$2('users', JSON.stringify(users));

      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        setToStorage$2('currentUser', JSON.stringify({ ...currentUser, ...userData }));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

const AuthContext = createContext();
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);
  const signIn = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const signUp = async (email, password, metadata = {}) => {
    try {
      const result = await authService.signUp(email, password, metadata);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const signOut = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const resetPassword = async (email) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const completePasswordReset = async (email, token, newPassword) => {
    try {
      return await authService.completePasswordReset(email, token, newPassword);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const updateProfile = async (data) => {
    try {
      if (!user) return { success: false, error: "Not logged in" };
      const result = await authService.updateProfile(user.id, data);
      if (result.success) {
        setUser({ ...user, ...data });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    completePasswordReset,
    updateProfile
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param  {...string} inputs - Class names to combine
 * @returns {string} - Merged class names
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Toast = ({
  message,
  variant = "default",
  duration = 3e3,
  onClose,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };
  const variantClasses = {
    default: "bg-black text-white border-gray-700",
    success: "bg-black text-white border-purple-600",
    error: "bg-black text-red-500 border-red-600",
    warning: "bg-black text-amber-400 border-amber-500"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "fixed top-16 left-0 right-0 mx-auto w-full max-w-screen-md z-50 flex items-center justify-between px-6 py-3 shadow-lg transition-all duration-300 border-b",
        variantClasses[variant],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        className
      ),
      role: "alert",
      ...props,
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "font-medium", children: message }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleClose,
            className: "text-white hover:text-gray-200 focus:outline-none ml-4 pointer-events-auto",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsx("span", { className: "bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-md", children: "OK" })
          }
        )
      ]
    }
  );
};
const ToastContainer = ({ children }) => {
  return /* @__PURE__ */ jsx("div", { className: "fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none", children });
};
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, ...options }]);
    return id;
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast2) => toast2.id !== id));
  };
  const toast = {
    show: (message, options) => addToast(message, options),
    success: (message, options) => addToast(message, { variant: "success", ...options }),
    error: (message, options) => addToast(message, { variant: "error", ...options }),
    warning: (message, options) => addToast(message, { variant: "warning", ...options }),
    remove: removeToast
  };
  return { toasts, toast, removeToast };
};

const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const { toasts, toast, removeToast } = useToast();
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: toast, children: [
    children,
    /* @__PURE__ */ jsx(ToastContainer, { children: toasts.map((t) => /* @__PURE__ */ jsx(
      Toast,
      {
        message: t.message,
        variant: t.variant,
        duration: t.duration,
        onClose: () => removeToast(t.id)
      },
      t.id
    )) })
  ] });
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage$1 = (key, defaultValue = '[]') => {
  if (!isBrowser) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe localStorage setter
const setToStorage$1 = (key, value) => {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

// Sample data for the blog
const initializeSampleData = () => {
  // Check if we're in a browser environment
  if (!isBrowser) return;

  // Check if data is already initialized
  if (getFromStorage$1('dataInitialized', null)) {
    return;
  }

  // Sample users
  const users = [
    {
      id: '1',
      email: 'john@example.com',
      password: 'password123',
      username: 'johndoe',
      full_name: 'John Doe',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'Web Developer | Tech Enthusiast | Coffee Lover',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
      created_at: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      email: 'jane@example.com',
      password: 'password123',
      username: 'janesmith',
      full_name: 'Jane Smith',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'UX Designer | Creative Thinker | Dog Person',
      website: 'https://janesmith.com',
      location: 'New York, NY',
      created_at: '2023-01-02T00:00:00.000Z'
    },
    {
      id: '3',
      email: 'alex@example.com',
      password: 'password123',
      username: 'alexjohnson',
      full_name: 'Alex Johnson',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'Product Manager | Tech Blogger | Fitness Enthusiast',
      website: 'https://alexjohnson.com',
      location: 'Seattle, WA',
      created_at: '2023-01-03T00:00:00.000Z'
    }
  ];

  // Sample categories
  const categories = [
    {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      description: 'Tech-related posts'
    },
    {
      id: '2',
      name: 'Design',
      slug: 'design',
      description: 'Design-related posts'
    },
    {
      id: '3',
      name: 'Business',
      slug: 'business',
      description: 'Business-related posts'
    },
    {
      id: '4',
      name: 'Health',
      slug: 'health',
      description: 'Health-related posts'
    },
    {
      id: '5',
      name: 'Productivity',
      slug: 'productivity',
      description: 'Productivity tips and tricks'
    }
  ];

  // Sample tags
  const tags = [
    { id: '1', name: 'JavaScript', slug: 'javascript' },
    { id: '2', name: 'React', slug: 'react' },
    { id: '3', name: 'CSS', slug: 'css' },
    { id: '4', name: 'Web Development', slug: 'web-development' },
    { id: '5', name: 'UI/UX', slug: 'ui-ux' },
    { id: '6', name: 'Productivity', slug: 'productivity' },
    { id: '7', name: 'Career', slug: 'career' },
    { id: '8', name: 'Health', slug: 'health' },
    { id: '9', name: 'Fitness', slug: 'fitness' },
    { id: '10', name: 'Business', slug: 'business' }
  ];

  // Sample posts
  const posts = [
    {
      id: '1',
      title: 'Getting Started with Web Development',
      slug: 'getting-started-with-web-development',
      content: `
        <h2>Introduction to Web Development</h2>
        <p>Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.</p>

        <h3>Front-end Development</h3>
        <p>Front-end web development, also known as client-side development, is the practice of producing HTML, CSS and JavaScript for a website or Web Application so that a user can see and interact with them directly.</p>

        <h3>Back-end Development</h3>
        <p>Back-end development covers server-side web application logic and integration and activities, like writing APIs, creating libraries, and working with system components instead of the frontend code, which is what the user sees.</p>

        <h2>Essential Technologies</h2>
        <h3>HTML</h3>
        <p>HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure of web content.</p>

        <pre><code>
        &lt;!DOCTYPE html&gt;
        &lt;html&gt;
        &lt;head&gt;
            &lt;title&gt;My First Web Page&lt;/title&gt;
        &lt;/head&gt;
        &lt;body&gt;
            &lt;h1&gt;Hello, World!&lt;/h1&gt;
            &lt;p&gt;This is my first web page.&lt;/p&gt;
        &lt;/body&gt;
        &lt;/html&gt;
        </code></pre>

        <h3>CSS</h3>
        <p>CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. CSS is designed to enable the separation of presentation and content.</p>

        <pre><code>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }

        h1 {
            color: #333;
            text-align: center;
        }

        p {
            line-height: 1.6;
            color: #666;
        }
        </code></pre>

        <h3>JavaScript</h3>
        <p>JavaScript is a programming language that conforms to the ECMAScript specification. JavaScript is high-level, often just-in-time compiled, and multi-paradigm.</p>

        <pre><code>
        // Simple JavaScript example
        function greet(name) {
            return \`Hello, \${name}!\`;
        }

        console.log(greet('World')); // Output: Hello, World!

        // DOM manipulation
        document.getElementById('demo').innerHTML = greet('Web Developer');
        </code></pre>

        <h2>Getting Started</h2>
        <p>To get started with web development, you'll need a few tools:</p>
        <ul>
            <li>A text editor or IDE (like VS Code, Sublime Text, or Atom)</li>
            <li>A web browser (like Chrome, Firefox, or Edge)</li>
            <li>Basic knowledge of HTML, CSS, and JavaScript</li>
        </ul>

        <p>Start by creating a simple HTML file, then add some CSS to style it, and finally add some JavaScript to make it interactive. As you get more comfortable, you can explore frameworks like React, Angular, or Vue.js for front-end development, and Node.js, Django, or Ruby on Rails for back-end development.</p>

        <h2>Conclusion</h2>
        <p>Web development is an exciting field with endless possibilities. Whether you're interested in building websites, web applications, or mobile apps, the skills you learn in web development will be valuable. Start small, be consistent, and don't be afraid to experiment and learn from your mistakes.</p>
      `,
      excerpt: 'Learn the basics of HTML, CSS, and JavaScript to kickstart your web development journey.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '1',
      author: users[0],
      categories: [categories[0]],
      tags: [tags[0], tags[2], tags[3]],
      status: 'published',
      created_at: '2023-04-01T00:00:00.000Z',
      updated_at: '2023-04-01T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'UI/UX Design Principles for Beginners',
      slug: 'ui-ux-design-principles-for-beginners',
      content: `
        <h2>Introduction to UI/UX Design</h2>
        <p>UI (User Interface) and UX (User Experience) design are two critical aspects of creating digital products that are both visually appealing and easy to use. While they are often mentioned together, they refer to different aspects of the design process.</p>

        <h3>What is UI Design?</h3>
        <p>UI design focuses on the visual elements of a digital product, such as buttons, icons, spacing, typography, color schemes, and responsive design. A good UI designer ensures that the interface is attractive, consistent, and aligns with the brand's identity.</p>

        <h3>What is UX Design?</h3>
        <p>UX design is about the overall feel of the experience. It's less about how a product looks and more about how it works. UX designers focus on the user's journey to solve a problem, the steps they take to accomplish a task, and the feelings they experience during the process.</p>

        <h2>Core Principles of UI Design</h2>

        <h3>1. Clarity</h3>
        <p>The interface should be clear and easy to understand. Users should be able to recognize elements and understand their purpose without having to think too much.</p>

        <h3>2. Consistency</h3>
        <p>Consistency in design creates familiarity and comfort. Use consistent elements, patterns, and styles throughout your interface to help users learn and navigate your product more easily.</p>

        <h3>3. Visual Hierarchy</h3>
        <p>Visual hierarchy guides users through the interface by emphasizing important elements and de-emphasizing less important ones. This can be achieved through size, color, contrast, and spacing.</p>

        <h3>4. Accessibility</h3>
        <p>Design for all users, including those with disabilities. Ensure your interface is usable by people with various impairments, such as visual, motor, or cognitive disabilities.</p>

        <h2>Core Principles of UX Design</h2>

        <h3>1. User-Centered Design</h3>
        <p>Always design with the user in mind. Understand their needs, goals, and pain points, and create solutions that address these effectively.</p>

        <h3>2. Simplicity</h3>
        <p>Keep it simple. Users appreciate interfaces that are easy to understand and use. Avoid unnecessary complexity and focus on the core functionality.</p>

        <h3>3. Feedback</h3>
        <p>Provide clear feedback for user actions. Users should always know what's happening in the system, whether their actions were successful, and what to do next.</p>

        <h3>4. Usability</h3>
        <p>Your product should be easy to use and learn. Users should be able to accomplish their goals efficiently and with minimal frustration.</p>

        <h2>The Design Process</h2>

        <h3>1. Research</h3>
        <p>Start by understanding your users, their needs, and the context in which they'll use your product. This can involve user interviews, surveys, and competitive analysis.</p>

        <h3>2. Wireframing</h3>
        <p>Create low-fidelity representations of your interface to explore different layouts and structures. Wireframes focus on functionality rather than visual design.</p>

        <h3>3. Prototyping</h3>
        <p>Build interactive prototypes to test your design solutions. Prototypes allow you to simulate the user experience and gather feedback before development.</p>

        <h3>4. Testing</h3>
        <p>Test your designs with real users to identify usability issues and areas for improvement. Iterate based on feedback to refine your design.</p>

        <h3>5. Implementation</h3>
        <p>Work with developers to bring your design to life. Provide detailed specifications and assets, and be available to answer questions and make adjustments as needed.</p>

        <h2>Tools for UI/UX Design</h2>
        <p>There are many tools available for UI/UX design, each with its own strengths and weaknesses. Some popular options include:</p>
        <ul>
            <li>Figma: A collaborative interface design tool</li>
            <li>Sketch: A vector-based design tool for macOS</li>
            <li>Adobe XD: A vector-based design tool for UI/UX</li>
            <li>InVision: A prototyping and collaboration tool</li>
            <li>Axure RP: A tool for creating interactive prototypes</li>
        </ul>

        <h2>Conclusion</h2>
        <p>UI/UX design is a complex but rewarding field that combines creativity with problem-solving. By focusing on the user and following established design principles, you can create digital products that are both beautiful and functional. Remember that design is an iterative process, and there's always room for improvement based on user feedback and changing needs.</p>
      `,
      excerpt: 'Discover the fundamental principles of creating user-friendly and visually appealing interfaces.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '2',
      author: users[1],
      categories: [categories[1]],
      tags: [tags[4]],
      status: 'published',
      created_at: '2023-03-28T00:00:00.000Z',
      updated_at: '2023-03-28T00:00:00.000Z'
    },
    {
      id: '3',
      title: '10 Tips to Boost Your Productivity',
      slug: '10-tips-to-boost-your-productivity',
      content: `
        <h2>Introduction</h2>
        <p>In today's fast-paced world, productivity is more important than ever. Whether you're a student, professional, or entrepreneur, being able to accomplish more in less time can significantly impact your success and well-being. This article shares ten practical tips to help you boost your productivity and make the most of your time.</p>

        <h2>1. Start Your Day with a Plan</h2>
        <p>One of the most effective ways to increase productivity is to start each day with a clear plan. Take a few minutes each morning (or the night before) to outline your tasks for the day. Prioritize them based on importance and urgency, and set realistic goals for what you want to accomplish.</p>

        <h2>2. Use the Pomodoro Technique</h2>
        <p>The Pomodoro Technique is a time management method that involves working in focused bursts followed by short breaks. Typically, this means 25 minutes of concentrated work followed by a 5-minute break. After four cycles, take a longer break of 15-30 minutes. This technique helps maintain high levels of focus and prevents burnout.</p>

        <h2>3. Minimize Distractions</h2>
        <p>Distractions are productivity killers. Identify what typically distracts you and take steps to minimize these interruptions. This might mean turning off notifications, using website blockers, or finding a quiet place to work. Creating a distraction-free environment allows you to focus more deeply on your tasks.</p>

        <h2>4. Practice the Two-Minute Rule</h2>
        <p>If a task takes less than two minutes to complete, do it immediately rather than adding it to your to-do list. This simple rule, popularized by productivity expert David Allen, helps prevent small tasks from piling up and becoming overwhelming.</p>

        <h2>5. Batch Similar Tasks</h2>
        <p>Task batching involves grouping similar activities together and completing them in one go. For example, you might designate specific times for checking emails, making phone calls, or attending meetings. This reduces the mental effort required to switch between different types of tasks and increases efficiency.</p>

        <h2>6. Take Regular Breaks</h2>
        <p>While it might seem counterintuitive, taking regular breaks actually improves productivity. Short breaks help prevent mental fatigue, maintain consistent performance, and reduce stress. Step away from your work, stretch, move around, or engage in a brief relaxing activity before returning to your tasks.</p>

        <h2>7. Learn to Say No</h2>
        <p>Taking on too many commitments is a common productivity pitfall. Learn to say no to tasks or projects that don't align with your priorities or that you don't have the capacity to handle. This allows you to focus your energy on what truly matters and deliver better results.</p>

        <h2>8. Use Technology Wisely</h2>
        <p>There are countless productivity tools and apps available today. Find the ones that work best for you and incorporate them into your routine. This might include task managers, calendar apps, note-taking tools, or automation software. However, be careful not to get caught up in trying too many tools, as this can become a distraction in itself.</p>

        <h2>9. Prioritize Self-Care</h2>
        <p>Productivity isn't just about working more; it's about working better. Taking care of your physical and mental health is essential for sustained productivity. Ensure you're getting enough sleep, eating well, exercising regularly, and managing stress effectively. A healthy body and mind are the foundation of productive work.</p>

        <h2>10. Reflect and Adjust</h2>
        <p>Regularly review your productivity strategies and results. What's working well? What could be improved? Be willing to adjust your approach based on these reflections. Productivity is a personal journey, and finding what works best for you may require some experimentation.</p>

        <h2>Conclusion</h2>
        <p>Boosting your productivity isn't about cramming more work into your day; it's about working smarter, not harder. By implementing these ten tips, you can make better use of your time, reduce stress, and achieve more of what matters to you. Remember that productivity is a skill that improves with practice, so be patient with yourself as you develop these habits.</p>
      `,
      excerpt: 'Simple yet effective strategies to help you get more done in less time and reduce stress.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '3',
      author: users[2],
      categories: [categories[4]],
      tags: [tags[5], tags[6]],
      status: 'published',
      created_at: '2023-04-03T00:00:00.000Z',
      updated_at: '2023-04-03T00:00:00.000Z'
    }
  ];

  // Sample comments
  const comments = [
    {
      id: '1',
      post_id: '1',
      author_id: '2',
      author: users[1],
      content: 'Great introduction to web development! This is exactly what I needed when I was starting out.',
      created_at: '2023-04-02T10:00:00.000Z'
    },
    {
      id: '2',
      post_id: '1',
      author_id: '3',
      author: users[2],
      content: 'I would also recommend learning about responsive design early on. It\'s so important for modern web development.',
      created_at: '2023-04-02T11:30:00.000Z'
    },
    {
      id: '3',
      post_id: '2',
      author_id: '1',
      author: users[0],
      content: 'These principles have been really helpful in my recent projects. Thanks for sharing!',
      created_at: '2023-03-29T09:15:00.000Z'
    },
    {
      id: '4',
      post_id: '3',
      author_id: '1',
      author: users[0],
      content: 'The Pomodoro Technique has been a game-changer for me. I\'ve been using it for a month now and my productivity has improved significantly.',
      created_at: '2023-04-04T14:20:00.000Z'
    },
    {
      id: '5',
      post_id: '3',
      author_id: '2',
      author: users[1],
      content: 'I\'ve been struggling with distractions lately. Going to try implementing some of these tips, especially the idea of batching similar tasks.',
      created_at: '2023-04-04T16:45:00.000Z'
    }
  ];

  // Sample likes
  const likes = [
    { id: '1', post_id: '1', user_id: '2', created_at: '2023-04-02T09:30:00.000Z' },
    { id: '2', post_id: '1', user_id: '3', created_at: '2023-04-02T14:15:00.000Z' },
    { id: '3', post_id: '2', user_id: '1', created_at: '2023-03-28T16:20:00.000Z' },
    { id: '4', post_id: '2', user_id: '3', created_at: '2023-03-29T11:10:00.000Z' },
    { id: '5', post_id: '3', user_id: '1', created_at: '2023-04-03T15:45:00.000Z' },
    { id: '6', post_id: '3', user_id: '2', created_at: '2023-04-04T10:30:00.000Z' }
  ];

  // Sample bookmarks
  const bookmarks = [
    { id: '1', post_id: '1', user_id: '2', created_at: '2023-04-02T09:35:00.000Z' },
    { id: '2', post_id: '2', user_id: '3', created_at: '2023-03-28T17:00:00.000Z' },
    { id: '3', post_id: '3', user_id: '1', created_at: '2023-04-03T16:00:00.000Z' }
  ];

  // Sample follows
  const follows = [
    { id: '1', follower_id: '2', following_id: '1', created_at: '2023-02-15T00:00:00.000Z' },
    { id: '2', follower_id: '3', following_id: '1', created_at: '2023-02-20T00:00:00.000Z' },
    { id: '3', follower_id: '1', following_id: '2', created_at: '2023-02-25T00:00:00.000Z' },
    { id: '4', follower_id: '3', following_id: '2', created_at: '2023-03-01T00:00:00.000Z' },
    { id: '5', follower_id: '1', following_id: '3', created_at: '2023-03-05T00:00:00.000Z' },
    { id: '6', follower_id: '2', following_id: '3', created_at: '2023-03-10T00:00:00.000Z' }
  ];

  // Store data in localStorage
  setToStorage$1('users', JSON.stringify(users));
  setToStorage$1('categories', JSON.stringify(categories));
  setToStorage$1('tags', JSON.stringify(tags));
  setToStorage$1('posts', JSON.stringify(posts));
  setToStorage$1('comments', JSON.stringify(comments));
  setToStorage$1('likes', JSON.stringify(likes));
  setToStorage$1('bookmarks', JSON.stringify(bookmarks));
  setToStorage$1('follows', JSON.stringify(follows));

  // Mark data as initialized
  setToStorage$1('dataInitialized', 'true');

  console.log('Sample data initialized successfully!');
};

function App({ children }) {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      initializeSampleData();
      setInitialized(true);
    }
  }, [initialized]);
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ToastProvider, { children }) });
}

function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "bg-black py-6 border-t border-gray-800", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 md:mb-0", children: /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: "© 2025 ABlog. All rights reserved." }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex space-x-4", children: [
      /* @__PURE__ */ jsx("a", { href: "/terms", className: "text-gray-300 hover:text-white", children: "Terms" }),
      /* @__PURE__ */ jsx("a", { href: "/privacy", className: "text-gray-300 hover:text-white", children: "Privacy" }),
      /* @__PURE__ */ jsx("a", { href: "/contact", className: "text-gray-300 hover:text-white", children: "Contact" })
    ] })
  ] }) }) });
}

const NavigationContext = createContext(null);
function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const handlePopState = () => {
      if (currentPath !== window.location.pathname) {
        simulateNavigation();
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentPath]);
  const simulateNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    const randomDelay = Math.floor(Math.random() * 700) + 800;
    setTimeout(() => {
      setIsNavigating(false);
    }, randomDelay);
  };
  return /* @__PURE__ */ jsx(NavigationContext.Provider, { value: { isNavigating, simulateNavigation, currentPath }, children });
}
const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark",
        destructive: "bg-danger text-white hover:bg-danger/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-white hover:bg-secondary-dark",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      ...props
    }
  );
});
Button.displayName = "Button";

const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

function LoadingBar({
  isLoading,
  color = "#0ea5e9",
  height = "4px",
  duration = 1e3,
  className,
  ...props
}) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let timer;
    let progressTimer;
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 20 ? 20 : prev < 40 ? 12 : prev < 60 ? 8 : prev < 80 ? 4 : 1;
          const newProgress = Math.min(prev + increment, 90);
          return newProgress;
        });
      }, 80);
    } else {
      if (visible) {
        setProgress(100);
        timer = setTimeout(() => {
          setVisible(false);
        }, 500);
      }
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isLoading]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "fixed top-0 left-0 right-0 z-50 overflow-hidden",
          className
        ),
        style: { height },
        ...props,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full transition-all ease-out duration-300 relative",
            style: {
              width: `${progress}%`,
              transition: `width ${progress === 100 ? 300 : duration}ms ease-in-out`,
              background: `linear-gradient(to right, #0ea5e9, #6366f1, #8b5cf6)`,
              boxShadow: "0 0 10px rgba(14, 165, 233, 0.7)"
            },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute top-0 right-0 h-full w-24 bg-white opacity-40",
                style: {
                  filter: "blur(5px)",
                  transform: "skewX(-20deg)",
                  animation: "pulse 1.2s ease-in-out infinite"
                }
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-300",
        style: {
          opacity: isLoading ? 0.2 : 0
        }
      }
    )
  ] });
}

function Navigation() {
  const [user, setUser] = useState(null);
  const { isNavigating, simulateNavigation } = useNavigation();
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const handleSignOut = async () => {
    await authService.signOut();
    window.location.href = "/";
    window.location.reload();
  };
  const handleNavigation = (e) => {
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("/")) {
      e.preventDefault();
      simulateNavigation();
      setTimeout(() => {
        window.location.href = href;
      }, 50);
    }
  };
  return /* @__PURE__ */ jsxs("header", { className: "bg-black text-white py-4 shadow-lg border-b border-gray-800 relative", children: [
    /* @__PURE__ */ jsx(LoadingBar, { isLoading: isNavigating, color: "#0ea5e9", height: "3px" }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("a", { href: "/", onClick: handleNavigation, className: "text-2xl font-bold text-white hover:text-white flex items-center gap-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-extrabold", style: { fontFamily: "'Orbitron', sans-serif" }, children: "AB" }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700", style: { fontFamily: "'Orbitron', sans-serif" }, children: "log" })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "md:hidden text-white hover:bg-slate-700/70 hover:text-white",
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
        }
      ),
      /* @__PURE__ */ jsx("nav", { className: "hidden md:block", children: /* @__PURE__ */ jsxs("ul", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Home" }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/blogs", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Blogs" }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/about", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "About" }) }) }),
        !user ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/login", style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Login" }) }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-full px-5", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/register", style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Register" }) }) })
        ] }) : /* @__PURE__ */ jsxs("li", { className: "relative", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              className: "flex items-center text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-full px-4",
              onClick: () => setUserMenuOpen(!userMenuOpen),
              children: [
                /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8 mr-1", children: user.avatar_url ? /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar_url, alt: user.full_name || user.username, className: "header-profile-pic" }) : /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-blue-600 text-white", children: (user.full_name || user.username || user.email).charAt(0).toUpperCase() }) }),
                /* @__PURE__ */ jsx("span", { className: "font-medium text-white", style: { fontFamily: "'Orbitron', sans-serif" }, children: user.full_name || user.username || user.email }),
                /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
              ]
            }
          ),
          userMenuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg py-1 z-10 animate-in fade-in-50 slide-in-from-top-5 border border-slate-700", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/profile",
                className: "flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700",
                onClick: (e) => {
                  setUserMenuOpen(false);
                  handleNavigation(e);
                },
                children: [
                  /* @__PURE__ */ jsx(User, { className: "h-4 w-4 mr-2" }),
                  /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif" }, children: "Profile" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/create-post",
                className: "flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700",
                onClick: (e) => {
                  setUserMenuOpen(false);
                  handleNavigation(e);
                },
                children: [
                  /* @__PURE__ */ jsx(PenSquare, { className: "h-4 w-4 mr-2" }),
                  /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif" }, children: "Create Post" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setUserMenuOpen(false);
                  handleSignOut();
                },
                className: "flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 mr-2" }),
                  /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif" }, children: "Log out" })
                ]
              }
            )
          ] })
        ] })
      ] }) })
    ] }),
    mobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden mt-4 bg-black animate-in slide-in-from-top-5 rounded-b-xl shadow-xl border-t border-gray-800", children: /* @__PURE__ */ jsx("nav", { className: "container mx-auto px-4 py-4", children: /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Home" }) }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/blogs", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Blogs" }) }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/about", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "About" }) }) }),
      !user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/login", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Login" }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { className: "w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-lg", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/register", onClick: handleNavigation, style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Register" }) }) })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-lg", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: "/profile", onClick: handleNavigation, children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Profile" })
        ] }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-lg", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: "/create-post", onClick: handleNavigation, children: [
          /* @__PURE__ */ jsx(PenSquare, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Create Post" })
        ] }) }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            className: "w-full justify-start text-white hover:bg-red-600/80 hover:text-white gap-2 rounded-lg",
            onClick: handleSignOut,
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { style: { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 }, children: "Log out" })
            ]
          }
        ) })
      ] })
    ] }) }) })
  ] });
}

function NavigationWrapper() {
  return /* @__PURE__ */ jsx(NavigationProvider, { children: /* @__PURE__ */ jsx(Navigation, {}) });
}

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

function DataFixer() {
  useEffect(() => {
    console.log("DataFixer component mounted, running fixes...");
    setTimeout(() => {
      const result = fixAuthorData();
      console.log("Author data fix result:", result);
    }, 500);
  }, []);
  return null;
}

function PageTransition({ children }) {
  const { isNavigating } = useNavigation();
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    if (isNavigating) {
      setOpacity(0.5);
    } else {
      setOpacity(1);
    }
  }, [isNavigating]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "transition-opacity duration-300 page-enter",
      style: { opacity },
      children: /* @__PURE__ */ jsx("div", { className: "page-content", children })
    }
  );
}

function PageTransitionWrapper({ children }) {
  return /* @__PURE__ */ jsx(NavigationProvider, { children: /* @__PURE__ */ jsx(PageTransition, { children }) });
}

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "ABlog - A Modern Blogging Platform", description = "A comprehensive blogging platform with rich features" } = Astro2.props;
  return renderTemplate`<html lang="en" class="dark" style="color-scheme: dark;"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta name="description"${addAttribute(description, "content")}><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body> ${renderComponent($$result, "DataFixer", DataFixer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/DataFixer", "client:component-export": "default" })} ${renderComponent($$result, "App", App, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/App", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` <div class="min-h-screen flex flex-col"> ${renderComponent($$result2, "NavigationWrapper", NavigationWrapper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/NavigationWrapper", "client:component-export": "default" })} <main class="flex-grow container mx-auto px-4 py-8"> ${renderComponent($$result2, "PageTransitionWrapper", PageTransitionWrapper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/PageTransitionWrapper", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` ${renderSlot($$result3, $$slots["default"])} ` })} </main> ${renderComponent($$result2, "Footer", Footer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/amogh/Documents/augment-projects/ABlog/src/components/Footer", "client:component-export": "default" })} </div> ` })} </body></html>`;
}, "C:/Users/amogh/Documents/augment-projects/ABlog/src/layouts/Layout.astro", void 0);

export { $$Layout as $, Button as B, authService as a, cn as c };
