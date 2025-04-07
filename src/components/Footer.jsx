import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black py-6 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-300">&copy; 2025 ABlog. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="/terms" className="text-gray-300 hover:text-white">Terms</a>
            <a href="/privacy" className="text-gray-300 hover:text-white">Privacy</a>
            <a href="/contact" className="text-gray-300 hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
