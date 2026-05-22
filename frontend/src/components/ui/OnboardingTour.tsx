import React, { useState } from 'react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: string;
  targetId?: string;
}

const steps: TourStep[] = [
  {
    title: "Bienvenue dans RetailSense.AI",
    description: "Votre cockpit décisionnel de pilotage en temps réel. Ce guide rapide va vous montrer comment exploiter la puissance d'analyse de vos données.",
    icon: "bolt"
  },
  {
    title: "Indicateurs Clés de Performance (KPIs)",
    description: "Visualisez en un coup d'œil les ventes cumulées, le taux de promotion, le nombre de magasins opérationnels et l'indice de stock de sécurité.",
    icon: "speed",
    targetId: "tour-kpis"
  },
  {
    title: "Slicing Multi-dimensionnel",
    description: "Utilisez la barre latérale sur ordinateur ou le panneau flottant sur mobile pour filtrer par plage de dates, catégorie d'articles ou identifiant de magasin.",
    icon: "filter_alt"
  },
  {
    title: "Moteur de Volatilité & Prévisions IA",
    description: "Ajustez les sliders des 8 caractéristiques clés (prix du pétrole, promotions...) pour simuler et anticiper les ventes de demain et calculer les stocks de sécurité.",
    icon: "query_stats",
    targetId: "tour-logistics"
  },
  {
    title: "Market Intelligence Géographique",
    description: "Explorez les ventes par nœud urbain principal (Quito, Cayambe, Ambato) et comparez l'impact réel des promotions sur vos familles d'articles.",
    icon: "map",
    targetId: "tour-geographic"
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      // Smooth scroll to the highlighted target element if it exists
      const targetId = steps[currentStep + 1].targetId;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const targetId = steps[currentStep - 1].targetId;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Tour Step Card */}
      <div className="relative w-full max-w-md bg-surface dark:bg-[#181420] border border-border dark:border-[#2b2735] rounded-[32px] p-8 shadow-2xl animate-scale-up flex flex-col gap-6">
        
        {/* Step progress dots */}
        <div className="flex gap-1.5 justify-center">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-outline/20'
              }`}
            ></div>
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {step.icon}
            </span>
          </div>
          
          <h3 className="font-h2 text-xl font-black text-on-surface leading-tight tracking-tight">
            {step.title}
          </h3>
          
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            {step.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center mt-2 border-t border-border dark:border-[#2b2735] pt-5">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-outline hover:text-on-surface transition-colors active:scale-95"
          >
            Passer
          </button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="px-4 py-2 border border-border dark:border-[#2b2735] hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant transition-all active:scale-95 flex items-center gap-1"
              >
                Retour
              </button>
            )}
            
            <button 
              onClick={handleNext}
              className="px-5 py-2.5 bg-primary text-white hover:opacity-95 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.97] flex items-center gap-1"
            >
              <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
