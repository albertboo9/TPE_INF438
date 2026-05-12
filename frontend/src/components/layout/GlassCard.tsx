import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className, children }) => {
  return (
    <div className={cn(
      "glass-card",
      "bg-white/70 backdrop-blur-md",
      "border border-outline/10",
      "rounded-xl",
      className
    )}>
      {children}
    </div>
  );
};