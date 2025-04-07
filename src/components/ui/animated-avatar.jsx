import React, { useState } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

const AnimatedAvatar = React.forwardRef(({ 
  className, 
  animation = 'none',
  hoverEffect = true,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse-slow';
      case 'bounce':
        return 'animate-bounce-slow';
      case 'glow':
        return 'animate-glow';
      default:
        return '';
    }
  };
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        getAnimationClass(),
        hoverEffect && "transition-all duration-300",
        isHovered && hoverEffect && "scale-110 ring-2 ring-purple-500 ring-offset-2 ring-offset-black",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
});

AnimatedAvatar.displayName = "AnimatedAvatar";

const AnimatedAvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AnimatedAvatarImage.displayName = "AnimatedAvatarImage";

const AnimatedAvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-purple-600 text-white",
      className
    )}
    {...props}
  />
));
AnimatedAvatarFallback.displayName = "AnimatedAvatarFallback";

export { AnimatedAvatar, AnimatedAvatarImage, AnimatedAvatarFallback };
