import React from 'react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenFilters: () => void;
  userRole?: string;
}

const NAV_ITEMS = [
  { page: 'dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
  { page: 'forecasting', label: 'Prévisionnel', icon: 'query_stats', badge: 'IA' },
  { page: 'intelligence', label: 'Catalogue', icon: 'inventory_2' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  onNavigate,
  onOpenFilters,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/80 dark:bg-[#181420]/80 backdrop-blur-xl border-t border-border dark:border-[#2b2735] px-4 py-2 lg:hidden flex justify-around items-center safe-area-bottom">
      {NAV_ITEMS.map((item) => {
        const active = currentPage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all duration-300 active:scale-90 relative py-1 px-3",
              active ? 'text-brand-500' : 'text-on-surface-variant/50'
            )}
          >
            {/* Active indicator dot */}
            {active && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-brand-500" />
            )}
            <span className="material-symbols-outlined text-[22px]" style={{
              fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300"
            }}>
              {item.icon}
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            {item.badge && active && (
              <span className="absolute -top-0.5 right-1 text-[7px] font-bold px-1 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Filter button */}
      <button
        onClick={onOpenFilters}
        className="flex flex-col items-center justify-center -translate-y-3 w-11 h-11 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-brand-500/50 active:scale-90"
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          tune
        </span>
      </button>

      {/* Logout */}
      <button
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="flex flex-col items-center gap-0.5 text-on-surface-variant/40 transition-all duration-300 active:scale-90 py-1 px-3"
      >
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
          logout
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase">Quitter</span>
      </button>
    </div>
  );
};