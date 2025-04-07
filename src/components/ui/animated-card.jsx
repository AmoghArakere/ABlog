import React, { useState } from 'react';
import { cn } from '../../lib/utils';

const AnimatedCard = React.forwardRef(({ 
  className, 
  children, 
  animation = 'fade-in',
  hoverEffect = true,
  delay = 0,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-in-from-top';
      case 'bounce':
        return 'animate-bounce-slow';
      case 'float':
        return 'animate-float';
      case 'pulse':
        return 'animate-pulse-slow';
      default:
        return 'animate-fade-in';
    }
  };
  
  const getHoverClass = () => {
    if (!hoverEffect) return '';
    return isHovered 
      ? 'scale-[1.02] shadow-lg border-purple-500/30' 
      : 'scale-100 shadow-md';
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "bg-black rounded-lg border border-gray-800 text-white overflow-hidden",
        getAnimationClass(),
        "transition-all duration-300 ease-in-out",
        getHoverClass(),
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
});

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
