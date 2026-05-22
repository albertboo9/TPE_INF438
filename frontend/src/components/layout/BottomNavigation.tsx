import React from 'react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenFilters: () => void;
  userRole?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  onNavigate,
  onOpenFilters,
  userRole,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/80 dark:bg-[#181420]/80 backdrop-blur-xl border-t border-border dark:border-[#2b2735] px-6 py-3 lg:hidden flex justify-around items-center">
      {/* Overview/Dashboard tab */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90",
          currentPage === 'dashboard' ? 'text-primary' : 'text-on-surface-variant opacity-60'
        )}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: currentPage === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
          dashboard
        </span>
        <span className="text-[10px] font-semibold tracking-wider font-label-caps">Overview</span>
      </button>

      {/* Forecasting/Simulations tab */}
      <button
        onClick={() => onNavigate('forecasting')}
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90",
          currentPage === 'forecasting' ? 'text-primary' : 'text-on-surface-variant opacity-60'
        )}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: currentPage === 'forecasting' ? "'FILL' 1" : "'FILL' 0" }}>
          query_stats
        </span>
        <span className="text-[10px] font-semibold tracking-wider font-label-caps">Forecasting</span>
      </button>

      {/* Slide-up Filters Action button (floating and distinctive) */}
      <button
        onClick={onOpenFilters}
        className="flex flex-col items-center justify-center -translate-y-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 active:scale-90"
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          filter_list
        </span>
      </button>

      {/* SKU Catalog / Product Intelligence tab */}
      <button
        onClick={() => onNavigate('intelligence')}
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90",
          currentPage === 'intelligence' ? 'text-primary' : 'text-on-surface-variant opacity-60'
        )}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: currentPage === 'intelligence' ? "'FILL' 1" : "'FILL' 0" }}>
          inventory_2
        </span>
        <span className="text-[10px] font-semibold tracking-wider font-label-caps">Products</span>
      </button>

      {/* Help / Logout (minimal display) */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="flex flex-col items-center gap-1 text-error opacity-60 transition-all duration-300 active:scale-90"
      >
        <span className="material-symbols-outlined text-[24px]">
          logout
        </span>
        <span className="text-[10px] font-semibold tracking-wider font-label-caps">Logout</span>
      </button>
    </div>
  );
};
