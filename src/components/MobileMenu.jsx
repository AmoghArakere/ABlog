import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await authService.signOut();
    window.location.href = '/';
    // Refresh the page to update the UI
    window.location.reload();
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-primary-dark"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-primary shadow-lg z-50">
          <nav className="container mx-auto px-4 py-2">
            <ul className="space-y-2">
              <li><a href="/" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Home</a></li>
              <li><a href="/blogs" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Blogs</a></li>
              <li><a href="/about" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">About</a></li>

              {user ? (
                <>
                  <li><a href="/create-post" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Create Post</a></li>
                  <li><a href="/profile" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Profile</a></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-white hover:bg-primary-dark px-2 rounded"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Login</a></li>
                  <li><a href="/register" className="block py-2 text-white hover:bg-primary-dark px-2 rounded">Register</a></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
