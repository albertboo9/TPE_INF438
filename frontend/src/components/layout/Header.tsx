import React from "react";
import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  currentPage?: string;
  onOpenFilters?: () => void;
  className?: string;
}

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  forecasting: "Prévisions",
  intelligence: "Intelligence",
};

export const Header: React.FC<HeaderProps> = ({ currentPage = "dashboard" }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 lg:px-8 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-on-background hidden sm:block">RetailSense</span>
        </div>
        <span className="text-xs text-on-surface-variant font-medium hidden sm:block">/</span>
        <span className="text-xs font-medium text-on-surface-variant capitalize">{pageLabels[currentPage] || currentPage}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:bg-border transition-colors">
          <Bell size={14} className="text-on-surface-variant" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        <button onClick={toggleTheme} className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:bg-border transition-colors">
          {theme === "dark" ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-brand-600" />}
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-lg bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-on-background">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-on-surface-variant">{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;