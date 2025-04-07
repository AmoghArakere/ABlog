import React from 'react';
import { NavigationProvider } from '../contexts/NavigationContext';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  return (
    <NavigationProvider>
      <Navigation />
    </NavigationProvider>
  );
}
