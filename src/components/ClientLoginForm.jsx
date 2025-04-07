import React, { useState } from 'react';
import authService from '../lib/authService';

export default function ClientLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { success, error } = await authService.signIn(email, password);

      if (!success) {
        setError(error || 'Failed to sign in');
        setLoading(false);
        return;
      }

      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-md p-8 border border-gray-800 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your ABlog account</p>
      </div>

      {error && (
        <div className="bg-red-900/30 text-red-400 p-4 rounded-md mb-6 border border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 text-green-400 p-4 rounded-md mb-6 border border-green-800">
          {success}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <a href="/forgot-password" className="text-sm text-purple-400 hover:underline">Forgot password?</a>
          </div>
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 bg-gray-900 border-gray-700 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">Remember me</label>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account? <a href="/register" className="text-purple-400 hover:underline">Create an account</a>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          <a href="/forgot-password" className="text-purple-400 hover:underline">Forgot your password?</a>
        </p>
      </div>
    </div>
  );
}
