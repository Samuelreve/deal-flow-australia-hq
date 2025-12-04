
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: 'primary' | 'success' | 'warning' | 'none';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, gradient = 'none', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          hover ? 'glass-card-hover' : 'glass-card',
          gradient === 'primary' && 'stat-card',
          gradient === 'success' && 'stat-card stat-card-success',
          gradient === 'warning' && 'stat-card stat-card-warning',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
