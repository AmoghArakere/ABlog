import React from 'react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
          className
        )}
        {...props}
      />
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
