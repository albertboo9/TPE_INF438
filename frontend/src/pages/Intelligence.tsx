import React from 'react';
import { BentoCard } from '../components/layout/BentoCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useTopProducts, useCityPerformance, usePromotionImpact } from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, Line,
} from 'recharts';
import { Database, Map, Megaphone, CheckCircle2, AlertTriangle } from 'lucide-react';

interface IntelligenceProps { filters: AnalyticsFilters; }

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];

export const Intelligence: React.FC<IntelligenceProps> = ({ filters }) => {
  const { data: productData = [], isLoading: isProductLoading } = useTopProducts(filters);
  const { data: cityData = [],   isLoading: isCityLoading   } = useCityPerformance(filters);
  const { data: promoData = [],  isLoading: isPromoLoading  } = usePromotionImpact(filters);

  const formattedCity = cityData.slice(0, 6).map((d: any) => ({
    city:  d.city  || d.ville  || 'N/A',
    sales: Number(d.unitSales || d.total_sales || d.sales || 0),
  }));

  const formattedPromo = promoData.slice(0, 5).map((d: any) => ({
    category:    d.family || d.categorie_groupe || 'Autre',
    promoSales:  Number(d.promotedSales  || d.promo_sales  || 0),
    regularSales: Number(d.nonPromotedSales || d.total_sales || 0),
  }));

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Market Intelligence</h1>
        <p className="text-sm text-on-surface-variant">Analyse SKU, géographie et impact promotionnel.</p>
      </div>

      {/* SKU Catalog — full width */}
      <BentoCard noPadding className="w-full overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Base SKU</span>
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
            {productData.length} articles
          </span>
        </div>

        {isProductLoading ? (
          <div className="p-5"><SkeletonLoader type="list" /></div>
        ) : productData.length === 0 ? (
          <p className="text-center py-12 text-[11px] uppercase tracking-widest text-on-surface-variant/50">Aucune donnée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3 px-5">ID Article</th>
                  <th className="py-3 px-5">Famille</th>
                  <th className="py-3 px-5 text-right">Volume Ventes</th>
                  <th className="py-3 px-5 text-right">Taux Promo</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {productData.slice(0, 8).map((sku: any, i: number) => {
                  const vol = Number(sku.unitSales || sku.total_sales || sku.sales || 0);
                  const fast = vol > 20000;
                  return (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        #SKU-{sku.item_id || sku.item_nbr || (3000 + i)}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium">{sku.family || sku.categorie_groupe || 'Épicerie'}</td>
                      <td className="py-3 px-5 text-right font-mono text-xs">{vol.toLocaleString('fr-FR')}</td>
                      <td className="py-3 px-5 text-right text-xs">{((sku.onPromotionRatio || sku.share || 0) * 100).toFixed(1)}%</td>
                      <td className="py-3 px-5 text-center">
                        {fast ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Rapide
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
        )}
      </BentoCard>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* City chart */}
        <BentoCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Répartition Géographique</span>
          </div>
          <div className="h-64 w-full">
            {isCityLoading ? <SkeletonLoader type="chart" /> : formattedCity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-on-surface-variant/50">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                  <XAxis dataKey="city" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                    {formattedCity.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Promo chart */}
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
                      <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-black/5 dark:stroke-white/5" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 600 }} />
                  <YAxis yAxisId="l" orientation="left"  tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }} />
                  <Bar     yAxisId="l" dataKey="regularSales" name="Ventes Normales"  fill="#6366f1" opacity={0.5} radius={[4,4,0,0]} />
                  <Bar     yAxisId="l" dataKey="promoSales"   name="Ventes Promo"    fill="url(#gPromo)"    radius={[4,4,0,0]} />
                  <Line    yAxisId="r" dataKey="promoSales"   name="Tendance Promo"  stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} />
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