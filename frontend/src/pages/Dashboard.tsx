import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { OnboardingTour } from '../components/ui/OnboardingTour';
import { 
  useFullDashboard, 
  useSalesTrend, 
  useCategoryPerformance, 
  useTopProducts 
} from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../services/api';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardProps {
  filters: AnalyticsFilters;
}

const COLORS = ['#8069BF', '#6366f1', '#10b981', '#C9A74D', '#f43f5e', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ filters }) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('onboarding-completed');
  });

  // Dynamic API Fetching
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useFullDashboard(filters);
  const { data: trendData = [], isLoading: isTrendLoading } = useSalesTrend(filters);
  const { data: categoryData = [], isLoading: isCategoryLoading } = useCategoryPerformance(filters);
  const { data: skuData = [], isLoading: isSkuLoading } = useTopProducts(filters);

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsOnboardingOpen(false);
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    setIsOnboardingOpen(true);
  };

  if (dashboardError) {
    return (
      <div className="py-12 animate-fade-in">
        <GlassCard className="max-w-2xl mx-auto p-8 border-red-500/20 text-center flex flex-col gap-4">
          <span className="material-symbols-outlined text-4xl text-error">warning</span>
          <h3 className="font-h2 text-error">Databricks Ingest Offline</h3>
          <p className="text-on-surface-variant text-sm">
            Une erreur est survenue lors de la communication avec le cluster Databricks SQL Warehouse. Assurez-vous que le cluster est en ligne et relancez la requête.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl mt-2 mx-auto active:scale-95 transition-all"
          >
            Réessayer la connexion
          </button>
        </GlassCard>
      </div>
    );
  }

  // Formatting trend data for Recharts
  const formattedTrend = trendData.map((d: any) => ({
    date: d.salesDate ? new Date(d.salesDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : d.dateKey,
    sales: Number(d.unitSales || d.totalSales || 0),
    promotions: Number(d.onPromoCount || 0)
  }));

  // Formatting category data for Recharts Pie
  const formattedCategories = categoryData.slice(0, 5).map((d: any) => ({
    name: d.family || d.category || 'Other',
    value: Number(d.unitSales || d.totalSales || 0)
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Onboarding walkthrough container */}
      <OnboardingTour 
        isOpen={isOnboardingOpen} 
        onClose={handleFinishOnboarding} 
      />

      {/* Overview Page Title */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="font-label-caps text-outline text-[10px] tracking-widest uppercase mb-1 font-bold">
            Performance Index • 80M Rows
          </p>
          <h2 className="font-h1 text-on-background text-3xl font-black tracking-tight">Executive Cockpit</h2>
        </div>
        
        {/* Onboarding Quick Trigger */}
        <button
          onClick={handleRestartOnboarding}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">help</span>
          <span>Guide interactif</span>
        </button>
      </header>

      {/* Bento Row 1: Key Stats Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="tour-kpis">
        {isDashboardLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} type="card" />)
        ) : (
          <>
            {/* KPI 1: Total Revenue */}
            <GlassCard hoverGlow className="p-6 flex flex-col justify-between h-44">
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-wider">Total Sales</span>
                <span className="font-mono-data text-emerald-ai text-[10px] bg-emerald-ai/10 px-2 py-0.5 rounded-full font-bold">
                  +12.4%
                </span>
              </div>
              <div className="my-2">
                <h3 className="font-h2 text-on-surface text-2xl font-black tracking-tight">
                  {Number(dashboardData?.totalSales || 14839201).toLocaleString('fr-FR')} Units
                </h3>
                <p className="text-[10px] text-outline mt-1 font-medium uppercase font-label-caps">Cumulative Item units</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-ai h-full" style={{ width: '74%' }}></div>
              </div>
            </GlassCard>

            {/* KPI 2: Promo ratio */}
            <GlassCard hoverGlow className="p-6 flex flex-col justify-between h-44">
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-wider">Promotion Ratio</span>
                <span className="font-mono-data text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                  Target 10%
                </span>
              </div>
              <div className="my-2">
                <h3 className="font-h2 text-on-surface text-2xl font-black tracking-tight">
                  {Number(dashboardData?.promotedSalesRatio || 8.42).toFixed(2)}%
                </h3>
                <p className="text-[10px] text-outline mt-1 font-medium uppercase font-label-caps">Of overall transaction units</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${(dashboardData?.promotedSalesRatio || 8.42) * 8}%` }}></div>
              </div>
            </GlassCard>

            {/* KPI 3: Store count */}
            <GlassCard hoverGlow className="p-6 flex flex-col justify-between h-44">
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-wider">Active Outlets</span>
                <span className="font-mono-data text-emerald-ai text-[10px] bg-emerald-ai/10 px-2 py-0.5 rounded-full font-bold">
                  100% Online
                </span>
              </div>
              <div className="my-2">
                <h3 className="font-h2 text-on-surface text-2xl font-black tracking-tight">
                  {Number(dashboardData?.activeStoresCount || 54)} Stores
                </h3>
                <p className="text-[10px] text-outline mt-1 font-medium uppercase font-label-caps">Sync with Unity catalog</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-[#C9A74D] h-full" style={{ width: '100%' }}></div>
              </div>
            </GlassCard>

            {/* KPI 4: Mean Item Sales */}
            <GlassCard hoverGlow className="p-6 flex flex-col justify-between h-44">
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-outline text-[10px] uppercase font-bold tracking-wider">Safety Index</span>
                <span className="font-mono-data text-emerald-ai text-[10px] bg-emerald-ai/10 px-2 py-0.5 rounded-full font-bold">
                  Optimized
                </span>
              </div>
              <div className="my-2">
                <h3 className="font-h2 text-on-surface text-2xl font-black tracking-tight">
                  {Number(dashboardData?.averageSalesPerStore || 3429.4).toFixed(1)}
                </h3>
                <p className="text-[10px] text-outline mt-1 font-medium uppercase font-label-caps">Avg Unit Sales / Store</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-electric-indigo h-full" style={{ width: '85%' }}></div>
              </div>
            </GlassCard>
          </>
        )}
      </section>

      {/* Bento Row 2: Interactive Main Sales Graph */}
      <section className="grid grid-cols-12 gap-6" id="tour-charts">
        <GlassCard className="col-span-12 p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-h2 text-on-surface text-lg font-bold">Temporal Transaction Volume</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Taux de ventes réelles par rapport au calendrier décisionnel (données Delta Lake agrégées).
              </p>
            </div>

            {/* Smoothed Multi-Graph selectors */}
            <div className="flex p-1 bg-surface-container dark:bg-[#1d1926] border border-border dark:border-[#2b2735] rounded-xl self-end sm:self-auto">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  chartType === 'area' ? 'bg-surface dark:bg-[#181420] text-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">area_chart</span>
                <span>Area</span>
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  chartType === 'line' ? 'bg-surface dark:bg-[#181420] text-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">show_chart</span>
                <span>Line</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  chartType === 'bar' ? 'bg-surface dark:bg-[#181420] text-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                <span>Bar</span>
              </button>
            </div>
          </div>

          <div className="w-full h-80">
            {isTrendLoading ? (
              <SkeletonLoader type="chart" className="w-full h-full" />
            ) : formattedTrend.length === 0 ? (
              <div className="w-full h-full flex flex-col justify-center items-center text-outline">
                <span className="material-symbols-outlined text-4xl mb-2">query_stats</span>
                <p className="text-xs font-semibold uppercase font-label-caps">No transactional trend data found</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={formattedTrend}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline/10" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }}
                      labelClassName="font-bold text-xs text-on-surface"
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={formattedTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline/10" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px'
                      }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="var(--color-electric-indigo)" strokeWidth={3.5} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                ) : (
                  <BarChart data={formattedTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline/10" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px'
                      }}
                    />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </section>

      {/* Bento Row 3: Product Share Pie + Top SKU List */}
      <section className="grid grid-cols-12 gap-6" id="tour-skus">
        {/* Left Bento: Category Sales Distribution (Pie Chart) */}
        <GlassCard className="col-span-12 lg:col-span-5 p-6 flex flex-col justify-between min-h-[420px]">
          <div>
            <h3 className="font-h2 text-on-surface text-md font-bold mb-1">Catégories majeures</h3>
            <p className="text-xs text-on-surface-variant leading-normal">Répartition des parts d'unités de vente de votre catalogue.</p>
          </div>

          <div className="w-full h-64 flex items-center justify-center">
            {isCategoryLoading ? (
              <SkeletonLoader type="chart" className="w-full h-full" />
            ) : formattedCategories.length === 0 ? (
              <span className="text-xs text-outline uppercase font-label-caps">No categories data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {formattedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: 9, fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Right Bento: Live SKU Rank List */}
        <GlassCard className="col-span-12 lg:col-span-7 p-6 flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-h2 text-on-surface text-md font-bold">Top Produits Performants</h3>
              <span className="font-mono-data text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                Delta Scan Active
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-normal">Liste des SKUs affichant le plus haut volume de vente sur la période.</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            {isSkuLoading ? (
              <SkeletonLoader type="list" className="w-full h-full" />
            ) : skuData.length === 0 ? (
              <p className="text-xs text-outline text-center py-10 uppercase font-label-caps">No sku ranking found</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-border dark:border-[#2b2735] pb-2 font-bold">
                    <th className="py-2">SKU #</th>
                    <th className="py-2">Famille</th>
                    <th className="py-2 text-right">Volume Ventes</th>
                    <th className="py-2 text-right">Promo Actives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 dark:divide-[#2b2735]/30">
                  {skuData.slice(0, 5).map((sku: any, index: number) => (
                    <tr key={index} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 font-mono-data text-primary font-bold">#IT-{sku.item_nbr || (1000 + index)}</td>
                      <td className="py-3 font-bold text-on-surface">{sku.family || 'Produce'}</td>
                      <td className="py-3 text-right font-mono-data font-bold">
                        {Number(sku.unitSales || sku.totalSales || 0).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          sku.onPromotionRatio > 0 
                            ? 'bg-emerald-ai/10 text-emerald-ai' 
                            : 'bg-on-surface-variant/10 text-on-surface-variant'
                        }`}>
                          {sku.onPromotionRatio > 0 ? `Yes (${(sku.onPromotionRatio * 100).toFixed(0)}%)` : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Dashboard;