import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className, children, onClick, hoverGlow = false }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card",
        "bg-surface/75 dark:bg-[#181420]/65 backdrop-blur-xl border border-border dark:border-[#2b2735] rounded-[24px] shadow-sm transition-all duration-300",
        hoverGlow && "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:scale-[1.01]",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
};