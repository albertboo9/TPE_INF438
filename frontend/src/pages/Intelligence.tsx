import React from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/layout/GlassCard';
import { useCategoryStats } from '../hooks/useCategoryStats';

const Intelligence: React.FC = () => {
  const { data: categoryData = [] } = useCategoryStats({ limit: 20 });

  return (
    <div className="min-h-screen bg-background font-display text-on-background">
      <Header />
      <Sidebar />
      
      <main className="ml-72 pt-20 pb-xl px-lg max-w-7xl">
        <header className="mb-lg">
          <h1 className="font-display text-h1 text-primary">Product Intelligence</h1>
          <p className="text-on-surface-variant">Unified performance metrics and AI-driven shelf-life forecasting.</p>
        </header>

        <div className="grid grid-cols-12 gap-bento-gap">
          <GlassCard className="col-span-12 glass-card rounded-xl overflow-hidden">
            <div className="px-md py-sm border-b border-outline/10 flex justify-between items-center bg-surface-container-lowest/50">
              <div className="flex items-center gap-md">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">SKU Catalog</span>
                <div className="flex gap-xs">
                  <span className="bg-primary/5 text-primary px-sm py-1 rounded-full text-xs font-semibold">Active: 1,204</span>
                  <span className="bg-error/5 text-error px-sm py-1 rounded-full text-xs font-semibold">Critical: 12</span>
                </div>
              </div>
              <div className="flex gap-sm">
                <button className="text-xs font-semibold px-sm py-1.5 rounded-lg border border-outline/20 hover:bg-surface-variant/30 transition-all flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                </button>
                <button className="text-xs font-semibold px-sm py-1.5 rounded-lg border border-outline/20 hover:bg-surface-variant/30 transition-all flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">download</span> Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/30 text-outline text-xs uppercase tracking-wider font-semibold">
                    <th className="px-md py-sm">SKU</th>
                    <th className="px-md py-sm">Product Name</th>
                    <th className="px-md py-sm">Category</th>
                    <th className="px-md py-sm text-right">Stock Level</th>
                    <th className="px-md py-sm">Sales Velocity</th>
                    <th className="px-md py-sm">AI Forecast</th>
                    <th className="px-md py-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {categoryData.map((item, index) => (
                    <tr key={index} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-md py-md font-mono-data text-primary">#FD-{1000 + index}</td>
                      <td className="px-md py-md">
                        <div className="font-semibold text-on-surface">{item.categorie_groupe}</div>
                        <div className="text-[10px] text-outline uppercase">Fresh Produce</div>
                      </td>
                      <td className="px-md py-md">
                        <span className="bg-surface-container-high px-xs py-0.5 rounded text-[11px] font-medium">Grocery</span>
                      </td>
                      <td className="px-md py-md text-right font-mono-data font-bold">
                        {Math.round(item.totalSales / 100)} <span className="text-[10px] font-normal text-outline">/ 800</span>
                      </td>
                      <td className="px-md py-md">
                        <div className="w-24 h-6 relative">
                          <div className="absolute inset-0 bg-emerald-ai/10 rounded-full"></div>
                          <div className="absolute inset-y-0 left-0 bg-emerald-ai w-3/4 rounded-full"></div>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">High</span>
                        </div>
                      </td>
                      <td className="px-md py-md text-emerald-ai font-semibold flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">trending_up</span>
                        +{item.percentage}% (7d)
                      </td>
                      <td className="px-md py-md text-right">
                        <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-all">more_vert</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default Intelligence;