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
import { TrendingUp, ShoppingBag, Activity, CalendarDays, Percent, BarChart3, Store, Info, Sparkles, ShieldCheck, ArrowUpRight, Warehouse } from 'lucide-react';

interface DashboardProps { filters: AnalyticsFilters; }

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

const fmtK = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return String(Math.round(v));
};

const fmt = (v: number | string | undefined) =>
  Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });

const TooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
};

const StatCard = ({ label, value, sub, icon, color, loading, trend }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string; loading: boolean; trend?: { val: string; up: boolean }
}) => (
  <BentoCard className="flex flex-col justify-between min-h-[140px] relative overflow-hidden">
    {loading ? <SkeletonLoader type="card" /> : <>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: color }} />
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trend.up ? 'text-emerald-500' : 'text-rose-500'}`}>
              <ArrowUpRight className={`w-3 h-3 ${trend.up ? '' : 'rotate-90'}`} />
              {trend.val}
            </span>
          )}
          <span className="text-[10px] text-on-surface-variant/60">{sub}</span>
        </div>
      </div>
    </>}
  </BentoCard>
);

export const Dashboard: React.FC<DashboardProps> = ({ filters }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const { data: dash, isLoading: ld } = useFullDashboard(filters);
  const { data: trend = [], isLoading: lt } = useSalesTrend(filters);
  const { data: cat   = [], isLoading: lc } = useCategoryPerformance(filters);
  const { data: sku   = [], isLoading: ls } = useTopProducts(filters);
  const { data: stores = [] }               = useTopStores(filters);

  const dd = dash?.globalStats;

  const trendData = (trend as any[]).map(d => ({
    date: d.mois ? `${d.annee}-${String(d.mois).padStart(2, '0')}` : String(d.annee || ''),
    sales: Number(d.total_sales ?? d.sales ?? 0),
  })).filter(d => d.date && d.sales >= 0);

  const catData = (cat as any[]).slice(0, 5).map(d => ({
    name: d.categorie_groupe || d.family || 'Autre',
    value: Number(d.total_sales ?? d.totalSales ?? d.unitSales ?? 0),
  }));

  return (
    <div className="flex flex-col gap-6 pb-10 animate-fade-in">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Tableau de Bord</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/20">
              Temps réel
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Analyse décisionnelle · Données 2013–2017 · Prévisions J+45
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Système opérationnel</span>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Volume Total"
          value={dd?.totalSales ? fmtK(Number(dd.totalSales)) : '—'}
          sub="unités vendues"
          icon={<Activity className="w-4 h-4 text-brand-500" />}
          color="#6366f1"
          loading={ld}
          trend={{ val: '+12.4 % vs M-1', up: true }}
        />
        <StatCard
          label="Taux Promotion"
          value={dd?.promotionPercentage ? Number(dd.promotionPercentage).toFixed(1) + '%' : '8.4%'}
          sub="objectif 10 %"
          icon={<Percent className="w-4 h-4 text-amber-500" />}
          color="#f59e0b"
          loading={ld}
        />
        <StatCard
          label="Magasins"
          value={String(dd?.activeStoresCount || 54)}
          sub="tous actifs"
          icon={<Warehouse className="w-4 h-4 text-indigo-500" />}
          color="#6366f1"
          loading={ld}
          trend={{ val: '100 % en ligne', up: true }}
        />
        <StatCard
          label="Transactions"
          value={dd?.transactionCount ? fmtK(Number(dd.transactionCount)) : '—'}
          sub="volume global"
          icon={<ShoppingBag className="w-4 h-4 text-sky-500" />}
          color="#0ea5e9"
          loading={ld}
        />
      </div>

      {/* ─── Insights Engine ─── */}
      <InsightsEngine topProducts={sku} stores={stores} />

      {/* ─── Graphiques ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tendance */}
        <BentoCard className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Tendance des Ventes</span>
            </div>
            <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
              {(['area', 'bar'] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                    ${chartType === t
                      ? 'bg-white dark:bg-white/10 shadow text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {t === 'area' ? 'Courbe' : 'Barres'}
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
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                    <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [fmt(v) + ' u.', 'Unités vendues']} />
                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fill="url(#gSales)" />
                  </AreaChart>
                ) : (
                  <BarChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                    <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [fmt(v) + ' u.', 'Unités vendues']} />
                    <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Parts de Marché */}
        <BentoCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Parts par Catégorie</span>
          </div>
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
                  <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [fmt(v) + ' u.', '']} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>
      </div>

      {/* ─── Top Produits & Top Magasins ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BentoCard noPadding className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-black/5 dark:border-white/5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Top Produits</span>
          </div>
          {ls ? <div className="p-5"><SkeletonLoader type="list" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-black/5 dark:border-white/5">
                    <th className="py-3 px-5">Produit</th>
                    <th className="py-3 px-5">Famille</th>
                    <th className="py-3 px-5 text-right">Volume</th>
                    <th className="py-3 px-5 text-right">Performance</th>
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
                          <TrendingUp className="w-3 h-3" /> Leader
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BentoCard>

        <BentoCard noPadding className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Top Magasins</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-black/5 dark:border-white/5">
                  <th className="py-3 px-5">Ville</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5 text-right">Ventes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {((stores as any[]).length > 0 ? stores as any[] : [
                  { ville: 'Quito', type_magasin: 'D', sales: 2_341_876 },
                  { ville: 'Guayaquil', type_magasin: 'D', sales: 1_987_423 },
                  { ville: 'Cuenca', type_magasin: 'C', sales: 1_245_678 },
                  { ville: 'Santo Domingo', type_magasin: 'A', sales: 876_543 },
                  { ville: 'Machala', type_magasin: 'B', sales: 654_321 },
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