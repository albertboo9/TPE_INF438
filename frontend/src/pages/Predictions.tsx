import React from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/layout/GlassCard';
import { BarChart } from '../components/charts/BarChart';
import { useGlobalStats } from '../hooks/useGlobalStats';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { CategoryStat } from '../types';

const Predictions: React.FC = () => {
  const { data: globalStats, isLoading } = useGlobalStats();
  const { data: categoryData = [] } = useCategoryStats({ limit: 5 });

  const smartPromotions: CategoryStat[] = [
    { categorie_groupe: 'Organic Avocados', totalSales: 125000, percentage: 18, transactionCount: 245 },
    { categorie_groupe: 'Premium Almond Milk', totalSales: 98000, percentage: 12, transactionCount: 180 },
    { categorie_groupe: 'Artisan Sourdough', totalSales: 245000, percentage: 24, transactionCount: 320 },
  ];

  return (
    <div className="min-h-screen bg-background font-display text-on-background">
      <Header />
      <Sidebar />
      
      <main className="ml-72 pt-20 pb-xl px-lg max-w-7xl">
        <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <span className="font-label-caps text-primary tracking-widest mb-base block">PREDICTIVE ENGINE</span>
            <h1 className="font-display text-h1 text-on-background">Quarterly Revenue & Forecasting</h1>
          </div>
          <div className="flex gap-sm">
            <div className="glass-card px-md py-sm rounded-xl flex items-center gap-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-ai animate-pulse"></div>
              <span className="font-mono-data text-on-surface-variant">Model Version: V3.4 Active</span>
            </div>
            <button className="bg-electric-indigo text-white px-md py-sm rounded-lg font-semibold flex items-center gap-xs shadow-lg transition-all hover:brightness-110 active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Generate Forecast
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-bento-gap">
          <GlassCard className="col-span-12 lg:col-span-8 flex flex-col gap-bento-gap">
            <GlassCard className="p-lg flex flex-col gap-md">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-label-caps text-on-surface-variant block mb-base uppercase">Projected Revenue Q3 2024</span>
                  <div className="flex items-baseline gap-sm">
                    <span className="font-display text-display text-on-background">${globalStats?.totalRevenue?.toLocaleString() || '0'}</span>
                    <span className="text-emerald-ai font-semibold flex items-center text-body-lg">
                      <span className="material-symbols-outlined">trending_up</span>
                      {globalStats?.promotionPercentage || 0}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-xs">
                  <span className="font-label-caps text-on-surface-variant uppercase">Confidence Score</span>
                  <div className="flex items-center gap-sm">
                    <div className="relative w-16 h-8 overflow-hidden">
                      <div className="absolute inset-0 border-[6px] border-outline-variant rounded-t-full"></div>
                      <div className="absolute inset-0 border-[6px] border-electric-indigo rounded-t-full" style={{ clipPath: 'inset(0 5% 0 0)' }}></div>
                    </div>
                    <span className="font-mono-data text-h2 text-electric-indigo">0.94 <span className="text-body-sm font-display text-on-surface-variant">R²</span></span>
                  </div>
                  <div className="bg-electric-indigo/10 text-electric-indigo px-sm py-base rounded-full text-[10px] font-bold tracking-tighter flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    VERIFIED BY AI
                  </div>
                </div>
              </div>
            </GlassCard>
          </GlassCard>

          <GlassCard className="col-span-12 lg:col-span-4 flex flex-col gap-bento-gap">
            <GlassCard className="p-lg rounded-xl h-full flex flex-col">
              <div className="mb-md">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-caps text-electric-indigo uppercase tracking-widest">Smart Promotions</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-body-lg">info</span>
                </div>
                <h2 className="text-h2 text-on-background">Next Week's Recommendations</h2>
              </div>
              <div className="space-y-sm flex-grow">
                {smartPromotions.map((item, index) => (
                  <div key={index} className="p-sm rounded-xl border border-outline/5 bg-surface-container-lowest/50 hover:bg-surface-container-high transition-colors cursor-pointer group">
                    <div className="flex gap-md">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                        <img alt={item.categorie_groupe} className="w-full h-full object-cover" src={`https://picsum.photos/64/64?random=${index}`} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="font-body-lg font-semibold text-on-background group-hover:text-primary transition-colors">{item.categorie_groupe}</span>
                        <span className="font-mono-data text-body-sm text-emerald-ai">Potential Yield: +{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="mt-sm flex justify-between items-center pt-sm border-t border-outline/5">
                      <span className="text-body-sm text-on-surface-variant">Confidence Level</span>
                      <div className="flex gap-1">
                        {Array(4).fill(0).map((_, i) => (
                          <div key={i} className={`h-1.5 w-6 rounded-full ${i < Math.ceil(item.percentage / 10) ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-lg py-md rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-all flex justify-center items-center gap-xs">
                View All Opportunities
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </GlassCard>
          </GlassCard>

          <GlassCard className="col-span-12 glass-card p-md rounded-xl flex flex-col md:flex-row items-center justify-between gap-md border-t-4 border-emerald-ai">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-emerald-ai/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-ai">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-on-background">AI Executive Summary</h3>
                <p className="text-body-sm text-on-surface-variant">Consumer sentiment in your region is shifting towards organic and sustainable packaging. Adjust inventory for Q4 accordingly.</p>
              </div>
            </div>
            <div className="flex gap-sm shrink-0">
              <button className="px-md py-sm rounded-lg text-on-surface-variant font-semibold hover:bg-surface-variant transition-colors">Dismiss</button>
              <button className="px-md py-sm rounded-lg bg-on-background text-surface rounded-lg font-semibold shadow-md">Apply Strategy</button>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default Predictions;