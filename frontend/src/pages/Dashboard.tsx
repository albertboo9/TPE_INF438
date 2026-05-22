import React, { useState } from 'react';
import { Card } from '../components/layout/GlassCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { OnboardingTour } from '../components/ui/OnboardingTour';
import { 
  useFullDashboard, useSalesTrend, useCategoryPerformance, useTopProducts,
  useSalesByDayOfWeek, useTopStores, useStoreTypeComparison,
  useCityPerformance, useHolidayEffect, usePromotionImpact, useInventoryInsights
} from '../hooks/useAnalytics';
import { apiClient, AnalyticsFilters } from '../services/api';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardProps { filters: AnalyticsFilters; }

const COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<string>('operations');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [isMlConnected, setIsMlConnected] = useState(false);
  const [simulatedSales, setSimulatedSales] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // ML inputs
  const [ventesVeille, setVentesVeille] = useState(1450);
  const [moyenneVentes7j, setMoyenneVentes7j] = useState(1480);
  const [estWeekend, setEstWeekend] = useState(0);
  const [estJourFerie, setEstJourFerie] = useState(0);
  const [indicateurPromotion, setIndicateurPromotion] = useState(1);
  const [prixPetrole, setPrixPetrole] = useState(75.4);
  const [magasinVec, setMagasinVec] = useState(3);
  const [saisonVec, setSaisonVec] = useState(0.2);

  const { data: dd, isLoading: ld } = useFullDashboard(filters);
  const { data: trend = [], isLoading: lt } = useSalesTrend(filters);
  const { data: cat = [], isLoading: lc } = useCategoryPerformance(filters);
  const { data: sku = [], isLoading: ls } = useTopProducts(filters);
  const { data: city = [], isLoading: lcy } = useCityPerformance(filters);
  const { data: stores = [], isLoading: lst } = useTopStores(filters);
  const { data: types = [], isLoading: ltp } = useStoreTypeComparison(filters);
  const { data: days = [], isLoading: ldy } = useSalesByDayOfWeek(filters);
  const { data: holiday = [], isLoading: lh } = useHolidayEffect(filters);
  const { data: promo = [], isLoading: lp } = usePromotionImpact(filters);
  const { data: inventory = [], isLoading: li } = useInventoryInsights(filters);

  const triggerSimulation = async () => {
    setIsSimulating(true);
    try {
      if (isMlConnected) {
        const r = await apiClient.predictSales({
          magasin_index: 3, famille_index: 1, saison_index: Number(saisonVec),
          ventes_veille: Number(ventesVeille), moyenne_ventes_7j: Number(moyenneVentes7j),
          est_weekend: Number(estWeekend), est_jour_ferie: Number(estJourFerie),
          indicateur_promotion: Number(indicateurPromotion), prix_petrole: Number(prixPetrole),
          nb_transactions: 100, ventes_veille_produit: 10, moyenne_7j_produit: 10, est_perissable: 0,
        });
        setSimulatedSales(r.prediction);
      } else {
        setTimeout(() => {
          setSimulatedSales((ventesVeille * 0.45 + moyenneVentes7j * 0.55) * (1 + indicateurPromotion * 0.18) * (1 - estWeekend * 0.04) * (1 + estJourFerie * 0.22));
          setIsSimulating(false);
        }, 300);
        return;
      }
    } catch { setSimulatedSales((ventesVeille * 0.45 + moyenneVentes7j * 0.55) * (1 + indicateurPromotion * 0.15)); }
    finally { if (isMlConnected) setIsSimulating(false); }
  };

  React.useEffect(() => { triggerSimulation(); }, [ventesVeille, moyenneVentes7j, estWeekend, estJourFerie, indicateurPromotion, prixPetrole, isMlConnected]);

  const fmtDays = days.map((d: any) => ({
    day: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][Number(d.jour_semaine) - 1] || 'Dim',
    sales: Number(d.total_sales || d.unitSales || d.sales || 0)
  }));

  const tabs = [
    { id: 'operations', label: 'Opérations' },
    { id: 'geographic', label: 'Géographique' },
    { id: 'campaigns', label: 'Marketing' },
    { id: 'predictive', label: 'ML' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ld ? Array.from({length:4}).map((_,i) => <SkeletonLoader key={i} type="card" />) : (
          <>
            <Card className="flex flex-col gap-1">
              <span className="kpi-label">Ventes Totales</span>
              <span className="kpi-value">{dd?.totalSales ? Number(dd.totalSales).toLocaleString('fr-FR') : '---'}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">+12.4%</span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="kpi-label">Taux Promo</span>
              <span className="kpi-value">{dd?.promotedSalesRatio ? Number(dd.promotedSalesRatio).toFixed(1) : '8.4'}%</span>
              <span className="text-[10px] text-on-surface-variant">Objectif 10%</span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="kpi-label">Magasins Actifs</span>
              <span className="kpi-value">{dd?.activeStoresCount || 54}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% en ligne</span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="kpi-label">Moyenne/Magasin</span>
              <span className="kpi-value">{dd?.averageSalesPerStore ? Number(dd.averageSalesPerStore).toFixed(1) : '---'}</span>
              <span className="text-[10px] text-on-surface-variant">Index sécurité</span>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-variant rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id ? 'bg-surface text-on-background shadow-soft' : 'text-on-surface-variant hover:text-on-surface'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Operations */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <span className="section-title">Tendance des Ventes</span>
              <div className="flex gap-0.5 p-0.5 bg-surface-variant rounded-lg">
                {(['area', 'line', 'bar'] as const).map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${chartType === t ? 'bg-surface text-on-background shadow-soft' : 'text-on-surface-variant'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-56">
              {lt ? <SkeletonLoader type="chart" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={trend.map((d: any) => ({ date: d.mois ? `${d.annee}-${String(d.mois).padStart(2,'0')}` : '', sales: Number(d.total_sales||d.sales||0) }))}>
                      <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} axisLine={false} className="text-on-surface-variant" />
                      <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} className="text-on-surface-variant" />
                      <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                      <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fill="url(#c)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={trend.map((d: any) => ({ date: d.mois ? `${d.annee}-${String(d.mois).padStart(2,'0')}` : '', sales: Number(d.total_sales||d.sales||0) }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                      <Bar dataKey="sales" fill="#8b5cf6" radius={[4,4,0,0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="col-span-12 lg:col-span-5">
            <span className="section-title mb-3 block">Catégories</span>
            <div className="h-56">
              {lc ? <SkeletonLoader type="chart" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cat.slice(0,5).map((d:any) => ({ name: d.categorie_groupe||d.family||'Autre', value: Number(d.totalSales||d.unitSales||0) }))} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {cat.slice(0,5).map((_:any,i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                    <Legend wrapperStyle={{fontSize:10}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="col-span-12">
            <span className="section-title mb-3 block">Top Produits</span>
            {ls ? <SkeletonLoader type="list" /> : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-on-surface-variant border-b border-border">
                    <th className="py-2 text-left font-medium">SKU</th>
                    <th className="py-2 text-left font-medium">Famille</th>
                    <th className="py-2 text-right font-medium">Volume</th>
                    <th className="py-2 text-right font-medium">Promo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sku.slice(0,5).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-surface-variant/50 transition-colors">
                      <td className="py-2.5 font-mono text-brand-600 font-medium">#{s.item_nbr || (1000+i)}</td>
                      <td className="py-2.5">{s.family || 'Produce'}</td>
                      <td className="py-2.5 text-right font-medium">{Number(s.total_sales||s.unitSales||0).toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 text-right">
                        <span className={s.onPromotionRatio > 0 ? 'badge-emerald' : 'badge-neutral'}>
                          {s.onPromotionRatio > 0 ? 'Oui' : 'Non'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Geographic */}
      {activeTab === 'geographic' && (
        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-12 lg:col-span-6">
            <span className="section-title mb-3 block">Performance par Ville</span>
            <div className="h-64">
              {lcy ? <SkeletonLoader type="chart" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={city.slice(0,5).map((d:any) => ({ city: d.ville||d.city||'N/A', sales: Number(d.total_sales||d.unitSales||0) }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="city" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                    <Bar dataKey="sales" radius={[4,4,0,0]}>
                      {city.slice(0,5).map((_:any,i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="col-span-12 lg:col-span-6">
            <span className="section-title mb-3 block">Top Magasins</span>
            {lst ? <SkeletonLoader type="list" /> : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-on-surface-variant border-b border-border">
                    <th className="py-2 text-left font-medium">Magasin</th>
                    <th className="py-2 text-left font-medium">Ville</th>
                    <th className="py-2 text-right font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stores.slice(0,5).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-surface-variant/50">
                      <td className="py-2.5 text-brand-600 font-medium">Store #{s.store_nbr || (i+1)}</td>
                      <td className="py-2.5">{s.ville || s.city || 'Quito'}</td>
                      <td className="py-2.5 text-right font-medium">{Number(s.total_sales||s.unitSales||0).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Marketing */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-12 lg:col-span-7">
            <span className="section-title mb-3 block">Impact Promotions</span>
            <div className="h-56">
              {lp ? <SkeletonLoader type="chart" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={promo.map((d:any) => ({ name: d.en_promotion ? 'Promo' : 'Normal', sales: Number(d.total_sales||0) }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                    <Bar dataKey="sales" radius={[4,4,0,0]}>
                      {promo.map((_:any,i:number) => <Cell key={i} fill={[COLORS[2], COLORS[4]][i%2]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="col-span-12 lg:col-span-5">
            <span className="section-title mb-3 block">Ventes par Jour</span>
            <div className="h-56">
              {ldy ? <SkeletonLoader type="chart" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fmtDays}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="day" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'12px'}} />
                    <Bar dataKey="sales" radius={[4,4,0,0]}>
                      {fmtDays.map((_:any,i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: ML */}
      {activeTab === 'predictive' && (
        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <span className="section-title">Simulation ML</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant">Live</span>
                <button onClick={() => setIsMlConnected(!isMlConnected)} className={`w-7 h-3.5 rounded-full relative transition-colors ${isMlConnected ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                  <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[2px] transition-all ${isMlConnected ? 'left-[15px]' : 'left-[2px]'}`} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-medium text-on-surface-variant">Ventes Veille</label>
                <input type="range" min="0" max="8000" step="50" value={ventesVeille} onChange={e => setVentesVeille(Number(e.target.value))} className="w-full accent-brand-500 h-1 rounded-full mt-1" />
                <span className="text-xs font-mono text-brand-600">{ventesVeille}</span>
              </div>
              <div>
                <label className="text-[10px] font-medium text-on-surface-variant">Moyenne 7j</label>
                <input type="range" min="0" max="8000" step="50" value={moyenneVentes7j} onChange={e => setMoyenneVentes7j(Number(e.target.value))} className="w-full accent-brand-500 h-1 rounded-full mt-1" />
                <span className="text-xs font-mono text-brand-600">{moyenneVentes7j}</span>
              </div>
              <div>
                <label className="text-[10px] font-medium text-on-surface-variant">Prix Pétrole ($)</label>
                <input type="range" min="10" max="140" step="0.5" value={prixPetrole} onChange={e => setPrixPetrole(Number(e.target.value))} className="w-full accent-brand-500 h-1 rounded-full mt-1" />
                <span className="text-xs font-mono text-brand-600">${prixPetrole.toFixed(1)}</span>
              </div>
              <div className="flex gap-2 items-end">
                {[
                  { label: 'Promo', active: indicateurPromotion, set: setIndicateurPromotion },
                  { label: 'Week-end', active: estWeekend, set: setEstWeekend },
                  { label: 'Férié', active: estJourFerie, set: setEstJourFerie },
                ].map(b => (
                  <button key={b.label} onClick={() => b.set(b.active ? 0 : 1)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      b.active ? 'bg-brand-500 text-white' : 'bg-surface-variant text-on-surface-variant'
                    }`}>{b.label}</button>
                ))}
              </div>
            </div>
          </Card>
          <Card className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center gap-2 py-8">
            {isSimulating && <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />}
            {!isSimulating && (
              <>
                <span className="section-title">Prédiction</span>
                <span className="text-4xl font-black tracking-tight text-brand-500">
                  {simulatedSales !== null ? Math.round(simulatedSales).toLocaleString('fr-FR') : '---'}
                </span>
                <span className="text-xs text-on-surface-variant">unités estimées</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isMlConnected ? 'badge-emerald' : 'badge-amber'}`}>
                  {isMlConnected ? 'Cloud' : 'Local'}
                </span>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;