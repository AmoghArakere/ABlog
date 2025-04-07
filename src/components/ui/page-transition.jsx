import { useEffect, useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

export function PageTransition({ children }) {
  const { isNavigating } = useNavigation();
  const [opacity, setOpacity] = useState(1);

  // Simple fade effect when navigating
  useEffect(() => {
    if (isNavigating) {
      setOpacity(0.5);
    } else {
      setOpacity(1);
    }
  }, [isNavigating]);

  return (
    <div
      className="transition-opacity duration-300 page-enter"
      style={{ opacity }}
    >
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
