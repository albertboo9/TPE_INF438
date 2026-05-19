import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { AnalyticsFilters } from '../../services/api';

interface SidebarProps {
  className?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  filters: AnalyticsFilters;
  onFilterChange: (newFilters: AnalyticsFilters) => void;
}

const categories = ['Fresh Produce', 'Dairy & Eggs', 'Frozen Goods', 'Bakery', 'Beverages'];
const stores = ['3', '8', '37', '44', '47', '50'];

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  currentPage,
  onNavigate,
  filters,
  onFilterChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    filters.family ? filters.family.toLowerCase() : null
  );
  const [startDate, setStartDate] = useState<string>(filters.startDate || '');
  const [endDate, setEndDate] = useState<string>(filters.endDate || '');
  const [selectedStore, setSelectedStore] = useState<string>(filters.store_nbr || '');

  const handleCategoryChange = (category: string, isChecked: boolean) => {
    const updatedCategory = isChecked ? category : null;
    setSelectedCategory(updatedCategory);
    onFilterChange({
      ...filters,
      family: updatedCategory ? updatedCategory.toUpperCase() : undefined,
    });
  };

  const handleStoreChange = (store: string) => {
    const updatedStore = selectedStore === store ? '' : store;
    setSelectedStore(updatedStore);
    onFilterChange({
      ...filters,
      store_nbr: updatedStore || undefined,
    });
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      ...filters,
      startDate: start || undefined,
      endDate: end || undefined,
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedStore('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full w-72 bg-surface-container-low/80 dark:bg-[#181420]/80 backdrop-blur-xl",
      "border-r border-border dark:border-[#2b2735] flex flex-col z-40",
      "pt-20 px-6",
      className
    )}>
      {/* Title */}
      <div className="mb-8 px-2 mt-4 flex justify-between items-center">
        <div>
          <h2 className="font-display text-[15px] font-black text-on-surface uppercase tracking-widest">
            Executive Cockpit
          </h2>
          <p className="font-body-sm text-[10px] font-mono-data text-outline uppercase tracking-wider">
            Unity Volume V3.4
          </p>
        </div>
        <button 
          onClick={handleResetFilters}
          className="text-[10px] font-bold text-error/80 hover:text-error hover:underline transition-all"
          title="Reset Filters"
        >
          Clear
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1.5 mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-left active:scale-[0.98]",
            currentPage === 'dashboard'
              ? "bg-primaryContainer text-on-primaryContainer shadow-sm border border-primary/10"
              : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-[#1d1926]"
          )}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentPage === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
            dashboard
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider font-label-caps">Overview</span>
        </button>

        <button
          onClick={() => onNavigate('forecasting')}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-left active:scale-[0.98]",
            currentPage === 'forecasting'
              ? "bg-primaryContainer text-on-primaryContainer shadow-sm border border-primary/10"
              : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-[#1d1926]"
          )}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentPage === 'forecasting' ? "'FILL' 1" : "'FILL' 0" }}>
            query_stats
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider font-label-caps">AI Forecasting</span>
        </button>

        <button
          onClick={() => onNavigate('intelligence')}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-left active:scale-[0.98]",
            currentPage === 'intelligence'
              ? "bg-primaryContainer text-on-primaryContainer shadow-sm border border-primary/10"
              : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-[#1d1926]"
          )}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentPage === 'intelligence' ? "'FILL' 1" : "'FILL' 0" }}>
            inventory_2
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider font-label-caps">SKU Catalog</span>
        </button>
      </nav>

      <div className="h-px bg-border dark:bg-[#2b2735] mb-6"></div>

      {/* Dynamic Slicing Parameters Controls */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
        {/* Date Window */}
        <div className="space-y-3">
          <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-widest block">
            DATE WINDOW
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant opacity-70">START</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="pl-3 pr-2 py-1.5 bg-surface-container border border-border dark:border-[#2b2735] rounded-lg text-[11px] font-mono-data focus:outline-none w-36"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant opacity-70">END</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="pl-3 pr-2 py-1.5 bg-surface-container border border-border dark:border-[#2b2735] rounded-lg text-[11px] font-mono-data focus:outline-none w-36"
              />
            </div>
          </div>
        </div>

        {/* Categories Selector */}
        <div className="space-y-3">
          <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-widest block">
            CATEGORIES
          </span>
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = selectedCategory === category.toLowerCase();
              return (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 dark:bg-surface-container"
                  />
                  <span className={cn(
                    "text-xs font-semibold transition-colors group-hover:text-primary",
                    isChecked ? "text-primary" : "text-on-surface-variant"
                  )}>
                    {category}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Location Selector */}
        <div className="space-y-3">
          <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-widest block">
            MAGASIN (STORE)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {stores.map((store) => {
              const isSelected = selectedStore === store;
              return (
                <button
                  key={store}
                  onClick={() => handleStoreChange(store)}
                  className={cn(
                    "py-1.5 rounded-lg text-[11px] font-mono-data border transition-all duration-200 active:scale-95",
                    isSelected
                      ? "bg-primary border-primary text-white font-bold"
                      : "bg-surface-container border-border dark:border-[#2b2735] text-on-surface-variant hover:bg-border"
                  )}
                >
                  #{store}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Branding info */}
      <div className="p-4 border-t border-border dark:border-[#2b2735] mt-auto flex items-center justify-between text-[10px] font-semibold text-outline">
        <span>RetailSense V3.4</span>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-error font-bold flex items-center gap-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">logout</span>
          <span>Quit</span>
        </button>
      </div>
    </aside>
  );
};