import React, { useState } from 'react';
import { AnalyticsFilters } from '../../services/api';
import { cn } from '../../lib/utils';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
  onFilterChange: (newFilters: AnalyticsFilters) => void;
}

const categories = ['Fresh Produce', 'Dairy & Eggs', 'Frozen Goods', 'Bakery', 'Beverages'];
const stores = ['3', '8', '37', '44', '47', '50'];

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.family ? [filters.family] : []
  );
  const [selectedStore, setSelectedStore] = useState<string>(filters.store_nbr || '');
  const [startDate, setStartDate] = useState<string>(filters.startDate || '');
  const [endDate, setEndDate] = useState<string>(filters.endDate || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onFilterChange({
      family: selectedCategories.length > 0 ? selectedCategories[0].toUpperCase() : undefined,
      store_nbr: selectedStore || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedStore('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      ></div>

      {/* Slide up panel */}
      <div className="relative w-full max-h-[85vh] bg-surface dark:bg-[#181420] border-t border-border dark:border-[#2b2735] rounded-t-[32px] p-6 shadow-2xl overflow-y-auto no-scrollbar z-10 animate-slide-up flex flex-col gap-6">
        {/* Header indicator bar */}
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer" onClick={onClose}></div>

        <div className="flex justify-between items-center">
          <h3 className="font-h2 text-on-surface">Slice Parameters</h3>
          <button 
            onClick={handleClear}
            className="text-xs font-semibold text-error/80 hover:text-error transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Date Ranges */}
        <div className="space-y-2">
          <span className="font-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider block">Temporal window</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-outline font-semibold">START DATE</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-border dark:border-[#2b2735] rounded-xl bg-surface-container-low text-xs focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-outline font-semibold">END DATE</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-border dark:border-[#2b2735] rounded-xl bg-surface-container-low text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Store ID Selector */}
        <div className="space-y-2">
          <span className="font-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider block">Store Location</span>
          <div className="flex flex-wrap gap-2">
            {stores.map(store => (
              <button
                key={store}
                onClick={() => setSelectedStore(selectedStore === store ? '' : store)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 active:scale-95",
                  selectedStore === store
                    ? "bg-primary border-primary text-white"
                    : "border-border dark:border-[#2b2735] text-on-surface-variant bg-surface-container-low"
                )}
              >
                Store #{store}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Checkboxes */}
        <div className="space-y-2">
          <span className="font-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider block">Product Category</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCategories([]);
                    } else {
                      setSelectedCategories([category]);
                    }
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 active:scale-95",
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "border-border dark:border-[#2b2735] text-on-surface-variant bg-surface-container-low"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply Action Button */}
        <button
          onClick={handleApply}
          className="w-full py-4 mt-2 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
          <span>Apply Slicing Filters</span>
        </button>
      </div>
    </div>
  );
};
