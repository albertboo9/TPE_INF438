import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  hoverGlow?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  hoverGlow = false,
  active = false,
  onClick 
}) => {
  const base = 'card';
  const hoverClass = (hover || hoverGlow) ? 'card-hover' : '';
  const activeClass = active ? 'card-active' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${base} ${hoverClass} ${activeClass} ${clickClass} p-5 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Keep the old export for backwards compatibility
export const GlassCard = Card;

// StatCard - for KPI metrics
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon, className = '' }) => {
  return (
    <Card className={`flex flex-col justify-between gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        {icon && <span className="text-on-surface-variant/60">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className="kpi-value">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${
            trend.positive ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {trend.positive 
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              }
            </svg>
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
      </div>
    </Card>
  );
};

export default Card;