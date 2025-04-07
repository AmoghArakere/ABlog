import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { completePasswordReset } = useAuth();

  useEffect(() => {
    // Extract token and email from URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      const emailParam = params.get('email');
      
      if (tokenParam) setToken(tokenParam);
      if (emailParam) setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate inputs
    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      setLoading(false);
      return;
    }

    try {
      const result = await completePasswordReset(email, token, password);
      
      if (result.success) {
        setSuccess('Your password has been reset successfully! You can now log in with your new password.');
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
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
    <>
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
            readOnly={!!email}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
    </>
  );
}
