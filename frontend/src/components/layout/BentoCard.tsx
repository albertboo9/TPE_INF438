import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  gradientHighlight?: boolean;
  noPadding?: boolean;
}

/**
 * BentoCard — Stripe / Linear inspired card primitive.
 * Grid spanning is handled by the PARENT via className (e.g. "col-span-6 row-span-2").
 * Never use dynamic colSpan/rowSpan props — Tailwind JIT will purge them.
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  gradientHighlight = false,
  noPadding = false,
}) => {
  return (
    <div
      className={[
        'relative group overflow-hidden rounded-2xl',
        'bg-white dark:bg-[#111116]',
        'border border-black/[0.06] dark:border-white/[0.06]',
        'transition-all duration-300 ease-out',
        'hover:border-black/10 dark:hover:border-white/10',
        gradientHighlight
          ? 'hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.35)]'
          : 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40',
        className,
      ].join(' ')}
    >
      {/* Top shimmer line on hover — Linear style */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

      {/* Radial glow for highlighted cards */}
      {gradientHighlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.07] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
      )}

      <div className={`relative z-10 h-full w-full ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>
    </div>
  );
};
