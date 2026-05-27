import React, { useState } from 'react';
import { AnalyticsFilters } from '../../services/api';
import { cn } from '../../lib/utils';
import {
  TrendingUp, TrendingDown, BarChart3, Store, Tag, Calendar,
  Megaphone, Sparkles, AlertTriangle, CheckCircle2, ArrowRightLeft,
  Lightbulb, ChevronRight, Target, Activity, ShoppingCart,
  DollarSign, Clock,
} from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
  onFilterChange: (newFilters: AnalyticsFilters) => void;
  currentPage?: string;
}

// ─── Scénarios prédéfinis ───
const SCENARIOS = [
  {
    id: 'top-products',
    label: 'Top 5 produits performants',
    desc: 'Identifier les meilleurs vendeurs pour réapprovisionnement prioritaire',
    icon: ShoppingCart,
    color: 'emerald',
    action: () => ({ limit: '5', family: undefined }),
  },
  {
    id: 'declining',
    label: 'Produits en baisse',
    desc: 'Détecter les articles sous-performants pour action correctrice',
    icon: TrendingDown,
    color: 'rose',
    action: () => ({ limit: '10', family: undefined }),
  },
  {
    id: 'promo-impact',
    label: 'Impact des promotions',
    desc: 'Analyser l\'efficacité des promotions par catégorie',
    icon: Megaphone,
    color: 'amber',
    action: () => ({ family: undefined }),
  },
  {
    id: 'seasonal',
    label: 'Tendances saisonnières',
    desc: 'Comparer les performances selon la saison J+45',
    icon: Calendar,
    color: 'blue',
    action: () => ({ family: undefined }),
  },
  {
    id: 'perishable',
    label: 'Produits périssables',
    desc: 'Focus sur les articles à durée limitée pour minimiser les pertes',
    icon: AlertTriangle,
    color: 'rose',
    action: () => ({ family: undefined }),
  },
  {
    id: 'category-compare',
    label: 'Comparaison catégories',
    desc: 'Quelle famille de produits génère le plus de volume ?',
    icon: BarChart3,
    color: 'purple',
    action: () => ({ limit: '16', family: undefined }),
  },
];

const FAMILLES = [
  { id: 'DAIRY', label: 'Produits laitiers', emoji: '🥛' },
  { id: 'BEVERAGES', label: 'Boissons', emoji: '🧃' },
  { id: 'MEAT', label: 'Viandes', emoji: '🥩' },
  { id: 'GROCERY', label: 'Épicerie', emoji: '🛒' },
  { id: 'BREAD/BAKERY', label: 'Boulangerie', emoji: '🥖' },
  { id: 'PRODUCE', label: 'Fruits & Légumes', emoji: '🥦' },
  { id: 'DELI', label: 'Traiteur', emoji: '🥗' },
  { id: 'FROZEN FOODS', label: 'Surgelés', emoji: '❄️' },
  { id: 'CLEANING', label: 'Entretien', emoji: '🧹' },
  { id: 'PERSONAL CARE', label: 'Hygiène', emoji: '🧴' },
  { id: 'BABY CARE', label: 'Puériculture', emoji: '🍼' },
  { id: 'PET SUPPLIES', label: 'Animalerie', emoji: '🐾' },
];

const MAGASINS_PAR_TYPE = [
  { type: 'A', label: 'Grande surface', stores: ['MAG_001', 'MAG_002', 'MAG_003', 'MAG_004', 'MAG_005'], desc: '5 hypermarchés' },
  { type: 'B', label: 'Supermarché', stores: ['MAG_006', 'MAG_007', 'MAG_008', 'MAG_009', 'MAG_010', 'MAG_011', 'MAG_012', 'MAG_013'], desc: '8 supermarchés' },
  { type: 'C', label: 'Supérette', stores: ['MAG_014', 'MAG_015', 'MAG_016', 'MAG_017', 'MAG_018'], desc: '5 supérettes' },
  { type: 'D', label: 'Magasin de proximité', stores: Array.from({ length: 36 }, (_, i) => `MAG_${String(i + 19).padStart(3, '0')}`), desc: '36 proximités' },
];

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  currentPage = 'dashboard',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedFamille, setSelectedFamille] = useState<string | null>(filters.family || null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  if (!isOpen) return null;

  const handleApplyScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId === selectedScenario ? null : scenarioId);
    if (scenarioId === 'top-products') {
      onFilterChange({ limit: 5, family: undefined });
    } else if (scenarioId === 'declining') {
      onFilterChange({ limit: 10, family: undefined });
    } else if (scenarioId === 'category-compare') {
      onFilterChange({ limit: 16, family: undefined });
    }
  };

  const handleApply = () => {
    onFilterChange({
      family: selectedFamille || undefined,
      ...(selectedScenario === 'top-products' ? { limit: 5 } : {}),
      ...(selectedScenario === 'declining' ? { limit: 10 } : {}),
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedScenario(null);
    setSelectedFamille(null);
    setSelectedType(null);
    setComparisonMode(false);
    onFilterChange({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      {/* Backdrop */}
      <div onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />

      {/* Panel */}
      <div className="relative w-full max-h-[88vh] bg-surface dark:bg-[#181420] border-t border-border rounded-t-[32px] p-5 shadow-2xl overflow-y-auto no-scrollbar z-10 animate-slide-up flex flex-col gap-5">

        {/* Handle */}
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10">
              <Lightbulb className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Centre de Pilotage</h3>
              <p className="text-[10px] text-on-surface-variant/60">Décisions & Analyses rapides</p>
            </div>
          </div>
          <button onClick={handleClear}
            className="text-[10px] font-semibold text-rose-500/70 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/5">
            ↺ Réinitialiser
          </button>
        </div>

        {/* ─── SCÉNARIOS RAPIDES ─── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Scénarios rapides</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENARIOS.map((s) => {
              const active = selectedScenario === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => handleApplyScenario(s.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                    active
                      ? `border-${s.color}-500/30 bg-${s.color}-500/5`
                      : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    active ? `bg-${s.color}-500/10` : 'bg-black/5 dark:bg-white/5'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                      active ? `text-${s.color}-500` : 'text-on-surface-variant/50'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-semibold ${
                      active ? `text-${s.color}-600 dark:text-${s.color}-400` : 'text-on-surface'
                    }`}>
                      {s.label}
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 mt-0.5 leading-tight">{s.desc}</p>
                    {active && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className={`w-3 h-3 text-${s.color}-500`} />
                        <span className={`text-[8px] font-bold text-${s.color}-500 uppercase tracking-wider`}>Sélectionné</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── FAMILLE PRODUIT ─── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Famille produit</span>
            {selectedFamille && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500">{selectedFamille}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedFamille(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                !selectedFamille
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                  : 'border-border text-on-surface-variant/60 bg-transparent'
              }`}>
              Toutes
            </button>
            {FAMILLES.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFamille(selectedFamille === f.id ? null : f.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                  selectedFamille === f.id
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                    : 'border-border text-on-surface-variant bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TYPE DE MAGASIN ─── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Type de magasin</span>
            {selectedType && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500">{selectedType}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MAGASINS_PAR_TYPE.map((type) => (
              <button
                key={type.type}
                onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.type
                    ? 'border-brand-500/30 bg-brand-500/5'
                    : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    selectedType === type.type ? 'bg-brand-500 text-white' : 'bg-black/10 dark:bg-white/10'
                  }`}>
                    {type.type}
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold">{type.label}</div>
                    <div className="text-[8px] text-on-surface-variant/60">{type.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── BOUTONS D'ACTION ─── */}
        <div className="space-y-2 pt-2">
          <button onClick={handleApply}
            className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] text-sm">
            <Sparkles className="w-4 h-4" />
            Appliquer au tableau de bord
          </button>
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-semibold text-on-surface-variant/70 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSheet;