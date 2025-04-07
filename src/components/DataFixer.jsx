import { useEffect } from 'react';
import fixAuthorData from '../scripts/fixAuthorData';

export default function DataFixer() {
  useEffect(() => {
    // Run the fix on component mount
    console.log('DataFixer component mounted, running fixes...');
    
    // Small delay to ensure localStorage is available
    setTimeout(() => {
      const result = fixAuthorData();
      console.log('Author data fix result:', result);
    }, 500);
  }, []);

  // This component doesn't render anything
  return null;
}
