import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core login colors
        primary: "#8069BF",
        secondary: "#7C7296",
        tertiary: "#C9A74D",
        neutral: "#79767D",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",

        // Extended design system colors mapped to CSS variables for dynamic Dark Mode
        onBackground: "var(--color-on-background)",
        onSurface: "var(--color-on-surface)",
        onSurfaceVariant: "var(--color-on-surface-variant)",
        surfaceVariant: "var(--color-surface-variant)",
        outline: "var(--color-outline)",
        outlineVariant: "var(--color-outline-variant)",
        
        primaryContainer: "var(--color-primary-container)",
        onPrimaryContainer: "var(--color-on-primary-container)",
        secondaryContainer: "var(--color-secondary-container)",
        onSecondaryContainer: "var(--color-on-secondary-container)",
        tertiaryContainer: "var(--color-tertiary-container)",
        onTertiaryContainer: "var(--color-on-tertiary-container)",
        
        surfaceContainerLowest: "var(--color-surface-container-lowest)",
        surfaceContainerLow: "var(--color-surface-container-low)",
        surfaceContainer: "var(--color-surface-container)",
        surfaceContainerHigh: "var(--color-surface-container-high)",
        surfaceContainerHighest: "var(--color-surface-container-highest)",
        
        error: "var(--color-error)",
        errorContainer: "var(--color-error-container)",
        onError: "#ffffff",
        onErrorContainer: "#93000a",

        emeraldAi: '#10b981',
        electricIndigo: '#6366f1',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        xs: '8px',
        bentoGap: '20px',
        md: '24px',
        xl: '64px',
        lg: '40px',
        base: '4px',
        sm: '16px',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        bodySm: ['Inter', 'sans-serif'],
        bodyLg: ['Inter', 'sans-serif'],
        h2: ['Inter', 'sans-serif'],
        labelCaps: ['Inter', 'sans-serif'],
        monoData: ['JetBrains Mono', 'monospace'],
        h1: ['Inter', 'sans-serif'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        bodySm: ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        bodyLg: ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        h2: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        labelCaps: ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        monoData: ['13px', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '500' }],
        h1: ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;