import React, { useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white hover:opacity-90",
        destructive: "bg-danger text-white hover:bg-danger/90",
        outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-white",
        secondary: "bg-gray-800 text-white hover:bg-gray-700",
        ghost: "hover:bg-gray-800 text-white",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce-slow",
        glow: "animate-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

const AnimatedButton = React.forwardRef(({
  className,
  variant,
  size,
  animation,
  asChild = false,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, animation, className }),
        isHovered ? "scale-105" : "scale-100",
        "transform transition-transform duration-300"
      )}
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
});

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, buttonVariants };
