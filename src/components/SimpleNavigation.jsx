import React from 'react';

export default function SimpleNavigation() {
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

        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="/" className="text-white hover:text-white hover:underline">Home</a></li>
            <li><a href="/blogs" className="text-white hover:text-white hover:underline">Blogs</a></li>
            <li><a href="/about" className="text-white hover:text-white hover:underline">About</a></li>
            <li><a href="/login" className="text-white hover:text-white hover:underline">Login</a></li>
            <li><a href="/register" className="text-white hover:text-white hover:underline">Register</a></li>
          </ul>
        </nav>

        <button className="md:hidden p-2 rounded-md hover:bg-primary-dark">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
}
