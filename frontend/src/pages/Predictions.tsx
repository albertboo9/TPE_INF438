import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, Calendar, CalendarDays, Megaphone, Droplets, Store, Tag, Sun,
  History, BarChart3, Package, TimerReset, AlertCircle, ShoppingCart,
  Sparkles, Zap, Lightbulb, ArrowUpCircle, ArrowDownCircle, DollarSign,
  HelpCircle, RefreshCw, GitCompare, ChevronRight, ChevronLeft,
  ArrowRight, CheckCircle2, Clock, Target, Percent, Box,
} from 'lucide-react';
import { BentoCard } from '../components/layout/BentoCard';
import { apiClient, AnalyticsFilters } from '../services/api';
import {
  PredictV2Request, PredictV2Response, CalendarInfo, OilPriceInfo,
} from '../types';

// ─── Constantes ───
const FAMILLES = [
  'DAIRY', 'BEVERAGES', 'MEAT', 'GROCERY', 'BREAD/BAKERY', 'PRODUCE',
  'DELI', 'FROZEN FOODS', 'CLEANING', 'PERSONAL CARE', 'BABY CARE',
  'PET SUPPLIES', 'HOME CARE', 'ELECTRONICS', 'CLOTHING', 'BOOKS'
];

const MAGASINS = Array.from({ length: 54 }, (_, i) => `MAG_${String(i + 1).padStart(3, '0')}`);

interface PredictionsProps { filters: AnalyticsFilters; }

// ─── Composant Slider ───
const SliderField = ({ label, value, onChange, min, max, step, unit, icon: Icon }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit: string; icon: React.ElementType;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-semibold text-on-surface">{label}</span>
      </div>
      <span className="text-sm font-bold text-brand-600 dark:text-brand-400 font-mono">
        {value} <span className="text-[10px] font-normal text-on-surface-variant">{unit}</span>
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500
        bg-black/10 dark:bg-white/10 transition-all
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-500/30
        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
    />
    <div className="flex justify-between text-[9px] text-on-surface-variant/50 font-medium px-0.5">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// ─── Composant Toggle ───
const ToggleSwitch = ({ label, value, onChange, icon: Icon, activeColor = 'bg-brand-500' }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
  icon: React.ElementType; activeColor?: string;
}) => (
  <button
    onClick={() => onChange(!value)}
    className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-200 ${
      value
        ? 'border-brand-500/30 bg-brand-500/5'
        : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${value ? 'bg-brand-500/10' : 'bg-black/5 dark:bg-white/5'}`}>
        <Icon className={`w-4 h-4 ${value ? 'text-brand-500' : 'text-on-surface-variant/50'}`} />
      </div>
      <div className="text-left">
        <span className={`text-sm font-semibold ${value ? 'text-brand-600 dark:text-brand-400' : 'text-on-surface'}`}>
          {label}
        </span>
        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
          {value ? 'Activé' : 'Désactivé'}
        </p>
      </div>
    </div>
    <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
      value ? activeColor : 'bg-black/20 dark:bg-white/20'
    }`}>
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
        value ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </div>
  </button>
);

// ─── Animated Counter ───
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = display;
    const to = value;
    const duration = 800;
    
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);

  return <>{display.toLocaleString('fr-FR')}{suffix}</>;
};

// ═══════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════

export const Predictions: React.FC<PredictionsProps> = () => {
  // ─── Wizard step ───
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  // ─── Étape 1 : Produit ───
  const [numeroMagasin, setNumeroMagasin] = useState('MAG_001');
  const [numeroProduit, setNumeroProduit] = useState('PROD_001');
  const [famille, setFamille] = useState('DAIRY');
  const [estPerissable, setEstPerissable] = useState(true);

  // ─── Étape 2 : Ventes ───
  const [ventesVeilleProduit, setVentesVeilleProduit] = useState(150);
  const [moyenne7jProduit, setMoyenne7jProduit] = useState(130);
  const [prixPetrole, setPrixPetrole] = useState(80);
  const [prixPetroleAuto, setPrixPetroleAuto] = useState(true);

  // ─── Étape 3 : Stratégie ───
  const [indicateurPromotion, setIndicateurPromotion] = useState(false);

  // ─── Données externes ───
  const [calendarInfo, setCalendarInfo] = useState<CalendarInfo | null>(null);
  const [oilPriceInfo, setOilPriceInfo] = useState<OilPriceInfo | null>(null);

  // ─── Résultats ───
  const [prediction, setPrediction] = useState<PredictV2Response | null>(null);
  const [comparaison, setComparaison] = useState<{
    sansPromo: PredictV2Response | null;
    avecPromo: PredictV2Response | null;
  }>({ sansPromo: null, avecPromo: null });
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // ─── Chargement initial ───
  useEffect(() => {
    apiClient.getCalendarInfo().then(setCalendarInfo).catch(() => {});
    apiClient.getOilPrice().then(info => {
      setOilPriceInfo(info);
      if (prixPetroleAuto) setPrixPetrole(info.prix_petrole);
    }).catch(() => {});
  }, []);

  // ─── Prédiction ───
  const fairePrediction = useCallback(async (promo: boolean) => {
    const data: PredictV2Request = {
      numero_magasin: numeroMagasin,
      numero_produit: numeroProduit,
      famille,
      est_perissable: estPerissable ? 1 : 0,
      indicateur_promotion: promo ? 1 : 0,
      prix_petrole: prixPetrole,
      ventes_veille_produit: ventesVeilleProduit,
      moyenne_7j_produit: moyenne7jProduit,
    };
    return apiClient.predictSalesV2(data);
  }, [numeroMagasin, numeroProduit, famille, estPerissable, prixPetrole, ventesVeilleProduit, moyenne7jProduit]);

  const handlePredict = async () => {
    setIsPredicting(true);
    setError(null);
    setShowResult(false);
    try {
      const res = await fairePrediction(indicateurPromotion);
      setPrediction(res);
      const [sansPromo, avecPromo] = await Promise.all([
        fairePrediction(false),
        fairePrediction(true),
      ]);
      setComparaison({ sansPromo, avecPromo });
      setStep(3);
      setTimeout(() => setShowResult(true), 100);
    } catch (e: any) {
      setError(e.message || 'Erreur de prédiction');
    } finally {
      setIsPredicting(false);
    }
  };

  // ─── Navigation wizard ───
  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));
  const canGoNext = () => {
    if (step === 0) return numeroMagasin && numeroProduit && famille;
    if (step === 1) return true;
    return true;
  };

  // ─── Recommandations ───
  const recommandations = prediction && comparaison.avecPromo && comparaison.sansPromo ? [
    {
      icon: ShoppingCart,
      title: 'Stock recommandé',
      value: Math.round(comparaison.avecPromo.prediction * 1.3),
      desc: `Commander ${Math.round(comparaison.avecPromo.prediction * 1.3)} unités de ${numeroProduit} (marge sécurité 30%)`,
      color: 'emerald',
    },
    {
      icon: Megaphone,
      title: 'Impact promotion',
      value: `${Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%`,
      desc: comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
        ? `Promotion recommandée : +${Math.round(comparaison.avecPromo.prediction - comparaison.sansPromo.prediction)} unités attendues`
        : `Promotion peu impactante (moins de 15% de gain)`,
      color: comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15 ? 'emerald' : 'amber',
    },
    {
      icon: DollarSign,
      title: 'Chiffre d\'affaires',
      value: `${Math.round(prediction.prediction * 12.5).toLocaleString('fr-FR')} FCFA`,
      desc: `Estimation pour ${numeroProduit} à J+45 (prix moyen 12,5 FCFA/unité)`,
      color: 'purple',
    },
  ] : [];

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 pb-10 animate-fade-in">

      {/* ─── HEADER ─── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Prévisionnel</h1>
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> IA J+45
          </span>
        </div>
        <p className="text-sm text-on-surface-variant">
          Assistant de prédiction · Random Forest · Horizon J+45 · Agrégation Bottom-to-Up
        </p>
      </div>

      {/* ─── WIZARD - ÉTAPE 0 : PRODUIT ─── */}
      {step < 3 && (
        <BentoCard className="overflow-hidden">
          {/* Progress bar */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            {[0, 1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s ? 'bg-brand-500 text-white' : step === s ? 'bg-brand-500/10 text-brand-500 border-2 border-brand-500' : 'bg-black/5 dark:bg-white/5 text-on-surface-variant/50'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${
                    step === s ? 'text-brand-500' : 'text-on-surface-variant/50'
                  }`}>
                    {s === 0 ? 'Produit' : s === 1 ? 'Ventes' : 'Stratégie'}
                  </span>
                </div>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Étape 1 : Produit */}
          {step === 0 && (
            <div className="px-6 pb-6 animate-slide-right space-y-5">
              <div>
                <h3 className="text-lg font-bold mb-1">Quel produit souhaitez-vous analyser ?</h3>
                <p className="text-sm text-on-surface-variant">Sélectionnez le magasin, le produit et sa catégorie</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <Store className="w-4 h-4 text-brand-500" /> Magasin
                  </label>
                  <select value={numeroMagasin} onChange={e => setNumeroMagasin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer transition-all">
                    {MAGASINS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <Tag className="w-4 h-4 text-brand-500" /> Produit
                  </label>
                  <input type="text" value={numeroProduit}
                    onChange={e => setNumeroProduit(e.target.value)}
                    placeholder="PROD_001"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm font-mono font-bold focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <Package className="w-4 h-4 text-brand-500" /> Famille
                  </label>
                  <select value={famille} onChange={e => setFamille(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer transition-all">
                    {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <ToggleSwitch
                    label="Produit périssable"
                    value={estPerissable}
                    onChange={setEstPerissable}
                    icon={AlertCircle}
                    activeColor="bg-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Ventes */}
          {step === 1 && (
            <div className="px-6 pb-6 animate-slide-right space-y-5">
              <div>
                <h3 className="text-lg font-bold mb-1">Quelles sont ses ventes récentes ?</h3>
                <p className="text-sm text-on-surface-variant">
                  Renseignez les ventes des derniers jours pour affiner la prédiction
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderField
                  label="Ventes hier"
                  icon={History}
                  value={ventesVeilleProduit}
                  onChange={setVentesVeilleProduit}
                  min={0} max={2000} step={1} unit="unités"
                />
                <SliderField
                  label="Moyenne 7 derniers jours"
                  icon={TimerReset}
                  value={moyenne7jProduit}
                  onChange={setMoyenne7jProduit}
                  min={0} max={2000} step={1} unit="unités"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <SliderField
                      label={`Prix du pétrole${prixPetroleAuto ? ' (auto)' : ''}`}
                      icon={Droplets}
                      value={prixPetrole}
                      onChange={v => { setPrixPetrole(v); setPrixPetroleAuto(false); }}
                      min={20} max={200} step={0.5} unit="$/bbl"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPrixPetroleAuto(true);
                      if (oilPriceInfo) setPrixPetrole(oilPriceInfo.prix_petrole);
                    }}
                    className={`flex-shrink-0 p-3 rounded-xl border transition-all ${
                      prixPetroleAuto ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' : 'bg-black/5 dark:bg-white/5 border-transparent text-on-surface-variant'
                    }`}
                    title="Prix automatique">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {oilPriceInfo && (
                  <p className="text-[10px] text-on-surface-variant/60 mt-2 ml-1">
                    Prix actuel : <strong className="text-amber-600">${oilPriceInfo.prix_petrole}/bbl</strong> · Source : {oilPriceInfo.source}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Étape 3 : Stratégie */}
          {step === 2 && (
            <div className="px-6 pb-6 animate-slide-right space-y-5">
              <div>
                <h3 className="text-lg font-bold mb-1">Quelle stratégie adopter ?</h3>
                <p className="text-sm text-on-surface-variant">
                  Configurez votre stratégie promotionnelle et lancez la prédiction
                </p>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  label="Activer une promotion"
                  value={indicateurPromotion}
                  onChange={setIndicateurPromotion}
                  icon={Megaphone}
                />
                {indicateurPromotion && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <Megaphone className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Promotion active</p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Le modèle calculera l'impact de la promotion sur les ventes à J+45. 
                          Une comparaison avec/sans promotion sera affichée.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar preview */}
              {calendarInfo && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-purple-500/5 border border-brand-500/10">
                  <div className="flex flex-col items-center">
                    <CalendarDays className="w-8 h-8 text-brand-500" />
                    <span className="text-[9px] font-bold text-brand-500 mt-1 uppercase tracking-wider">J+45</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {calendarInfo.jplus45}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {calendarInfo.jour_semaine_jplus45} · {calendarInfo.saison_jplus45} · 
                      {calendarInfo.est_weekend_jplus45 ? ' Week-end' : ' Semaine'}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="text-right text-[10px] text-on-surface-variant/60">
                    <div>Aujourd'hui : {calendarInfo.aujourdhui}</div>
                    <div>Horizon : 45 jours</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-black/[0.02] dark:bg-white/[0.02]">
            <button onClick={prevStep}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                step === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}>
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>

            {step < 2 ? (
              <button onClick={nextStep} disabled={!canGoNext()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20">
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handlePredict} disabled={isPredicting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/30">
                {isPredicting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calcul...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Lancer la prédiction</>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="px-6 pb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            </div>
          )}
        </BentoCard>
      )}

      {/* ─── RÉSULTATS (step === 3) ─── */}
      {step === 3 && prediction && comparaison.sansPromo && comparaison.avecPromo && (
        <div className={`space-y-5 ${showResult ? 'animate-fade-in-up' : 'opacity-0'}`}>
          
          {/* Hero Result Card */}
          <BentoCard gradientHighlight className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-500/20 via-brand-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-500/10">
                    <Sparkles className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Prédiction J+45</h2>
                    <p className="text-[10px] text-on-surface-variant">
                      {numeroProduit} · {numeroMagasin} · {famille}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  prediction.source === 'ml_api_v2' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {prediction.source === 'ml_api_v2' ? 'Modèle IA' : 'Fallback'}
                </span>
              </div>

              {/* Main prediction */}
              <div className="text-center py-6">
                <p className="text-xs text-on-surface-variant/70 mb-2">
                  Prévision pour le <strong className="text-on-surface">{calendarInfo?.jplus45 || '...'}</strong>
                  {' · '}
                  {calendarInfo?.jour_semaine_jplus45} · {calendarInfo?.saison_jplus45}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-6xl font-black tracking-tighter text-on-surface">
                    <AnimatedCounter value={Math.round(prediction.prediction)} />
                  </span>
                  <span className="text-lg font-medium text-on-surface-variant mt-4">unités</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-on-surface-variant">
                    Modèle : {prediction.model} · Confiance : élevée
                  </span>
                </div>
              </div>

              {/* 3 KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {recommandations.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    r.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/10' :
                    r.color === 'amber' ? 'bg-amber-500/5 border-amber-500/10' :
                    'bg-purple-500/5 border-purple-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <r.icon className={`w-4 h-4 ${
                        r.color === 'emerald' ? 'text-emerald-500' :
                        r.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                      }`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        r.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                        r.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>{r.title}</span>
                    </div>
                    <div className={`text-xl font-black ${
                      r.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                      r.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`}>{r.value}</div>
                    <p className="text-[10px] text-on-surface-variant mt-1">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Comparaison Promo */}
          <BentoCard>
            <div className="flex items-center gap-2 mb-5">
              <GitCompare className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Comparaison promotion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-black/5 dark:bg-white/5 border border-border text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">Sans promotion</div>
                <div className="text-3xl font-black">
                  <AnimatedCounter value={Math.round(comparaison.sansPromo.prediction)} suffix="" />
                </div>
                <div className="text-[10px] text-on-surface-variant/60 mt-1">unités estimées</div>
              </div>

              <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Avec promotion</div>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    <AnimatedCounter value={Math.round(comparaison.avecPromo.prediction)} />
                  </div>
                  <div className="text-[10px] text-amber-600/60 dark:text-amber-400/60 mt-1">unités estimées</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    +{Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Décision */}
            <div className={`mt-4 p-4 rounded-xl ${
              comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
                ? 'bg-emerald-500/5 border border-emerald-500/10'
                : 'bg-sky-500/5 border border-sky-500/10'
            }`}>
              <div className="flex items-center gap-2">
                {comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15 ? (
                  <><ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Promotion recommandée</span></>
                ) : (
                  <><ArrowDownCircle className="w-5 h-5 text-sky-500" />
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400">Promotion non recommandée</span></>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-1 ml-7">
                {comparaison.avecPromo.prediction > comparaison.sansPromo.prediction * 1.15
                  ? `La promotion augmenterait les ventes de ${Math.round(comparaison.avecPromo.prediction - comparaison.sansPromo.prediction)} unités (${Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%). Recommandé pour ${calendarInfo?.jplus45}.`
                  : `La promotion n'apporte qu'un gain de ${Math.round((comparaison.avecPromo.prediction / comparaison.sansPromo.prediction - 1) * 100)}%, insuffisant pour justifier la réduction de marge.`}
              </p>
            </div>
          </BentoCard>

          {/* Recommandations détaillées */}
          <BentoCard>
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Synthèse décisionnelle</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stock */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Box className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Gestion des stocks</span>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {Math.round(comparaison.avecPromo.prediction * 1.3)}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Commander <strong>{Math.round(comparaison.avecPromo.prediction * 1.3)} unités</strong> de {numeroProduit} 
                  pour {calendarInfo?.jplus45} avec une marge de sécurité de 30%
                </p>
              </div>

              {/* Prix */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Stratégie prix</span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {Math.round(prediction.prediction * 12.5).toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Chiffre d'affaires estimé pour {numeroProduit} (prix unitaire moyen : 12,5 FCFA)
                </p>
              </div>

              {/* Calendrier */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent border border-brand-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Échéance</span>
                </div>
                <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                  {calendarInfo?.jplus45 || '...'}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  {calendarInfo?.jour_semaine_jplus45} · {calendarInfo?.saison_jplus45}
                  {calendarInfo?.est_weekend_jplus45 ? ' · Week-end' : ' · Semaine'}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Bouton nouvelle prédiction */}
          <div className="flex justify-center">
            <button onClick={() => { setStep(0); setShowResult(false); setPrediction(null); setComparaison({ sansPromo: null, avecPromo: null }); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-border text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95">
              <RefreshCw className="w-4 h-4" /> Nouvelle prédiction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;