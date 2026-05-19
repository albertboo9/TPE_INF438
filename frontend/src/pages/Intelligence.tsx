import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { 
  useTopProducts, 
  useCityPerformance, 
  usePromotionImpact 
} from '../hooks/useAnalytics';
import { AnalyticsFilters } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

interface IntelligenceProps {
  filters: AnalyticsFilters;
}

const COLORS = ['#8069BF', '#6366f1', '#10b981', '#C9A74D', '#f43f5e'];

export const Intelligence: React.FC<IntelligenceProps> = ({ filters }) => {
  // Live analytical queries with caching & auto-refetching
  const { data: productData = [], isLoading: isProductLoading } = useTopProducts(filters);
  const { data: cityData = [], isLoading: isCityLoading } = useCityPerformance(filters);
  const { data: promoData = [], isLoading: isPromoLoading } = usePromotionImpact(filters);

  // Formatting city data for Recharts Bar Chart
  const formattedCity = cityData.slice(0, 5).map((d: any) => ({
    city: d.city || 'Quito',
    sales: Number(d.unitSales || d.totalSales || 0)
  }));

  // Formatting promo data for Recharts Bar Chart
  const formattedPromo = promoData.slice(0, 5).map((d: any) => ({
    category: d.family || 'Produce',
    promoSales: Number(d.promotedSales || 0),
    regularSales: Number(d.nonPromotedSales || d.totalSales || 0)
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="font-label-caps text-primary tracking-widest text-[10px] uppercase font-bold block mb-1">
            Store & Product Performance
          </span>
          <h2 className="font-h1 text-on-background text-3xl font-black tracking-tight">Market Intelligence</h2>
        </div>
      </header>

      {/* Grid: SKU Catalog Table */}
      <section className="grid grid-cols-12 gap-6" id="tour-sku-catalog">
        <GlassCard className="col-span-12 p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border dark:border-[#2b2735] pb-4">
            <div>
              <h3 className="font-h2 text-on-surface text-lg font-bold">Catalog SKU Performance</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Suivi détaillé de la vitesse de vente et du taux de promotion par code produit.
              </p>
            </div>
            
            <div className="flex gap-2 text-xs font-semibold">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                Active Items: {productData.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isProductLoading ? (
              <SkeletonLoader type="list" className="w-full h-56" />
            ) : productData.length === 0 ? (
              <p className="text-xs text-outline text-center py-12 uppercase font-label-caps">No sku items found in warehouse</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-border dark:border-[#2b2735] pb-2 font-bold">
                    <th className="py-2">SKU #</th>
                    <th className="py-2">Family</th>
                    <th className="py-2 text-right">Unit Sales Volume</th>
                    <th className="py-2 text-right">Promotion Frequency</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 dark:divide-[#2b2735]/30">
                  {productData.slice(0, 8).map((sku: any, index: number) => {
                    const salesVolume = Number(sku.unitSales || sku.totalSales || 0);
                    const isHighVelocity = salesVolume > 20000;
                    return (
                      <tr key={index} className="hover:bg-primary/5 transition-colors">
                        <td className="py-3 font-mono-data text-primary font-bold">#IT-{sku.item_nbr || (3000 + index)}</td>
                        <td className="py-3 font-bold text-on-surface">{sku.family || 'Fresh Produce'}</td>
                        <td className="py-3 text-right font-mono-data font-bold">
                          {salesVolume.toLocaleString('fr-FR')}
                        </td>
                        <td className="py-3 text-right font-mono-data">
                          {((sku.onPromotionRatio || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            isHighVelocity 
                              ? 'bg-emerald-ai/10 text-emerald-ai' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {isHighVelocity ? 'HIGH VELOCITY' : 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </section>

      {/* Grid: City distribution & Promo impact */}
      <section className="grid grid-cols-12 gap-6" id="tour-geographic">
        {/* Left Side: Dynamic City comparison chart */}
        <GlassCard className="col-span-12 lg:col-span-6 p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="font-h2 text-on-surface text-md font-bold mb-1">Analyse Géographique</h3>
            <p className="text-xs text-on-surface-variant">Comparatif des volumes de vente par nœud urbain principal (Quito, Guayaquil, etc.).</p>
          </div>

          <div className="w-full h-64 mt-4">
            {isCityLoading ? (
              <SkeletonLoader type="chart" className="w-full h-full" />
            ) : formattedCity.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-outline text-xs">No city data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline/10" />
                  <XAxis dataKey="city" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                    {formattedCity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Right Side: Promotion comparison chart */}
        <GlassCard className="col-span-12 lg:col-span-6 p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="font-h2 text-on-surface text-md font-bold mb-1">Impact des Campagnes</h3>
            <p className="text-xs text-on-surface-variant">Performance des articles en promotion par rapport aux ventes courantes.</p>
          </div>

          <div className="w-full h-64 mt-4">
            {isPromoLoading ? (
              <SkeletonLoader type="chart" className="w-full h-full" />
            ) : formattedPromo.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-outline text-xs">No promotion impact metrics</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedPromo}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline/10" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 600 }} className="text-outline" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600 }} className="text-outline" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                  <Bar dataKey="promoSales" name="Unités en Promotion" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="regularSales" name="Ventes Régulières" fill="var(--color-electric-indigo)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Intelligence;