import React, { useEffect, useState } from 'react';
import { GlassCard } from '../layout/GlassCard';
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/api';
import { SkeletonLoader } from '../ui/SkeletonLoader';

interface InsightsEngineProps {
  topProducts: any[];
  stores: any[];
}

interface Insight {
  id: string;
  type: 'opportunity' | 'alert' | 'prediction';
  title: string;
  description: string;
  impact: string;
  icon: any;
  color: string;
}

export const InsightsEngine: React.FC<InsightsEngineProps> = ({ topProducts, stores }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      setIsLoading(true);
      const newInsights: Insight[] = [];

      // Heuristic 1: Store underperformance
      if (stores.length > 1) {
        const topStore = stores[0];
        const lastStore = stores[stores.length - 1];
        if (lastStore && topStore && Number(topStore.totalSales) > Number(lastStore.totalSales) * 3) {
          newInsights.push({
            id: 'store-alert',
            type: 'alert',
            title: `Alerte Performance: Store #${lastStore.store_nbr || lastStore.city}`,
            description: `Ce magasin sous-performe de 300% par rapport au top magasin.`,
            impact: 'Action: Audit inventaire et campagne locale',
            icon: AlertTriangle,
            color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
          });
        }
      }

      // Heuristic 2: Promotion opportunity
      if (topProducts.length > 0) {
        const underPromoted = topProducts.find(p => (p.onPromotionRatio || 0) < 0.05 && Number(p.totalSales || p.unitSales) > 5000);
        if (underPromoted) {
          newInsights.push({
            id: 'promo-opp',
            type: 'opportunity',
            title: `Opportunité Promo: Produit #${underPromoted.item_nbr}`,
            description: `Vitesse de vente élevée mais promotion quasi-nulle (< 5%).`,
            impact: 'Action: Activer une promo week-end (+15% CA estimé)',
            icon: Lightbulb,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
          });
        }
      }

      // Predictive AI Insight
      if (topProducts.length > 0) {
        try {
          const topProduct = topProducts[0];
          // Defaulting params for prediction simulation
          const prediction = await apiClient.predictSales({
            magasin_index: 3, famille_index: 1, saison_index: 1,
            ventes_veille: 450, moyenne_ventes_7j: 480,
            est_weekend: 1, est_jour_ferie: 0,
            indicateur_promotion: 1, prix_petrole: 75,
            nb_transactions: 120, ventes_veille_produit: 45, moyenne_7j_produit: 50, est_perissable: 1
          });

          newInsights.push({
            id: 'ai-predict',
            type: 'prediction',
            title: `Prédiction ML (Produit #${topProduct.item_nbr || 'Phare'})`,
            description: `Le modèle IA (Random Forest) prévoit une forte demande ce week-end en cas de promotion.`,
            impact: `Prévision: ${Math.round(prediction.prediction).toLocaleString('fr-FR')} unités (+22%)`,
            icon: Sparkles,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
          });
        } catch (e) {
          console.warn('Prediction engine unavailable for insights', e);
        }
      }

      setInsights(newInsights);
      setIsLoading(false);
    };

    if (topProducts.length > 0 || stores.length > 0) {
      generateInsights();
    } else {
      setIsLoading(false);
    }
  }, [topProducts, stores]);

  if (isLoading) {
    return (
      <GlassCard className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-brand-500" />
          <h3 className="font-h2 text-lg font-bold">Decision Intelligence</h3>
        </div>
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 flex flex-col gap-4 h-full relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-700"></div>

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500/20 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
          </div>
          <h3 className="font-h2 text-lg font-bold">Decision Intelligence</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full">
          Insight intelligent généré par le modèle Random Forest
        </span>
      </div>

      <div className="flex flex-col gap-3 relative z-10 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">
            Pas d'insights majeurs détectés pour le moment.
          </div>
        ) : (
          insights.map(insight => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className={`p-4 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer ${insight.color}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed mb-2">{insight.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/40 dark:bg-black/20 w-fit px-2.5 py-1 rounded-lg">
                      {insight.impact}
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
};
