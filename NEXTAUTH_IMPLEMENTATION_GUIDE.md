# Implementing NextAuth.js with Astro

This guide will help you implement NextAuth.js for authentication in your Astro project.

## Prerequisites

- Node.js 16.x or later
- Astro project (already set up)

## Step 1: Install Required Packages

```bash
npm install next-auth@4.x @astrojs/node
```

## Step 2: Configure Astro for Server-Side Rendering

Update your `astro.config.mjs` file to use the Node.js adapter:

```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
});
```

## Step 3: Create API Endpoints for NextAuth.js

Create a file at `src/pages/api/auth/[...nextauth].js`:

```javascript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';

// You can use your existing user authentication logic here
import { verifyUserCredentials } from '../../../lib/auth';

export default NextAuth({
  providers: [
    // Credentials Provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Verify user credentials using your existing auth logic
        const user = await verifyUserCredentials(credentials.email, credentials.password);
        
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profile_image
          };
        }
        
        return null;
      }
    }),
    
    // Optional: Add OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  
  // Configure session handling
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Customize JWT handling
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-for-development',
  },
  
  // Customize pages
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login', // Error code passed in query string as ?error=
    verifyRequest: '/verify-request', // (used for check email message)
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Add custom claims to the JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add custom session properties
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
```

## Step 4: Create Auth Context for React Components

Create a file at `src/contexts/AuthContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, useSession, getSession } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setUser(session?.user || null);
      setLoading(false);
    }
  }, [session, status]);

  // Login with credentials
  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login with OAuth provider
  const loginWithProvider = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: '/' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register new user
  const register = async (name, email, password) => {
    try {
      // Make API call to your registration endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      // Automatically log in the user after registration
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithProvider,
    logout,
    register,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## Step 5: Set Up NextAuth Provider in Your App Component

Update your `src/components/App.jsx` file:

```jsx
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
```

## Step 6: Create API Endpoints for Additional Auth Functions

### Registration Endpoint

Create a file at `src/pages/api/auth/register.js`:

```javascript
import { createUser } from '../../../lib/auth';

export async function post({ request }) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user already exists
    // Create user using your existing user creation logic
    const result = await createUser({ name, email, password });
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Password Reset Endpoint

Create a file at `src/pages/api/auth/reset-password.js`:

```javascript
import { sendPasswordResetEmail } from '../../../lib/auth';

export async function post({ request }) {
  try {
    const body = await request.json();
    const { email } = body;
    
    // Validate input
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Send password reset email using your existing logic
    const result = await sendPasswordResetEmail(email);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

## Step 7: Update Your Login Component

Update your `src/components/ClientLoginForm.jsx` file:

```jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ClientLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithProvider } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithProvider('google');
  };

  const handleGithubLogin = async () => {
    await loginWithProvider('github');
  };

  return (
    <div className="bg-black rounded-lg shadow-md p-8 border border-gray-800 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Sign In</h1>
        <p className="text-gray-400">Welcome back to ABlog</p>
      </div>

      {error && (
        <div className="bg-red-900/30 text-red-400 p-4 rounded-md mb-6 border border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-900"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="text-purple-400 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
          >
            Google
          </button>
          <button
            onClick={handleGithubLogin}
            className="w-full py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
          >
            GitHub
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account? <a href="/register" className="text-purple-400 hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}
```

## Step 8: Create Environment Variables

Create a `.env` file in your project root:

```
# NextAuth.js
NEXTAUTH_URL=http://localhost:4322
NEXTAUTH_SECRET=your-secret-key-for-jwt-encryption

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email (for password reset)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

## Step 9: Create Auth Utility Functions

Create a file at `src/lib/auth.js`:

```javascript
// This file will contain your authentication utility functions
// that integrate with your existing user storage system

// Verify user credentials
export async function verifyUserCredentials(email, password) {
  // Implement your user verification logic here
  // This should check if the user exists and if the password is correct
  // Return the user object if successful, null otherwise
}

// Create a new user
export async function createUser({ name, email, password }) {
  // Implement your user creation logic here
  // This should check if the user already exists
  // Hash the password and store the user in your database
  // Return { success: true } if successful, { success: false, error: 'message' } otherwise
}

// Send password reset email
export async function sendPasswordResetEmail(email) {
  // Implement your password reset logic here
  // This should check if the user exists
  // Generate a reset token and store it with the user
  // Send an email with a reset link
  // Return { success: true } if successful, { success: false, error: 'message' } otherwise
}

// Complete password reset
export async function completePasswordReset(email, token, newPassword) {
  // Implement your password reset completion logic here
  // This should check if the user exists and if the token is valid
  // Update the user's password and clear the reset token
  // Return { success: true } if successful, { success: false, error: 'message' } otherwise
}
```

## Step 10: Protect Routes

Create a utility function to protect routes that require authentication:

```jsx
// src/components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return children;
}
```

Use this component to protect routes:

```jsx
// Example of a protected page
import Layout from '../layouts/Layout.astro';
import ProtectedRoute from '../components/ProtectedRoute';
import ProfileContent from '../components/ProfileContent';

export default function Profile() {
  return (
    <Layout title="Profile - ABlog">
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </Layout>
  );
}
```

## Conclusion

This guide provides a comprehensive approach to implementing NextAuth.js with Astro for your ABlog project. By following these steps, you'll have a robust authentication system that supports:

- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Password reset functionality
- Protected routes
- Session management

Remember to adapt the code to fit your specific project structure and requirements. The auth utility functions should integrate with your existing user storage system, whether it's a database, localStorage, or another solution.
