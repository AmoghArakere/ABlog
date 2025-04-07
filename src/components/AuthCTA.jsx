import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';

export default function AuthCTA() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // If user is logged in, don't show the CTA
  if (loading) return null; // Don't render anything while loading
  if (user) return null; // Don't render if user is logged in

  // Only render for non-logged in users
  return (
    <section className="py-20 bg-black border-t border-gray-800 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

      {/* Animated dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-sm"
            style={{
              width: `${Math.random() * 6 + 2}rem`,
              height: `${Math.random() * 6 + 2}rem`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{fontFamily: "'Orbitron', sans-serif"}}>
          Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700">Share Your Story</span>?
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">Join our community of writers and readers. Create an account to start writing and sharing your thoughts with the world.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white rounded-lg hover:opacity-90 transition-all duration-300 text-center font-bold text-lg shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transform"
            style={{fontFamily: "'Orbitron', sans-serif"}}
          >
            Create Account
          </a>
          <a
            href="/login"
            className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-center font-bold text-lg"
            style={{fontFamily: "'Orbitron', sans-serif"}}
          >
            Sign In
          </a>
        </div>
      </div>
    </section>
  );
}
