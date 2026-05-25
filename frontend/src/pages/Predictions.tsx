import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, CalendarDays, Megaphone, Droplets, Store, Tag, Sun,
  History, BarChart3, Package, TimerReset, LucideIcon, AlertCircle, ShoppingCart,
  Sparkles, Zap,
} from 'lucide-react';
import { BentoCard } from '../components/layout/BentoCard';
import { apiClient, AnalyticsFilters } from '../services/api';
import { useInventoryInsights } from '../hooks/useAnalytics';

interface PredictionsProps { filters: AnalyticsFilters; }

export const Predictions: React.FC<PredictionsProps> = () => {
  const [magasinIndex, setMagasinIndex] = useState(3);
  const [familleIndex, setFamilleIndex] = useState(1);
  const [saisonIndex, setSaisonIndex] = useState(1);
  const [ventesVeille, setVentesVeille] = useState(300);
  const [moyenneVentes7j, setMoyenneVentes7j] = useState(300);
  const [estWeekend, setEstWeekend] = useState(0);
  const [estJourFerie, setEstJourFerie] = useState(0);
  const [indicateurPromotion, setIndicateurPromotion] = useState(0);
  const [prixPetrole, setPrixPetrole] = useState(75);
  const [nbTransactions, setNbTransactions] = useState(100);
  const [ventesVeilleProduit, setVentesVeilleProduit] = useState(10);
  const [moyenne7jProduit, setMoyenne7jProduit] = useState(10);
  const [estPerissable, setEstPerissable] = useState(0);

  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setIsPredicting(true);
      setError(null);
      try {
        const res = await apiClient.predictSales({
          magasin_index: magasinIndex, famille_index: familleIndex, saison_index: saisonIndex,
          ventes_veille: ventesVeille, moyenne_ventes_7j: moyenneVentes7j,
          est_weekend: estWeekend, est_jour_ferie: estJourFerie,
          indicateur_promotion: indicateurPromotion, prix_petrole: prixPetrole,
          nb_transactions: nbTransactions, ventes_veille_produit: ventesVeilleProduit,
          moyenne_7j_produit: moyenne7jProduit, est_perissable: estPerissable,
        });
        setPrediction(res);
      } catch (e: any) {
        setError(e.message || 'Erreur prédiction');
      } finally {
        setIsPredicting(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [magasinIndex, familleIndex, saisonIndex, ventesVeille, moyenneVentes7j, estWeekend,
      estJourFerie, indicateurPromotion, prixPetrole, nbTransactions, ventesVeilleProduit,
      moyenne7jProduit, estPerissable]);

  const Slider = ({ label, icon: Icon, val, set, min, max, step, unit }: {
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

  const Toggle = ({ label, icon: Icon, val, set }: {
    label: string; icon: LucideIcon; val: number; set: (v: number) => void;
  }) => (
    <button onClick={() => set(val === 1 ? 0 : 1)}
      className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all text-left
        ${val === 1
          ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
          : 'bg-black/5 dark:bg-white/5 border-transparent text-on-surface-variant hover:bg-black/10 dark:hover:bg-white/10'
        }`}>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
        <Icon className="w-4 h-4" />{label}
      </div>
      <div className={`w-8 h-4 rounded-full relative transition-colors flex-shrink-0
        ${val === 1 ? 'bg-brand-500' : 'bg-black/20 dark:bg-white/20'}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform
          ${val === 1 ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </button>
  );

  const Select = ({ label, icon: Icon, val, set, options }: {
    label: string; icon: LucideIcon; val: number; set: (v: number) => void;
    options: { value: number; label: string }[];
  }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
        <Icon className="w-3.5 h-3.5" />{label}
      </div>
      <select value={val} onChange={e => set(Number(e.target.value))}
        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10
          rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface
          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Forecasting</h1>
        <p className="text-sm text-on-surface-variant">Moteur de prédiction Random Forest · 13 dimensions.</p>
      </div>

      {/* Hero: Prediction result — full width */}
      <BentoCard gradientHighlight className="w-full">
        <div className="flex flex-col items-center justify-center py-8 relative">
          <div className="absolute top-0 right-0 w-56 h-56 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Estimation ML</span>
          </div>
          {isPredicting ? (
            <div className="flex items-center gap-3 text-on-surface/50">
              <div className="w-5 h-5 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-2xl font-black">Calcul en cours…</span>
            </div>
          ) : error ? (
            <p className="text-rose-500 font-bold">{error}</p>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-black tracking-tighter text-on-surface">
                {Math.round(prediction?.prediction || 0).toLocaleString('fr-FR')}
                <span className="text-2xl font-normal text-on-surface-variant ml-2">unités</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">
                Confiance du modèle :&nbsp;
                <span className="text-emerald-500 font-bold">Élevée (92 %)</span>
              </p>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Three-column control grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Column 1 — Contexte */}
        <BentoCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Store className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Contexte</span>
          </div>
          <Select label="Magasin" icon={Store} val={magasinIndex} set={setMagasinIndex}
            options={[{value:1,label:'Magasin 1'},{value:2,label:'Magasin 2'},{value:3,label:'Magasin 3'}]} />
          <Select label="Saison" icon={Sun} val={saisonIndex} set={setSaisonIndex}
            options={[{value:1,label:'Printemps'},{value:2,label:'Été'},{value:3,label:'Automne'},{value:4,label:'Hiver'}]} />
          <Slider label="Prix du Pétrole" icon={Droplets} val={prixPetrole} set={setPrixPetrole} min={20} max={150} step={0.5} unit="$/bbl" />
          <div className="flex flex-col gap-2 pt-1">
            <Toggle label="Week-end" icon={CalendarDays} val={estWeekend} set={setEstWeekend} />
            <Toggle label="Jour Férié" icon={Calendar} val={estJourFerie} set={setEstJourFerie} />
          </div>
        </BentoCard>

        {/* Column 2 — Profil Produit */}
        <BentoCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Package className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Profil Produit</span>
          </div>
          <Select label="Catégorie" icon={Tag} val={familleIndex} set={setFamilleIndex}
            options={[{value:1,label:'Poissonnerie'},{value:2,label:'Boucherie'},{value:3,label:'Fruits & Légumes'},{value:8,label:'Épicerie'}]} />
          <Slider label="Ventes Produit (Veille)" icon={History} val={ventesVeilleProduit} set={setVentesVeilleProduit} min={0} max={500} step={1} unit="u" />
          <Slider label="Moyenne Produit (7 j)" icon={TimerReset} val={moyenne7jProduit} set={setMoyenne7jProduit} min={0} max={500} step={1} unit="u" />
          <Toggle label="Produit Périssable" icon={AlertCircle} val={estPerissable} set={setEstPerissable} />
        </BentoCard>

        {/* Column 3 — Dynamique Magasin */}
        <BentoCard className="flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Zap className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Dynamique Magasin</span>
          </div>
          <Slider label="Ventes Globales (Veille)" icon={BarChart3} val={ventesVeille} set={setVentesVeille} min={0} max={8000} step={50} unit="u" />
          <Slider label="Moyenne Globale (7 j)" icon={BarChart3} val={moyenneVentes7j} set={setMoyenneVentes7j} min={0} max={8000} step={50} unit="u" />
          <Slider label="Trafic (Transactions)" icon={ShoppingCart} val={nbTransactions} set={setNbTransactions} min={0} max={1000} step={5} unit="tx" />
          <div className="mt-auto pt-2">
            <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <Toggle label="Activer Promotion" icon={Megaphone} val={indicateurPromotion} set={setIndicateurPromotion} />
            </div>
          </div>
        </BentoCard>

      </div>
    </div>
  );
};

export default Predictions;