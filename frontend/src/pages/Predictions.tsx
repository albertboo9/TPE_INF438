import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Calendar, CalendarDays, Megaphone, Droplets, Store, Tag, Sun,
  History, BarChart3, Package, TimerReset, LucideIcon, AlertCircle, ShoppingCart,
  Sparkles, Zap, Lightbulb, ArrowUpCircle, ArrowDownCircle, DollarSign,
  HelpCircle, RefreshCw, GitCompare, CheckCircle2,
} from 'lucide-react';
import { BentoCard } from '../components/layout/BentoCard';
import { apiClient, AnalyticsFilters } from '../services/api';
import {
  PredictV2Request, PredictV2Response, CalendarInfo, OilPriceInfo,
} from '../types';

// ─── Catégories de produits (familles du dataset) ───
const FAMILLES = [
  'DAIRY', 'BEVERAGES', 'MEAT', 'GROCERY', 'BREAD/BAKERY', 'PRODUCE',
  'DELI', 'FROZEN FOODS', 'CLEANING', 'PERSONAL CARE', 'BABY CARE',
  'PET SUPPLIES', 'HOME CARE', 'ELECTRONICS', 'CLOTHING', 'BOOKS'
];

interface PredictionsProps { filters: AnalyticsFilters; }

export const Predictions: React.FC<PredictionsProps> = () => {
  // ─── State V2 (nouveau modèle métier) ───
  const [mode, setMode] = useState<'v1' | 'v2'>('v2');
  const [numeroMagasin, setNumeroMagasin] = useState('MAG_001');
  const [numeroProduit, setNumeroProduit] = useState('PROD_001');
  const [famille, setFamille] = useState('DAIRY');
  const [ventesVeilleProduit, setVentesVeilleProduit] = useState(150);
  const [moyenne7jProduit, setMoyenne7jProduit] = useState(130);
  const [estPerissable, setEstPerissable] = useState(1);
  const [indicateurPromotion, setIndicateurPromotion] = useState(0);
  const [prixPetrole, setPrixPetrole] = useState(80);
  const [prixPetroleAuto, setPrixPetroleAuto] = useState(true);

  // ─── Calendar & Oil Price ───
  const [calendarInfo, setCalendarInfo] = useState<CalendarInfo | null>(null);
  const [oilPriceInfo, setOilPriceInfo] = useState<OilPriceInfo | null>(null);

  // ─── Résultats ───
  const [prediction, setPrediction] = useState<PredictV2Response | null>(null);
  const [comparaison, setComparaison] = useState<{
    sansPromo: PredictV2Response | null;
    avecPromo: PredictV2Response | null;
  }>({ sansPromo: null, avecPromo: null });
  const [isPredicting, setIsPredicting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Charger calendrier et prix pétrole ───
  useEffect(() => {
    apiClient.getCalendarInfo().then(setCalendarInfo).catch(() => {});
    apiClient.getOilPrice().then(info => {
      setOilPriceInfo(info);
      if (prixPetroleAuto) setPrixPetrole(info.prix_petrole);
    }).catch(() => {});
  }, []);

  // ─── Prédiction V2 ───
  const fairePredictionV2 = useCallback(async (
    promoStatus: number,
    petrole: number,
  ): Promise<PredictV2Response> => {
    const data: PredictV2Request = {
      numero_magasin: numeroMagasin,
      numero_produit: numeroProduit,
      famille,
      est_perissable: estPerissable,
      indicateur_promotion: promoStatus,
      prix_petrole: petrole,
      ventes_veille_produit: ventesVeilleProduit,
      moyenne_7j_produit: moyenne7jProduit,
    };
    return apiClient.predictSalesV2(data);
  }, [numeroMagasin, numeroProduit, famille, estPerissable, ventesVeilleProduit, moyenne7jProduit]);

  // ─── Lancer prédiction ───
  const handlePredict = async () => {
    setIsPredicting(true);
    setError(null);
    try {
      const res = await fairePredictionV2(indicateurPromotion, prixPetrole);
      setPrediction(res);
      // Comparaison promo
      setIsComparing(true);
      const [sansPromo, avecPromo] = await Promise.all([
        fairePredictionV2(0, prixPetrole),
        fairePredictionV2(1, prixPetrole),
      ]);
      setComparaison({ sansPromo, avecPromo });
    } catch (e: any) {
      setError(e.message || 'Erreur prédiction');
    } finally {
      setIsPredicting(false);
      setIsComparing(false);
    }
  };

  // ─── Recommandations ───
  const recommandations = prediction ? [
    {
      icone: TrendingUp,
      titre: 'Prévision de Ventes',
      desc: `J+45 (${calendarInfo?.jplus45 || 'N/A'}) : ${Math.round(prediction.prediction)} unités de ${numeroProduit} prévues dans ${numeroMagasin}`,
      couleur: 'text-brand-500',
    },
    {
      icone: comparaison.avecPromo && comparaison.sansPromo
        ? (comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15 ? Megaphone : HelpCircle)
        : HelpCircle,
      titre: 'Impact Promotion',
      desc: comparaison.avecPromo && comparaison.sansPromo
        ? `Avec promo : ${Math.round(comparaison.avecPromo.prediction)} unités (${Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%)`
        : 'Calculez avec/sans promo pour voir l\'impact',
      couleur: comparaison.avecPromo && comparaison.sansPromo
        && comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
        ? 'text-emerald-500' : 'text-amber-500',
    },
    {
      icone: Calendar,
      titre: 'Calendrier J+45',
      desc: calendarInfo
        ? `Le ${calendarInfo.jplus45} (${calendarInfo.jour_semaine_jplus45}) — ${calendarInfo.saison_jplus45}${calendarInfo.est_weekend_jplus45 ? ' — WEEK-END' : ''}`
        : 'Chargement...',
      couleur: 'text-sky-500',
    },
    {
      icone: DollarSign,
      titre: 'Prix du Pétrole',
      desc: oilPriceInfo
        ? `$${oilPriceInfo.prix_petrole} le baril (${oilPriceInfo.source})`
        : 'Chargement...',
      couleur: 'text-amber-500',
    },
  ] : [];

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Prévisions Décisionnelles</h1>
        <p className="text-sm text-on-surface-variant">
          Modèle prédictif Random Forest — Horizon J+45 · Agrégation Bottom-to-Up
        </p>
      </div>

      {/* ── Grille principale : Paramètres + Résultat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ═══ COLONNE 1 : PARAMÈTRES PRODUIT ═══ */}
        <BentoCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Package className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Produit & Contexte</span>
          </div>

          {/* Magasin */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              <Store className="w-3.5 h-3.5" />Magasin
            </div>
            <select value={numeroMagasin} onChange={e => setNumeroMagasin(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium">
              {Array.from({ length: 54 }, (_, i) => `MAG_${String(i + 1).padStart(3, '0')}`).map(m =>
                <option key={m} value={m}>{m}</option>
              )}
            </select>
          </div>

          {/* Produit */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />Produit
            </div>
            <input type="text" value={numeroProduit}
              onChange={e => setNumeroProduit(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-500"
              placeholder="PROD_001" />
          </div>

          {/* Famille */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />Famille
            </div>
            <select value={famille} onChange={e => setFamille(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium">
              {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Périssable */}
          <button onClick={() => setEstPerissable(estPerissable === 1 ? 0 : 1)}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all text-left ${
              estPerissable === 1
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                : 'bg-black/5 dark:bg-white/5 border-transparent text-on-surface-variant'
            }`}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />Produit Périssable
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${
              estPerissable === 1 ? 'bg-rose-500' : 'bg-black/20 dark:bg-white/20'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                estPerissable === 1 ? 'translate-x-4' : ''
              }`} />
            </div>
          </button>
        </BentoCard>

        {/* ═══ COLONNE 2 : HISTORIQUE & PROMO ═══ */}
        <BentoCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <History className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Données Produit</span>
          </div>

          {/* Ventes veille */}
          <SliderInput label="Ventes Hier" icon={History} val={ventesVeilleProduit}
            set={setVentesVeilleProduit} min={0} max={2000} step={1} unit="unités" />

          {/* Moyenne 7j */}
          <SliderInput label="Moyenne 7 jours" icon={TimerReset} val={moyenne7jProduit}
            set={setMoyenne7jProduit} min={0} max={2000} step={1} unit="unités" />

          {/* Prix pétrole */}
          <div className="flex items-center gap-2 mt-2">
            <SliderInput label={`Prix Pétrole${prixPetroleAuto ? ' (auto)' : ''}`}
              icon={Droplets} val={prixPetrole}
              set={v => { setPrixPetrole(v); setPrixPetroleAuto(false); }}
              min={20} max={200} step={0.5} unit="$/bbl" />
            <button onClick={() => {
              setPrixPetroleAuto(true);
              if (oilPriceInfo) setPrixPetrole(oilPriceInfo.prix_petrole);
            }}
              className={`flex-shrink-0 p-2 rounded-xl border transition-all ${
                prixPetroleAuto ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' : 'bg-black/5 dark:bg-white/5 border-transparent text-on-surface-variant'
              }`}
              title="Prix automatique">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bouton Promotion */}
          <button onClick={() => setIndicateurPromotion(indicateurPromotion === 1 ? 0 : 1)}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all text-left ${
              indicateurPromotion === 1
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-black/5 dark:bg-white/5 border-transparent text-on-surface-variant hover:bg-black/10'
            }`}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
              <Megaphone className="w-4 h-4" />Promotion Active
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${
              indicateurPromotion === 1 ? 'bg-amber-500' : 'bg-black/20 dark:bg-white/20'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                indicateurPromotion === 1 ? 'translate-x-4' : ''
              }`} />
            </div>
          </button>

          {/* Bouton Prédire */}
          <button onClick={handlePredict} disabled={isPredicting}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600
              disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all">
            {isPredicting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calcul...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Prédire J+45</>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}
        </BentoCard>

        {/* ═══ COLONNE 3 : RÉSULTAT & RECOMMANDATIONS ═══ */}
        <BentoCard gradientHighlight className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Lightbulb className="w-4 h-4 text-brand-300" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              Résultat & Recommandations
            </span>
          </div>

          {!prediction ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/40">
              <Sparkles className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium text-center">
                Configurez les paramètres et lancez la prédiction
              </p>
            </div>
          ) : (
            <>
              {/* Résultat principal */}
              <div className="text-center py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                  Prédiction J+45 · {calendarInfo?.jplus45 || '...'}
                </div>
                <div className="text-5xl font-black tracking-tighter text-white">
                  {Math.round(prediction.prediction).toLocaleString('fr-FR')}
                  <span className="text-lg font-normal text-white/60 ml-2">unités</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    prediction.source === 'ml_api_v2' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {prediction.source}
                  </span>
                  <span className="text-[10px] text-white/40">{prediction.model}</span>
                </div>
              </div>

              {/* Comparaison promo */}
              {comparaison.sansPromo && comparaison.avecPromo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Sans Promo</div>
                    <div className="text-xl font-bold text-white">{Math.round(comparaison.sansPromo.prediction)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">Avec Promo</div>
                    <div className="text-xl font-bold text-amber-400">{Math.round(comparaison.avecPromo.prediction)}</div>
                    {comparaison.sansPromo.prediction > 0 && (
                      <div className="text-[11px] font-bold text-emerald-400 mt-1">
                        +{Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommandations */}
              <div className="space-y-2 mt-2">
                {recommandations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <r.icone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${r.couleur}`} />
                    <div>
                      <div className="text-[11px] font-bold text-white/80">{r.titre}</div>
                      <div className="text-[10px] text-white/50 leading-relaxed">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </BentoCard>
      </div>

      {/* ── ANALYSE DÉCISIONNELLE (quand la prédiction est prête) ── */}
      {prediction && comparaison.sansPromo && comparaison.avecPromo && (
        <BentoCard>
          <div className="flex items-center gap-2 pb-4 border-b border-black/5 dark:border-white/5 mb-4">
            <GitCompare className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Analyse Décisionnelle</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Carte 1 : Stock */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Stock Recommandé</span>
              </div>
              <div className="text-2xl font-black text-on-surface">
                {Math.round(comparaison.avecPromo.prediction * 1.3)}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Commander <strong>{Math.round(comparaison.avecPromo.prediction * 1.3)} unités</strong> de {numeroProduit} pour le {calendarInfo?.jplus45} (marge de sécurité 30%)
              </p>
            </div>

            {/* Carte 2 : Promo */}
            <div className={`p-4 rounded-xl border ${
              comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
                ? 'bg-amber-500/5 border-amber-500/10'
                : 'bg-sky-500/5 border-sky-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className={`w-4 h-4 ${
                  comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
                    ? 'text-amber-500' : 'text-sky-500'
                }`} />
                <span className="text-[11px] font-bold uppercase tracking-widest ${
                  comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
                    ? 'text-amber-500' : 'text-sky-500'
                }">Stratégie Promo</span>
              </div>
              {comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15 ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <ArrowUpCircle className="w-4 h-4" /> Recommandé
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Activer la promotion : <strong>{Math.round((comparaison.avecPromo.prediction - comparaison.sansPromo.prediction))} unités supplémentaires</strong> attendues ({Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}% d'augmentation)
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sky-500 font-bold text-sm">
                    <ArrowDownCircle className="w-4 h-4" /> Non recommandé
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    La promotion n'augmente pas assez les ventes (moins de 15% de gain) pour justifier la réduction de marge
                  </p>
                </>
              )}
            </div>

            {/* Carte 3 : Rentabilité */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="text-[11px] font-bold text-purple-500 uppercase tracking-widest">Rentabilité</span>
              </div>
              <div className="text-2xl font-black text-on-surface">
                {Math.round(prediction.prediction * 12.5).toLocaleString('fr-FR')}
                <span className="text-sm font-normal text-on-surface-variant ml-1">FCFA</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Chiffre d'affaires estimé pour {numeroProduit} à J+45 (prix moyen 12,5 FCFA/unité)
              </p>
            </div>
          </div>
        </BentoCard>
      )}
    </div>
  );
};

// ─── Composants réutilisables ───

const SliderInput = ({ label, icon: Icon, val, set, min, max, step, unit }: {
  label: string; icon: LucideIcon; val: number; set: (v: number) => void;
  min: number; max: number; step: number; unit: string;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
        <Icon className="w-3.5 h-3.5" />{label}
      </div>
      <span className="text-[11px] font-bold text-brand-500">{val} {unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={val}
      onChange={e => set(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500
        bg-black/10 dark:bg-white/10" />
  </div>
);

export default Predictions;