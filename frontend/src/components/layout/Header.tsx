import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface HeaderProps {
  className?: string;
  currentPage?: string;
  onOpenFilters?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ className, currentPage, onOpenFilters }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-surface/75 dark:bg-[#0f0b15]/75 backdrop-blur-xl border-b border-border dark:border-[#2b2735] px-6 lg:px-10 py-3 flex justify-between items-center shadow-sm",
      className
    )}>
      {/* Brand & Left Section */}
      <div className="flex items-center gap-6">
        <h1 className="font-display text-[20px] lg:text-h2 font-black bg-gradient-to-r from-primary via-[#9f86e3] to-electric-indigo bg-clip-text text-transparent tracking-tight">
          RetailSense.AI
        </h1>
        
        {/* Dynamic Context Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 dark:bg-primary/5 border border-primary/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-caps text-[9px] font-bold text-primary uppercase tracking-widest">
            {currentPage || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-4">
        {/* Active Database connection status pill */}
        <div className="flex items-center gap-1.5 bg-emerald-ai/10 dark:bg-emerald-ai/5 border border-emerald-ai/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-ai animate-pulse"></span>
          <span className="font-mono-data text-emerald-ai uppercase tracking-wider text-[9px] font-bold">
            Warehouse Live
          </span>
        </div>

        {/* Global Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container dark:hover:bg-[#1d1926] rounded-xl border border-border dark:border-[#2b2735] transition-all duration-300 active:scale-90"
          title="Toggle Visual Theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Dynamic Mobile Filters Trigger (Invisible on Desktop) */}
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-xl border border-primary/20 transition-all duration-300 active:scale-90"
            title="Slicing Parameters"
          >
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
          </button>
        )}

        <div className="h-6 w-px bg-border dark:bg-[#2b2735] hidden sm:block"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-xs font-bold text-on-surface">{user?.name || 'Administrator'}</span>
            <span className="text-[9px] font-mono-data text-outline uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-border dark:border-[#2b2735] flex items-center justify-center bg-primary/10 text-primary font-black shadow-inner">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
        </div>
      </div>
    </header>
  );
};