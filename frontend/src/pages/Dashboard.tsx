import React from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/layout/GlassCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { TreemapChart } from '../components/charts/TreemapChart';
import { useGlobalStats } from '../hooks/useGlobalStats';
import { useTemporalStats } from '../hooks/useTemporalStats';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { useStoreStats } from '../hooks/useStoreStats';
import { GlobalStats, TemporalData } from '../types';

const Dashboard: React.FC = () => {
  const { data: globalStats, isLoading: globalLoading } = useGlobalStats();
  const { data: temporalData = [], isLoading: temporalLoading } = useTemporalStats({ year: 2024 });
  const { data: categoryData = [], isLoading: categoryLoading } = useCategoryStats({ limit: 10 });
  const { data: storeData = [], isLoading: storeLoading } = useStoreStats({ limit: 10 });

  const chartData: TemporalData[] = temporalData.map(d => ({
    date: `${d.annee}-${d.mois}-${d.dayOfWeek}`,
    sales: d.sales,
    dayOfWeek: d.dayOfWeek,
    month: d.month,
    year: d.year,
    enPromotion: d.enPromotion,
  }));

  return (
    <div className="min-h-screen bg-background font-display text-on-background">
      <Header />
      <Sidebar />
      
      <main className="ml-72 pt-20 pb-xl px-lg max-w-7xl">
        <div className="mb-lg flex justify-between items-end">
          <div>
            <p className="font-label-caps text-on-surface-variant uppercase mb-base">
              Performance Intelligence
            </p>
            <h2 className="font-h1 text-on-background">Executive Overview</h2>
          </div>
          <button className="flex items-center gap-xs bg-electric-indigo text-white px-md py-sm rounded-lg font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span>Generate Forecast</span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-bento-gap">
          <GlassCard className="col-span-12 md:col-span-3 p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-caps text-on-surface-variant uppercase">Revenue</span>
              <span className="font-mono-data text-emerald-ai text-[12px]">+12.4%</span>
            </div>
            <h3 className="font-h2 text-on-background mb-xs">${globalStats?.totalRevenue?.toLocaleString() || '0'}</h3>
            <div className="h-12 w-full mt-sm flex items-end gap-[2px]">
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '35%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '55%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '45%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '70%' }}></div>
              <div className="flex-1 bg-emerald-ai/20 rounded-t-sm" style={{ height: '85%' }}></div>
              <div className="flex-1 bg-emerald-ai rounded-t-sm" style={{ height: '100%' }}></div>
            </div>
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-3 p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-caps text-on-surface-variant uppercase">Total Units</span>
              <span className="font-mono-data text-emerald-ai text-[12px]">+5.2%</span>
            </div>
            <h3 className="font-h2 text-on-background mb-xs">{globalStats?.totalVolume?.toLocaleString() || '0'}</h3>
            <div className="h-12 w-full mt-sm flex items-end gap-[2px]">
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '55%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '65%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-emerald-ai/10 rounded-t-sm" style={{ height: '75%' }}></div>
              <div className="flex-1 bg-emerald-ai/20 rounded-t-sm" style={{ height: '80%' }}></div>
              <div className="flex-1 bg-emerald-ai rounded-t-sm" style={{ height: '85%' }}></div>
            </div>
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-3 p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-caps text-on-surface-variant uppercase">Conversion</span>
              <span className="font-mono-data text-error text-[12px]">-0.8%</span>
            </div>
            <h3 className="font-h2 text-on-background mb-xs">3.42%</h3>
            <div className="h-12 w-full mt-sm flex items-end gap-[2px]">
              <div className="flex-1 bg-on-surface-variant/10 rounded-t-sm" style={{ height: '80%' }}></div>
              <div className="flex-1 bg-on-surface-variant/10 rounded-t-sm" style={{ height: '75%' }}></div>
              <div className="flex-1 bg-on-surface-variant/10 rounded-t-sm" style={{ height: '70%' }}></div>
              <div className="flex-1 bg-on-surface-variant/10 rounded-t-sm" style={{ height: '80%' }}></div>
              <div className="flex-1 bg-on-surface-variant/10 rounded-t-sm" style={{ height: '65%' }}></div>
              <div className="flex-1 bg-on-surface-variant/20 rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-on-surface-variant/40 rounded-t-sm" style={{ height: '55%' }}></div>
            </div>
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-3 p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-caps text-on-surface-variant uppercase">Growth Delta</span>
              <span className="font-mono-data text-emerald-ai text-[12px]">+2.1%</span>
            </div>
            <h3 className="font-h2 text-on-background mb-xs">18.4%</h3>
            <div className="h-12 w-full mt-sm flex items-end gap-[2px]">
              <div className="flex-1 bg-electric-indigo/10 rounded-t-sm" style={{ height: '30%' }}></div>
              <div className="flex-1 bg-electric-indigo/10 rounded-t-sm" style={{ height: '45%' }}></div>
              <div className="flex-1 bg-electric-indigo/10 rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="flex-1 bg-electric-indigo/10 rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-electric-indigo/10 rounded-t-sm" style={{ height: '55%' }}></div>
              <div className="flex-1 bg-electric-indigo/20 rounded-t-sm" style={{ height: '75%' }}></div>
              <div className="flex-1 bg-electric-indigo rounded-t-sm" style={{ height: '90%' }}></div>
            </div>
          </GlassCard>

          <GlassCard className="col-span-12 glass-card p-lg">
            <div className="flex justify-between items-start mb-lg">
              <div>
                <h3 className="font-h2 text-on-background mb-base">Actual Sales vs AI Predicted Sales</h3>
                <p className="font-body-sm text-on-surface-variant">30-day performance projection across all regional nodes.</p>
              </div>
            </div>
            {chartData.length > 0 && <LineChart data={chartData} />}
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-8 glass-card p-lg rounded-xl">
            <div className="flex justify-between items-start mb-lg">
              <div>
                <span className="font-label-caps text-on-surface-variant block mb-base uppercase">TOP PERFORMING CATEGORIES</span>
              </div>
            </div>
            {categoryData.length > 0 && <TreemapChart data={categoryData} />}
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-4 glass-card p-md rounded-xl flex flex-col justify-center">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-electric-indigo" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <span className="font-label-caps text-electric-indigo uppercase">AI Insight</span>
            </div>
            <p className="font-body-lg text-on-surface font-medium leading-tight">
              "Stock levels for <span className="text-electric-indigo">Dairy</span> are projected to drop by 18% during the upcoming weekend surge. Recommended order increase: 15.2%."
            </p>
            <button className="mt-md text-electric-indigo font-semibold text-body-sm flex items-center gap-xs hover:gap-sm transition-all">
              Apply Optimization <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;