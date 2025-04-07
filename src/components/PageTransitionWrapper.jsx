import { NavigationProvider } from '../contexts/NavigationContext';
import { PageTransition } from './ui/page-transition';

export default function PageTransitionWrapper({ children }) {
  return (
    <NavigationProvider>
      <PageTransition>
        {children}
      </PageTransition>
    </NavigationProvider>
  );
}
