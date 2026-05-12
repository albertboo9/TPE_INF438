import React from 'react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "fixed top-0 z-50 w-full bg-surface/70 backdrop-blur-md border-b border-outline/10 shadow-sm",
      "flex justify-between items-center px-lg py-sm",
      className
    )}>
      <div className="flex items-center gap-xl">
        <h1 className="font-display text-h2 font-bold text-primary">
          RetailSense AI
        </h1>
        <nav className="hidden md:flex items-center gap-md">
          <a className="font-display text-body-lg font-semibold text-primary border-b-2 border-primary pb-2 transition-all" href="#">
            Executive
          </a>
          <a className="font-display text-body-lg font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#">
            Predictions
          </a>
          <a className="font-display text-body-lg font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#">
            Intelligence
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-xs bg-emerald-ai/10 px-sm py-xs rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-ai animate-pulse"></span>
          <span className="font-mono-data text-emerald-ai uppercase tracking-wider text-[10px] font-bold">
            Live Data
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <button className="p-xs text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-xs text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-all">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline/20">
            <img
              alt="Executive Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlflG33mBr8ZvyZBpqPq_2ML_dh7fYowlSeI2H-L1PJ61XPynQnNf7AuW2qaGhzzRZkfpj6RkfA2USCHTAT-CalFjTwvq2F6dLOIdsXmfZS-aI5nqqUXwjw2E-3XoWeAZ2_4vTHwf300UpgKw_r81nERrkOLDxXLzdt2lSThUQ4R62qSfnsaIR5Vbj74zEaLQaIlApjMBirOkO6VUgA6VecuniQmSnxThCTe1wJyDGmTYbNJkAHoBpoUUCT1ckHYHPmvLa14CJKg7-"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};