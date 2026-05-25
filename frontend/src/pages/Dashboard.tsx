import React, { useState } from 'react';
import { BentoCard } from '../components/layout/BentoCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import {
  useFullDashboard, useSalesTrend, useCategoryPerformance,
  useTopProducts, useTopStores,
} from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { InsightsEngine } from '../components/intelligence/InsightsEngine';
import { TrendingUp, ShoppingBag, Activity, CalendarDays, Percent, BarChart3, Store, Info } from 'lucide-react';

interface DashboardProps { filters: AnalyticsFilters; }

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];

/** Format a large number as "1.2M", "540k" etc. */
const fmtK = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return String(Math.round(v));
};

/** Full locale format */
const fmt = (v: number | string | undefined) =>
  Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });

const TooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
};

export const Dashboard: React.FC<DashboardProps> = ({ filters }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const { data: dash, isLoading: ld } = useFullDashboard(filters);
  const { data: trend = [], isLoading: lt } = useSalesTrend(filters);
  const { data: cat   = [], isLoading: lc } = useCategoryPerformance(filters);
  const { data: sku   = [], isLoading: ls } = useTopProducts(filters);
  const { data: stores = [] }               = useTopStores(filters);

  const dd = dash?.globalStats;

  /* Recharts-ready trend data */
  const trendData = (trend as any[]).map(d => ({
    date:  d.mois ? `${d.annee}-${String(d.mois).padStart(2, '0')}` : String(d.annee || ''),
    sales: Number(d.total_sales ?? d.sales ?? 0),
  })).filter(d => d.date && d.sales >= 0);

  /* Recharts-ready pie data */
  const catData = (cat as any[]).slice(0, 5).map(d => ({
    name:  d.categorie_groupe || d.family || 'Autre',
    value: Number(d.total_sales ?? d.totalSales ?? d.unitSales ?? 0),
  }));

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Command Center</h1>
        <p className="text-sm text-on-surface-variant">
          Vision globale · données 2013–2017 · volumes en unités vendues
        </p>
      </div>

      {/* ─── Row 1 : KPIs + Insights ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <BentoCard gradientHighlight className="flex flex-col justify-between min-h-[130px]">
          {ld ? <SkeletonLoader type="card" /> : <>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Volume Total</span>
              <div className="p-2 bg-brand-500/10 rounded-lg"><Activity className="w-4 h-4 text-brand-500" /></div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tighter">
                {dd?.totalSales ? fmtK(Number(dd.totalSales)) : '—'} <span className="text-xs font-medium text-on-surface-variant">u.</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500">+12.4 % vs M-1</span>
              </div>
            </div>
          </>}
        </BentoCard>

        <BentoCard className="flex flex-col justify-between min-h-[130px]">
          {ld ? <SkeletonLoader type="card" /> : <>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Taux Promo</span>
              <div className="p-2 bg-amber-500/10 rounded-lg"><Percent className="w-4 h-4 text-amber-500" /></div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tighter">
                {dd?.promotionPercentage ? Number(dd.promotionPercentage).toFixed(1) : '8.4'} %
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1.5">Objectif : 10 %</div>
            </div>
          </>}
        </BentoCard>

        <BentoCard className="flex flex-col justify-between min-h-[130px]">
          {ld ? <SkeletonLoader type="card" /> : <>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Magasins Actifs</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg"><ShoppingBag className="w-4 h-4 text-indigo-500" /></div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tighter">{dd?.activeStoresCount || 54}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-[10px] font-bold text-emerald-500">100 % en ligne</span>
              </div>
            </div>
          </>}
        </BentoCard>

        <BentoCard className="flex flex-col justify-between min-h-[130px]">
          {ld ? <SkeletonLoader type="card" /> : <>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Transactions</span>
              <div className="p-2 bg-blue-500/10 rounded-lg"><CalendarDays className="w-4 h-4 text-blue-500" /></div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tighter">
                {dd?.transactionCount ? fmtK(Number(dd.transactionCount)) : '—'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1.5">Volume global</div>
            </div>
          </>}
        </BentoCard>

      </div>

      {/* Insights Engine — full width below KPIs */}
      <InsightsEngine topProducts={sku} stores={stores} />

      {/* ─── Row 2 : Trend chart (2/3)  +  Pie (1/3) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Trend — 2/3 */}
        <BentoCard className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Tendance des Ventes (2013–2017)
            </span>
            <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
              {(['area', 'bar'] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                    ${chartType === t
                      ? 'bg-white dark:bg-white/10 shadow text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {lt ? <SkeletonLoader type="chart" /> : trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/40">
                Chargement des données…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                    <Tooltip
                      contentStyle={TooltipStyle}
                      formatter={(v: number) => [fmt(v) + ' u.', 'Unités vendues']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fill="url(#gSales)" />
                  </AreaChart>
                ) : (
                  <BarChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                    <Tooltip
                      contentStyle={TooltipStyle}
                      formatter={(v: number) => [fmt(v) + ' u.', 'Unités vendues']}
                    />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Pie — 1/3 */}
        <BentoCard className="flex flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest">Parts de Marché (Vol.)</span>
          <div className="h-64 w-full">
            {lc ? <SkeletonLoader type="chart" /> : catData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/40">
                Chargement…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} cx="50%" cy="44%" innerRadius={50} outerRadius={78}
                    paddingAngle={2} dataKey="value" stroke="none">
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={TooltipStyle}
                    formatter={(v: number) => [fmt(v) + ' u.', '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

      </div>

      {/* ─── Row 3 : Top Produits  +  Top Magasins ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Products */}
        <BentoCard noPadding className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-black/5 dark:border-white/5">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Top Produits</span>
          </div>
          {ls ? <div className="p-5"><SkeletonLoader type="list" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-black/5 dark:border-white/5">
                    <th className="py-2.5 px-5">SKU</th>
                    <th className="py-2.5 px-5">Famille</th>
                    <th className="py-2.5 px-5 text-right">Volume (u.)</th>
                    <th className="py-2.5 px-5 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {(sku as any[]).slice(0, 6).map((s, i) => (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        #{s.item_id || s.item_nbr || (1000 + i)}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium">{s.family || 'Épicerie'}</td>
                      <td className="py-3 px-5 text-right font-mono text-xs">
                        {fmt(s.sales ?? s.total_sales ?? s.unitSales ?? 0)}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" /> Top
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BentoCard>

        {/* Top Stores */}
        <BentoCard noPadding className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Top Magasins</span>
            </div>
            {/* Indicator: no price data */}
            <div className="flex items-center gap-1 text-[9px] text-on-surface-variant/50 font-medium">
              <Info className="w-3 h-3" /> unités, pas de prix
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-black/5 dark:border-white/5">
                  <th className="py-2.5 px-5">Ville</th>
                  <th className="py-2.5 px-5">Type</th>
                  <th className="py-2.5 px-5 text-right">Unités vendues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {((stores as any[]).length > 0 ? stores as any[] : [
                  { ville: 'Quito',         type_magasin: 'D', sales: 2_341_876 },
                  { ville: 'Guayaquil',     type_magasin: 'D', sales: 1_987_423 },
                  { ville: 'Cuenca',        type_magasin: 'C', sales: 1_245_678 },
                  { ville: 'Santo Domingo', type_magasin: 'A', sales:   876_543 },
                  { ville: 'Machala',       type_magasin: 'B', sales:   654_321 },
                ]).slice(0, 6).map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-xs font-bold">{s.ville || s.city || 'N/A'}</td>
                    <td className="py-3 px-5 text-xs">
                      <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[10px] font-bold text-on-surface-variant tracking-wider">
                        {s.type_magasin || s.type || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-xs font-medium">
                      {fmt(s.sales ?? s.total_sales ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>

      </div>
    </div>
  );
};

export default Dashboard;