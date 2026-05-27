import React, { useState, useCallback } from 'react';
import { AnalyticsFilters } from '../../services/api';
import {
  TrendingUp, TrendingDown, BarChart3, Store, Tag, Calendar,
  Megaphone, Sparkles, AlertTriangle, CheckCircle2, ShoppingCart,
  Lightbulb, Target, X, Package, Layers, Search,
} from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
  onFilterChange: (newFilters: AnalyticsFilters) => void;
  currentPage?: string;
}

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
  onFilterChange: (f: AnalyticsFilters) => void;
}

export const FilterSheet: React.FC<Props> = ({ isOpen, onClose, filters, onFilterChange }) => {
  const [selectedFamille, setSelectedFamille] = useState<string | null>(filters.family || null);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleSelectFamille = (familleId: string | null) => {
    setSelectedFamille(familleId);
    // Appliquer immédiatement
    const newFilters: AnalyticsFilters = { ...filters };
    if (familleId) {
      newFilters.family = familleId;
    } else {
      delete newFilters.family;
    }
    onFilterChange(newFilters);
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };

  const handleReset = () => {
    setSelectedFamille(null);
    onFilterChange({});
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };

  const activeCount = [filters.family].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      <div onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative w-full max-h-[80vh] bg-surface dark:bg-[#181420] border-t border-border rounded-t-[32px] p-5 shadow-2xl overflow-y-auto no-scrollbar z-10 animate-slide-up flex flex-col gap-5">

        {/* Handle */}
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10">
              <Layers className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Filtrer les données</h3>
              <p className="text-[10px] text-on-surface-variant/60">
                {activeCount > 0
                  ? `${activeCount} filtre${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`
                  : 'Aucun filtre actif'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {applied && (
              <span className="text-[9px] font-bold text-emerald-500 animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Appliqué
              </span>
            )}
            {activeCount > 0 && (
              <button onClick={handleReset}
                className="flex items-center gap-1 text-[9px] font-bold text-rose-500/70 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-500/5 transition-all">
                <X className="w-3 h-3" /> Tout effacer
              </button>
            )}
          </div>
        </div>

        {/* ─── FILTRE FAMILLE ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Famille produit</span>
              {selectedFamille && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500">{selectedFamille}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSelectFamille(null)}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition-all duration-200 active:scale-95 ${
                !selectedFamille
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                  : 'border-border text-on-surface-variant/60 bg-transparent hover:bg-black/5'
              }`}>
              Toutes les familles
            </button>
            {FAMILLES.map((f) => {
              const isActive = selectedFamille === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectFamille(isActive ? null : f.id)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'border-border text-on-surface-variant bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}>
                  {f.emoji} {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── RÉSUMÉ DES FILTRES ACTIFS ─── */}
        {activeCount > 0 && (
          <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Filtres actifs</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.family && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-500/10 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  <Package className="w-3 h-3" /> {filters.family}
                  <button onClick={() => handleSelectFamille(null)} className="hover:text-rose-500 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ─── BOUTON FERMER ─── */}
        <button onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20">
          {activeCount > 0 ? 'Voir les résultats filtrés' : 'Fermer'}
        </button>
      </div>
    </div>
  );
};

export default FilterSheet;