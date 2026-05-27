import React, { useState, useMemo } from 'react';
import { BentoCard } from '../components/layout/BentoCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useTopProducts, useCityPerformance, usePromotionImpact } from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import { 
  Database, Map, Megaphone, CheckCircle2, AlertTriangle, Search, 
  SlidersHorizontal, Grid3X3, List, Package, TrendingUp, Store,
  ChevronDown, Filter, ArrowUpDown, Sparkles, Tag, Layers, Eye,
  ShoppingBag, DollarSign, Clock,
} from 'lucide-react';

interface IntelligenceProps { filters: AnalyticsFilters; }

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#f97316'];
const FAMILLES = ['Toutes', 'DAIRY', 'BEVERAGES', 'MEAT', 'GROCERY', 'BREAD/BAKERY', 'PRODUCE', 'DELI', 'FROZEN FOODS', 'CLEANING', 'PERSONAL CARE', 'BABY CARE'];

const fmt = (v: number) => v.toLocaleString('fr-FR');

const TooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
};

export const Intelligence: React.FC<IntelligenceProps> = ({ filters }) => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [familleFilter, setFamilleFilter] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'volume' | 'name'>('volume');

  const { data: productData = [], isLoading: isProductLoading } = useTopProducts(filters);
  const { data: cityData = [],   isLoading: isCityLoading   } = useCityPerformance(filters);
  const { data: promoData = [],  isLoading: isPromoLoading  } = usePromotionImpact(filters);

  const formattedCity = cityData.slice(0, 6).map((d: any) => ({
    city:  d.city  || d.ville  || 'N/A',
    sales: Number(d.unitSales || d.total_sales || d.sales || 0),
  }));

  const formattedPromo = promoData.slice(0, 5).map((d: any) => ({
    category: d.family || d.categorie_groupe || 'Autre',
    promoSales: Number(d.promotedSales || d.promo_sales || 0),
    regularSales: Number(d.nonPromotedSales || d.total_sales || 0),
  }));

  // Filtrage et recherche
  const filteredProducts = useMemo(() => {
    let items = productData as any[];
    if (familleFilter !== 'Toutes') items = items.filter(p => (p.family || '').toUpperCase() === familleFilter);
    if (search) items = items.filter(p => 
      String(p.item_id || p.item_nbr || '').includes(search) ||
      (p.family || '').toLowerCase().includes(search.toLowerCase())
    );
    return items.sort((a, b) => {
      const aVol = Number(a.unitSales || a.total_sales || a.sales || 0);
      const bVol = Number(b.unitSales || b.total_sales || b.sales || 0);
      return sortBy === 'volume' ? bVol - aVol : String(a.item_id || '').localeCompare(String(b.item_id || ''));
    });
  }, [productData, search, familleFilter, sortBy]);

  // Radar data (stats globales)
  const radarData = useMemo(() => {
    const cats = (productData as any[]).slice(0, 8);
    const total = cats.reduce((s, c) => s + Number(c.unitSales || c.total_sales || c.sales || 0), 0);
    return cats.map(p => ({
      category: p.family || 'Autre',
      volume: total > 0 ? Math.round((Number(p.unitSales || p.total_sales || p.sales || 0) / total) * 100) : 0,
    }));
  }, [productData]);

  return (
    <div className="flex flex-col gap-6 pb-10 animate-fade-in">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Catalogue Produits</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/20">
              {filteredProducts.length} articles
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Analyse détaillée · Filtrage intelligent · Impact promotionnel
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
          <button onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'bg-white dark:bg-white/10 shadow' : ''}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-white dark:bg-white/10 shadow' : ''}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Barre de recherche & Filtres ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit (ID, famille...)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select value={familleFilter} onChange={e => setFamilleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer">
            {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button onClick={() => setSortBy(sortBy === 'volume' ? 'name' : 'volume')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface border border-border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === 'volume' ? 'Volume' : 'Nom'}
          </button>
        </div>
      </div>

      {/* ─── Grille / Liste Produits ─── */}
      {isProductLoading ? (
        <div className="p-5"><SkeletonLoader type="list" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/40">
          <Package className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-sm font-semibold">Aucun produit trouvé</p>
          <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.slice(0, 24).map((sku: any, i: number) => {
            const vol = Number(sku.unitSales || sku.total_sales || sku.sales || 0);
            const isTop = vol > 20000;
            return (
              <BentoCard key={i} className="group cursor-pointer hover:scale-[1.02] transition-all duration-200">
                <div className="flex flex-col gap-3">
                  {/* Icon & badge */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${isTop ? 'bg-emerald-500/10' : 'bg-brand-500/10'}`}>
                      <Package className={`w-5 h-5 ${isTop ? 'text-emerald-500' : 'text-brand-500'}`} />
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isTop ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {isTop ? 'Top vente' : 'Standard'}
                    </span>
                  </div>
                  {/* Infos */}
                  <div>
                    <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      #{sku.item_id || sku.item_nbr || (3000 + i)}
                    </div>
                    <div className="text-[11px] font-medium text-on-surface-variant mt-0.5">
                      {sku.family || sku.categorie_groupe || 'Épicerie'}
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                    <div>
                      <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Volume</div>
                      <div className="text-sm font-bold">{fmt(vol)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Promo</div>
                      <div className="text-sm font-bold text-amber-500">{((sku.onPromotionRatio || sku.share || 0) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            );
          })}
        </div>
      ) : (
        /* Vue liste */
        <BentoCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3 px-5">Produit</th>
                  <th className="py-3 px-5">Famille</th>
                  <th className="py-3 px-5 text-right">Volume</th>
                  <th className="py-3 px-5 text-right">Promo</th>
                  <th className="py-3 px-5 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {filteredProducts.slice(0, 12).map((sku: any, i: number) => {
                  const vol = Number(sku.unitSales || sku.total_sales || sku.sales || 0);
                  const fast = vol > 20000;
                  return (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        #{sku.item_id || sku.item_nbr || (3000 + i)}
                      </td>
                      <td className="py-3.5 px-5 text-xs font-medium">{sku.family || sku.categorie_groupe || 'Épicerie'}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-xs font-bold">{fmt(vol)}</td>
                      <td className="py-3.5 px-5 text-right text-xs">{((sku.onPromotionRatio || sku.share || 0) * 100).toFixed(1)}%</td>
                      <td className="py-3.5 px-5 text-center">
                        {fast ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Leader
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-600 uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Standard
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </BentoCard>
      )}

      {/* ─── Graphiques ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Radar des catégories */}
        <BentoCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Répartition Catégories</span>
          </div>
          <div className="h-64 w-full">
            {radarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/50">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-black/10 dark:stroke-white/10" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 8, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Volume" dataKey="volume" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Géographique */}
        <BentoCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Performance par Ville</span>
          </div>
          <div className="h-64 w-full">
            {isCityLoading ? <SkeletonLoader type="chart" /> : formattedCity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/50">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCity} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-black/5 dark:stroke-white/5" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                  <YAxis dataKey="city" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} width={80} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                    {formattedCity.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Impact Promo */}
        <BentoCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Impact Promotionnel</span>
          </div>
          <div className="h-64 w-full">
            {isPromoLoading ? <SkeletonLoader type="chart" /> : formattedPromo.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/50">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedPromo} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gPromo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }} />
                  <Bar dataKey="regularSales" name="Sans promo" fill="#6366f1" opacity={0.5} radius={[4,4,0,0]} />
                  <Bar dataKey="promoSales" name="Avec promo" fill="url(#gPromo)" radius={[4,4,0,0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  );
};

export default Intelligence;