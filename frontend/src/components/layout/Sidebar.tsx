import React from "react"
import { cn } from "../../lib/utils"

interface SidebarProps {
  className?: string
  currentPage: string
  onNavigate: (page: string) => void
}

interface NavItem {
  page: string
  label: string
  icon: string
  badge?: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { page: "dashboard", label: "Tableau de Bord", icon: "dashboard", description: "Vue d'ensemble" },
  { page: "forecasting", label: "Prévisionnel", icon: "query_stats", badge: "IA", description: "Prédictions J+45" },
  { page: "intelligence", label: "Catalogue", icon: "inventory_2", description: "Analyse produits" },
]

export const Sidebar: React.FC<SidebarProps> = ({ className, currentPage, onNavigate }) => {
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full w-72 pt-20 px-4 flex flex-col",
      "bg-surface-container-low border-r border-border",
      "transition-all duration-300",
      className
    )}>
      {/* Brand */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
            <span className="material-symbols-outlined text-white text-[18px]">monitoring</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface tracking-tight">RetailSense</h2>
            <p className="text-[10px] font-medium text-on-surface-variant">Cockpit Décisionnel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-1">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group relative",
                "active:scale-[0.98]",
                active
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                  : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-white/5 hover:text-on-surface"
              )}
            >
              {/* Active indicator */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all",
                active ? "bg-brand-500" : "opacity-0"
              )} />
              
              <span className="material-symbols-outlined text-[22px]" style={{
                fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300"
              }}>
                {item.icon}
              </span>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wide">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                      active ? "bg-brand-500/20 text-brand-600 dark:text-brand-400" : "bg-surface-variant text-on-surface-variant"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-[10px] mt-0.5",
                  active ? "text-brand-600/60 dark:text-brand-400/60" : "text-on-surface-variant/50"
                )}>
                  {item.description}
                </p>
              </div>

              {/* Arrow hint */}
              {active && (
                <span className="material-symbols-outlined text-[16px] text-brand-500">chevron_right</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border flex items-center justify-between">
        <span className="text-[10px] font-semibold text-on-surface-variant/60">v3.4 · Prêt</span>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload() }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-error/70 hover:text-error transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Quitter</span>
        </button>
      </div>
    </aside>
  )
}