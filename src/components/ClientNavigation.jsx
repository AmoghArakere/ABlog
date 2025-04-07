import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';

export default function ClientNavigation() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-primary text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white hover:text-white flex items-center gap-1">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-1 rounded-md flex items-center justify-center font-bold shadow-lg">
              <span className="text-white text-xl font-extrabold">AB</span>
            </div>
          </div>
          <span className="font-extrabold tracking-tight">log</span>
        </a>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-primary-dark"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="/" className="text-white hover:text-white hover:underline">Home</a></li>
            <li><a href="/blogs" className="text-white hover:text-white hover:underline">Blogs</a></li>
            <li><a href="/about" className="text-white hover:text-white hover:underline">About</a></li>
            {!user ? (
              <>
                <li><a href="/login" className="text-white hover:text-white hover:underline">Login</a></li>
                <li><a href="/register" className="text-white hover:text-white hover:underline">Register</a></li>
              </>
            ) : (
              <li className="relative">
                <button
                  className="flex items-center text-white hover:text-white hover:underline"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="mr-1">{user.full_name || user.email}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </a>
                    <a
                      href="/create-post"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Create Post
                    </a>
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-primary-dark">
          <nav className="container mx-auto px-4 py-2">
            <ul className="space-y-2">
              <li><a href="/" className="block py-2 text-white hover:text-white hover:underline">Home</a></li>
              <li><a href="/blogs" className="block py-2 text-white hover:text-white hover:underline">Blogs</a></li>
              <li><a href="/about" className="block py-2 text-white hover:text-white hover:underline">About</a></li>
              {!user ? (
                <>
                  <li><a href="/login" className="block py-2 text-white hover:text-white hover:underline">Login</a></li>
                  <li><a href="/register" className="block py-2 text-white hover:text-white hover:underline">Register</a></li>
                </>
              ) : (
                <>
                  <li><a href="/profile" className="block py-2 text-white hover:text-white hover:underline">Profile</a></li>
                  <li><a href="/create-post" className="block py-2 text-white hover:text-white hover:underline">Create Post</a></li>
                  <li><a href="/dashboard" className="block py-2 text-white hover:text-white hover:underline">Dashboard</a></li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="block py-2 text-white hover:text-white hover:underline w-full text-left"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
