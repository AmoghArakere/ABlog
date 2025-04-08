import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';
import { useNavigation } from '../contexts/NavigationContext';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getImageUrl } from '../lib/imageUtils';
import { LoadingBar } from './ui/loading-bar';
import { Menu, ChevronDown, LogOut, User, PenSquare, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const { isNavigating, simulateNavigation } = useNavigation();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authService.signOut();
    window.location.href = '/';
    // Refresh the page to update the UI
    window.location.reload();
  };

  // Handle navigation with loading animation
  const handleNavigation = (e) => {
    // Only for internal links
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('/')) {
      e.preventDefault(); // Prevent default navigation

      // Start the loading animation
      simulateNavigation();

      // After a short delay, navigate to the new page
      setTimeout(() => {
        window.location.href = href;
      }, 50);
    }
  };

  return (
    <header className="bg-black text-white py-4 shadow-lg border-b border-gray-800 relative">
      <LoadingBar isLoading={isNavigating} color="#0ea5e9" height="3px" />
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="/" onClick={handleNavigation} className="text-2xl font-bold text-white hover:text-white flex items-center gap-1">
          <div className="relative">
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
              <span className="text-white text-xl font-extrabold" style={{fontFamily: "'Orbitron', sans-serif"}}>AB</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full"></div>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700" style={{fontFamily: "'Orbitron', sans-serif"}}>log</span>
        </a>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-slate-700/70 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-2">
            <li>
              <Button variant="ghost" className="text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5" asChild>
                <a href="/" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Home</a>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5" asChild>
                <a href="/blogs" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Blogs</a>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5" asChild>
                <a href="/about" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>About</a>
              </Button>
            </li>
            {!user ? (
              <>
                <li>
                  <Button variant="ghost" className="text-white hover:bg-slate-700/70 hover:text-white rounded-full px-5" asChild>
                    <a href="/login" style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Login</a>
                  </Button>
                </li>
                <li>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-full px-5" asChild>
                    <a href="/register" style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Register</a>
                  </Button>
                </li>
              </>
            ) : (
              <li className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-full px-4"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar className="h-8 w-8 mr-1">
                    {user.avatar_url ? (
                      <AvatarImage
                        src={getImageUrl(user.avatar_url, '/images/placeholder-profile.svg')}
                        alt={user.full_name || user.username}
                        className="header-profile-pic"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-profile.svg';
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-blue-600 text-white">
                        {(user.full_name || user.username || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-white" style={{fontFamily: "'Orbitron', sans-serif"}}>{user.full_name || user.username || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg py-1 z-10 animate-in fade-in-50 slide-in-from-top-5 border border-slate-700">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700"
                      onClick={(e) => {
                        setUserMenuOpen(false);
                        handleNavigation(e);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span style={{fontFamily: "'Orbitron', sans-serif"}}>Profile</span>
                    </a>
                    <a
                      href="/create-post"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700"
                      onClick={(e) => {
                        setUserMenuOpen(false);
                        handleNavigation(e);
                      }}
                    >
                      <PenSquare className="h-4 w-4 mr-2" />
                      <span style={{fontFamily: "'Orbitron', sans-serif"}}>Create Post</span>
                    </a>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span style={{fontFamily: "'Orbitron', sans-serif"}}>Log out</span>
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
        <div className="md:hidden mt-4 bg-black animate-in slide-in-from-top-5 rounded-b-xl shadow-xl border-t border-gray-800">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg" asChild>
                  <a href="/" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Home</a>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg" asChild>
                  <a href="/blogs" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Blogs</a>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg" asChild>
                  <a href="/about" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>About</a>
                </Button>
              </li>
              {!user ? (
                <>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white rounded-lg" asChild>
                      <a href="/login" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Login</a>
                    </Button>
                  </li>
                  <li>
                    <Button className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-lg" asChild>
                      <a href="/register" onClick={handleNavigation} style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Register</a>
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-lg" asChild>
                      <a href="/profile" onClick={handleNavigation}>
                        <User className="h-4 w-4" />
                        <span style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Profile</span>
                      </a>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-white gap-2 rounded-lg" asChild>
                      <a href="/create-post" onClick={handleNavigation}>
                        <PenSquare className="h-4 w-4" />
                        <span style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Create Post</span>
                      </a>
                    </Button>
                  </li>

                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-red-600/80 hover:text-white gap-2 rounded-lg"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 500}}>Log out</span>
                    </Button>
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
