import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
}

const categories = ['Fresh Produce', 'Dairy & Eggs', 'Frozen Goods', 'Bakery', 'Beverages'];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Fresh Produce', 'Dairy & Eggs']);

  return (
    <aside className={cn(
      "fixed left-0 h-full w-72 bg-surface-container-low/80 backdrop-blur-xl",
      "border-r border-outline/10 flex flex-col z-40",
      "pt-20 px-md",
      className
    )}>
      <div className="mb-lg px-sm">
        <h2 className="font-display text-h2 font-bold text-primary">Inventory Engine</h2>
        <p className="font-body-sm text-on-surface-variant opacity-70">V3.4 Active</p>
      </div>

      <nav className="flex-1 space-y-xs">
        <a className="flex items-center gap-sm px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-semibold transition-all" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body-sm">Overview</span>
        </a>
        <a className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-all" href="#">
          <span className="material-symbols-outlined">query_stats</span>
          <span className="font-body-sm">Forecasting</span>
        </a>
        <a className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-all" href="#">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-body-sm">Inventory</span>
        </a>
        <a className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-all" href="#">
          <span className="material-symbols-outlined">campaign</span>
          <span className="font-body-sm">Marketing</span>
        </a>
      </nav>

      <div className="h-px bg-outline/10 my-md mx-xs"></div>

      <div className="px-xs space-y-md">
        <div>
          <span className="font-label-caps text-on-surface-variant mb-sm block">DATE RANGE</span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-sm">calendar_today</span>
            <input 
              className="w-full pl-xl pr-sm py-xs bg-surface-container-lowest border border-outline/10 rounded-lg text-body-sm font-mono-data focus:outline-none"
              readOnly
              type="text"
              value="Oct 12 - Nov 12, 2024"
            />
          </div>
        </div>

        <div>
          <span className="font-label-caps text-on-surface-variant mb-sm block">CATEGORIES</span>
          <div className="space-y-xs">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-xs cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                    }
                  }}
                  className="w-4 h-4 rounded border-outline/30 text-primary focus:ring-primary/20"
                />
                <span className="font-body-sm text-on-surface-variant group-hover:text-primary transition-colors">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="font-label-caps text-on-surface-variant mb-sm block">SEASONAL ENGINE</span>
          <div className="flex p-base bg-surface-container border border-outline/10 rounded-lg">
            <button className="flex-1 py-base text-xs font-semibold bg-surface-container-lowest shadow-sm rounded text-primary">Dry</button>
            <button className="flex-1 py-base text-xs font-semibold text-on-surface-variant hover:text-on-surface">Rainy</button>
            <button className="flex-1 py-base text-xs font-semibold text-on-surface-variant hover:text-on-surface">Ramadan</button>
          </div>
        </div>

        <div>
          <span className="font-label-caps text-on-surface-variant mb-sm block">MANUFACTURER</span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-sm">factory</span>
            <input
              className="w-full pl-xl pr-sm py-xs bg-surface-container-lowest border border-outline/10 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search vendors..."
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="pt-lg mt-auto">
        <button className="w-full py-sm bg-electric-indigo text-white rounded-lg font-bold flex items-center justify-center gap-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          Generate Forecast
        </button>
      </div>

      <div className="mt-auto p-md space-y-1 border-t border-outline/10">
        <a className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-all" href="#">
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-sm">Help Center</span>
        </a>
        <a className="flex items-center gap-sm px-md py-sm text-error hover:bg-error-container/20 rounded-lg transition-all" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-sm">Log Out</span>
        </a>
      </div>
    </aside>
  );
};