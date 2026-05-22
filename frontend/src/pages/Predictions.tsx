import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  CalendarDays, 
  Megaphone, 
  Droplets, 
  Store, 
  Tag, 
  Sun, 
  History, 
  BarChart3, 
  Package, 
  TimerReset, 
  LucideIcon,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/layout/GlassCard';
import { apiClient, AnalyticsFilters } from '../services/api';
import { PredictResponse } from '../types';

interface PredictionsProps {
  filters: AnalyticsFilters;
}

interface SliderField {
  id: string;
  label: string;
  icon: LucideIcon;
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
  setter: (v: number) => void;
}

interface ToggleField {
  id: string;
  label: string;
  icon: LucideIcon;
  value: number;
  setter: (v: number) => void;
}

interface SelectField {
  id: string;
  label: string;
  icon: LucideIcon;
  options: { value: number; label: string }[];
  value: number;
  setter: (v: number) => void;
}

export const Predictions: React.FC<PredictionsProps> = ({ filters }) => {
  // === 13 Features du Modèle ===
  const [magasinIndex, setMagasinIndex] = useState<number>(3);
  const [familleIndex, setFamilleIndex] = useState<number>(1);
  const [saisonIndex, setSaisonIndex] = useState<number>(1);
  const [ventesVeille, setVentesVeille] = useState<number>(300);
  const [moyenneVentes7j, setMoyenneVentes7j] = useState<number>(300);
  const [estWeekend, setEstWeekend] = useState<number>(0);
  const [estJourFerie, setEstJourFerie] = useState<number>(0);
  const [indicateurPromotion, setIndicateurPromotion] = useState<number>(0);
  const [prixPetrole, setPrixPetrole] = useState<number>(75);
  const [nbTransactions, setNbTransactions] = useState<number>(100);
  const [ventesVeilleProduit, setVentesVeilleProduit] = useState<number>(10);
  const [moyenne7jProduit, setMoyenne7jProduit] = useState<number>(10);
  const [estPerissable, setEstPerissable] = useState<number>(0);

  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Champs slider
  const sliders: SliderField[] = [
    { id: 'ventes_veille', label: 'Ventes Hier (Total)', icon: History, min: 0, max: 8000, step: 50, unit: 'unités', value: ventesVeille, setter: setVentesVeille },
    { id: 'moyenne_7j', label: 'Moyenne 7 Jours (Total)', icon: BarChart3, min: 0, max: 8000, step: 50, unit: 'unités', value: moyenneVentes7j, setter: setMoyenneVentes7j },
    { id: 'ventes_produit', label: 'Ventes Produit Hier', icon: Package, min: 0, max: 500, step: 1, unit: 'unités', value: ventesVeilleProduit, setter: setVentesVeilleProduit },
    { id: 'moyenne_produit', label: 'Moyenne Produit 7j', icon: TimerReset, min: 0, max: 500, step: 1, unit: 'unités', value: moyenne7jProduit, setter: setMoyenne7jProduit },
    { id: 'transactions', label: 'Transactions', icon: ShoppingBag, min: 0, max: 500, step: 5, unit: 'tx', value: nbTransactions, setter: setNbTransactions },
    { id: 'petrole', label: 'Prix du Pétrole', icon: Droplets, min: 10, max: 140, step: 0.5, unit: '$/bbl', value: prixPetrole, setter: setPrixPetrole },
  ];

  // Champs toggle
  const toggles: ToggleField[] = [
    { id: 'promo', label: 'Promotion Active', icon: Megaphone, value: indicateurPromotion, setter: setIndicateurPromotion },
    { id: 'weekend', label: 'Week-end', icon: CalendarDays, value: estWeekend, setter: setEstWeekend },
    { id: 'ferie', label: 'Jour Férié', icon: Calendar, value: estJourFerie, setter: setEstJourFerie },
    { id: 'perissable', label: 'Produit Périssable', icon: AlertCircle, value: estPerissable, setter: setEstPerissable },
  ];

  // Champs select
  const selects: SelectField[] = [
    {
      id: 'magasin', label: 'Magasin', icon: Store,
      options: [
        { value: 1, label: 'Magasin #1 - Centre' }, { value: 2, label: 'Magasin #2 - Nord' },
        { value: 3, label: 'Magasin #3 - Sud' }, { value: 4, label: 'Magasin #4 - Est' },
        { value: 5, label: 'Magasin #5 - Ouest' },
      ],
      value: magasinIndex, setter: setMagasinIndex,
    },
    {
      id: 'famille', label: 'Famille Produit', icon: Tag,
      options: [
        { value: 1, label: '🐟 Poissonnerie' }, { value: 2, label: '🥩 Boucherie' },
        { value: 3, label: '🥦 Fruits & Légumes' }, { value: 4, label: '🥛 Produits Laitiers' },
        { value: 5, label: '🍞 Boulangerie' }, { value: 6, label: '🥤 Boissons' },
        { value: 7, label: '🧹 Entretien' }, { value: 8, label: '🍝 Épicerie' },
      ],
      value: familleIndex, setter: setFamilleIndex,
    },
    {
      id: 'saison', label: 'Saison', icon: Sun,
      options: [
        { value: 1, label: '🌱 Printemps (Mars-Mai)' },
        { value: 2, label: '☀️ Été (Juin-Août)' },
        { value: 3, label: '🍂 Automne (Sept-Nov)' },
        { value: 4, label: '❄️ Hiver (Déc-Fév)' },
      ],
      value: saisonIndex, setter: setSaisonIndex,
    },
  ];

  // Prediction automatique avec debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      triggerPrediction();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [
    magasinIndex, familleIndex, saisonIndex,
    ventesVeille, moyenneVentes7j,
    estWeekend, estJourFerie, indicateurPromotion,
    prixPetrole, nbTransactions,
    ventesVeilleProduit, moyenne7jProduit, estPerissable
  ]);

  const triggerPrediction = async () => {
    setIsPredicting(true);
    setError(null);
    try {
      const response = await apiClient.predictSales({
        magasin_index: Number(magasinIndex),
        famille_index: Number(familleIndex),
        saison_index: Number(saisonIndex),
        ventes_veille: Number(ventesVeille),
        moyenne_ventes_7j: Number(moyenneVentes7j),
        est_weekend: Number(estWeekend) || 0,
        est_jour_ferie: Number(estJourFerie) || 0,
        indicateur_promotion: Number(indicateurPromotion),
        prix_petrole: Number(prixPetrole),
        nb_transactions: Number(nbTransactions),
        ventes_veille_produit: Number(ventesVeilleProduit),
        moyenne_7j_produit: Number(moyenne7jProduit),
        est_perissable: Number(estPerissable) || 0,
      });
      setPrediction(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de prédiction');
    } finally {
      setIsPredicting(false);
    }
  };

  const getConfidenceColor = (pred?: number) => {
    if (!pred) return 'text-gray-400';
    if (pred > 30) return 'text-emerald-500';
    if (pred > 10) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase block mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Intelligence Prédictive
          </span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Prévision des Ventes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Modèle Random Forest • 13 features • Prédiction produit
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {prediction?.source === 'ml_model' ? 'Modèle Cloud' : 'Mode Local'}
            </span>
          </div>
        </div>
      </header>

      {/* Grille principale */}
      <section className="grid grid-cols-12 gap-6">
        {/* Colonne de gauche : Paramètres */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Selects (Magasin, Famille, Saison) */}
          <GlassCard className="p-5 border-t-2 border-primary/40">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Segmentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selects.map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <s.icon className="w-3.5 h-3.5 text-primary" />
                    {s.label}
                  </label>
                  <select
                    value={s.value}
                    onChange={(e) => s.setter(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                  >
                    {s.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Sliders */}
          <GlassCard className="p-5 border-t-2 border-primary/40">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Données Historiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sliders.map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <s.icon className="w-3.5 h-3.5 text-primary/70" />
                      {s.label}
                    </label>
                    <span className="text-xs font-bold font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {s.value.toLocaleString()} {s.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.value}
                    onChange={(e) => s.setter(Number(e.target.value))}
                    className="w-full accent-primary bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Colonne de droite : Résultat de la prédiction */}
        <div className="col-span-12 lg:col-span-4">
          <GlassCard className="p-6 h-full flex flex-col border-t-2 border-emerald-500 relative">
            {isPredicting && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 rounded-[24px]">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
                <span className="text-xs font-bold text-emerald-600">Calcul en cours...</span>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Prédiction du Modèle
              </span>
              
              <div className="relative mb-4">
                <div className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
                  {prediction !== null ? Math.round(prediction.prediction).toLocaleString('fr-FR') : '---'}
                </div>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-1 block">
                  unités estimées
                </span>
              </div>

              {/* Barre de confiance */}
              <div className="w-full max-w-[200px] mb-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Faible</span>
                  <span className="font-bold" style={{ color: prediction ? (prediction.prediction > 30 ? '#10b981' : prediction.prediction > 10 ? '#f59e0b' : '#f43f5e') : '#9ca3af' }}>
                    {prediction ? `${prediction.source === 'ml_model' ? 'Haute' : 'Moyenne'}` : '--'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      prediction?.source === 'ml_model' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: prediction ? `${Math.min(100, (prediction.prediction / 50) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="space-y-2 w-full max-w-[200px]">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Source</span>
                  <span className={`font-bold ${prediction?.source === 'ml_model' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {prediction?.source === 'ml_model' ? '☁️ Cloud IA' : '⚙️ Simulation'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Modèle</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">RF-13F</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Statut</span>
                  <span className={`font-bold flex items-center gap-1 ${prediction?.status === 'success' ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${prediction?.status === 'success' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {prediction?.status === 'success' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                <p className="text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {error}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* Toggles */}
      <section className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 p-5 border-t-2 border-primary/40">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Facteurs Contextuels
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {toggles.map((t) => (
              <button
                key={t.id}
                onClick={() => t.setter(t.value === 1 ? 0 : 1)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-2 ${
                  t.value === 1
                    ? 'border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <t.icon className={`w-5 h-5 ${t.value === 1 ? 'text-primary' : ''}`} />
                <span className="text-[11px] font-bold">{t.label}</span>
                <span className={`text-[10px] font-mono font-bold ${t.value === 1 ? 'text-primary' : 'text-gray-400'}`}>
                  {t.value === 1 ? 'ACTIF' : 'INACTIF'}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Carte d'explication du modèle */}
      <section className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 p-5 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
                À propos du Modèle
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Ce modèle <strong className="text-gray-700 dark:text-gray-300">Random Forest</strong> prédit les ventes d'un produit spécifique 
                pour le lendemain. Il utilise <strong>13 features</strong> incluant l'historique du produit (ventes veille, moyenne 7j), 
                le contexte saisonnier, les promotions, et des facteurs macroéconomiques (prix du pétrole). 
                La valeur retournée représente le nombre d'unités estimées.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Predictions;