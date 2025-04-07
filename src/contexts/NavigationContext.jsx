import { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Set initial path when component mounts
  useEffect(() => {
    setCurrentPath(window.location.pathname);

    // Add event listener for popstate (browser back/forward buttons)
    const handlePopState = () => {
      if (currentPath !== window.location.pathname) {
        simulateNavigation();
        setCurrentPath(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPath]);

  // Function to simulate navigation with a more realistic delay
  const simulateNavigation = () => {
    // Don't trigger if already navigating
    if (isNavigating) return;

    // Start loading animation
    setIsNavigating(true);

    // Use a random delay between 800-1500ms to simulate varying page load times
    // This makes the loading animation feel more realistic
    const randomDelay = Math.floor(Math.random() * 700) + 800;

    setTimeout(() => {
      setIsNavigating(false);
    }, randomDelay);
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, simulateNavigation, currentPath }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
