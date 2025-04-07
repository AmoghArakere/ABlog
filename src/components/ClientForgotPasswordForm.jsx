import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Simple component to test if it renders

export default function ClientForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email. Please check your inbox.');
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-md p-8 border border-gray-800 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Forgot Password</h1>
        <p className="text-gray-400">Enter your email to reset your password</p>
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

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Remember your password? <a href="/login" className="text-purple-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
