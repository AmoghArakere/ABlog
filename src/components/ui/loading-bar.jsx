import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function LoadingBar({
  isLoading,
  color = '#0ea5e9',
  height = '4px',
  duration = 1000,
  className,
  ...props
}) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    let progressTimer;

    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Simulate progress - faster initial progress for better feedback
      progressTimer = setInterval(() => {
        setProgress(prev => {
          // Faster at the beginning, slower as it approaches 90%
          const increment = prev < 20 ? 20 : prev < 40 ? 12 : prev < 60 ? 8 : prev < 80 ? 4 : 1;
          const newProgress = Math.min(prev + increment, 90);
          return newProgress;
        });
      }, 80); // Faster interval for more responsive feel
    } else {
      // Complete the progress bar when loading is done
      if (visible) {
        setProgress(100);
        timer = setTimeout(() => {
          setVisible(false);
        }, 500); // Hide after transition completes
      }

      if (progressTimer) {
        clearInterval(progressTimer);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <>
      {/* Main loading bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 overflow-hidden",
          className
        )}
        style={{ height }}
        {...props}
      >
        <div
          className="h-full transition-all ease-out duration-300 relative"
          style={{
            width: `${progress}%`,
            transition: `width ${progress === 100 ? 300 : duration}ms ease-in-out`,
            background: `linear-gradient(to right, #0ea5e9, #6366f1, #8b5cf6)`,
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.7)'
          }}
        >
          {/* Add a subtle animation effect */}
          <div
            className="absolute top-0 right-0 h-full w-24 bg-white opacity-40"
            style={{
              filter: 'blur(5px)',
              transform: 'skewX(-20deg)',
              animation: 'pulse 1.2s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Page transition overlay */}
      <div
        className="fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isLoading ? 0.2 : 0,
        }}
      />

      {/* Animation is defined in global.css */}
    </>
  );
}
