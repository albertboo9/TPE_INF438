/** @type {import('tailwindcss').Config} */

/** @type {import('tailwindcss').Config} */
export default {

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],

  darkMode: 'class',

  theme: {

    extend: {

      colors: {

        /* ===== PALETTE PRINCIPALE ===== */

        primary: "#8069BF",
        secondary: "#7C7296",
        tertiary: "#C9A74D",
        neutral: "#79767D",

        emeraldAi: '#10b981',
        electricIndigo: '#6366f1',
        


        /* ===== COULEURS DYNAMIQUES LIGHT/DARK ===== */

        background: "var(--color-background)",
        surface: "var(--color-surface)",
        card: "var(--color-card)",
        border: "var(--color-border)",

        text: "var(--color-text)",
        textSecondary: "var(--color-text-secondary)",
       
        


        /* ===== DESIGN SYSTEM EXISTANT ===== */

        onBackground: "var(--color-on-background)",
        onSurface: "var(--color-on-surface)",
        onSurfaceVariant: "var(--color-on-surface-variant)",
        surfaceVariant: "var(--color-surface-variant)",
        outline: "var(--color-outline)",
        outlineVariant: "var(--color-outline-variant)",

        primaryContainer:
          "var(--color-primary-container)",

        onPrimaryContainer:
          "var(--color-on-primary-container)",

        secondaryContainer:
          "var(--color-secondary-container)",

        onSecondaryContainer:
          "var(--color-on-secondary-container)",

        tertiaryContainer:
          "var(--color-tertiary-container)",

        onTertiaryContainer:
          "var(--color-on-tertiary-container)",

        surfaceContainerLowest:
          "var(--color-surface-container-lowest)",

        surfaceContainerLow:
          "var(--color-surface-container-low)",

        surfaceContainer:
          "var(--color-surface-container)",

        surfaceContainerHigh:
          "var(--color-surface-container-high)",

        surfaceContainerHighest:
          "var(--color-surface-container-highest)",

        error:
          "var(--color-error)",

        errorContainer:
          "var(--color-error-container)",

        onError:
          "#ffffff",

        onErrorContainer:
          "#93000a",

      },
      textShadow: {
        glow: "0 0 5px #D946EF, 0 0 10px #D946EF, 0 0 20px #A855F7, 0 0 40px #A855F7"
      },


      /* ===== DASHBOARD ===== */

      boxShadow: {

        dashboard: `
          0px 8px 30px
          rgba(128,105,191,.08)
        `,

        card: `
          0px 4px 20px
          rgba(0,0,0,.08)
        `,

      },


      /* ===== BORDER ===== */

      borderRadius: {

        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',

        card: '24px',

        full: '9999px',

      },


      /* ===== SPACING ===== */

      spacing: {

        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '40px',
        xl: '64px',

        bentoGap: '20px',
        base: '4px',

      },


      /* ===== FONTS ===== */

      fontFamily: {

        display: [
          'Inter',
          'sans-serif'
        ],

        bodySm: [
          'Inter',
          'sans-serif'
        ],

        bodyLg: [
          'Inter',
          'sans-serif'
        ],

        h1: [
          'Inter',
          'sans-serif'
        ],

        h2: [
          'Inter',
          'sans-serif'
        ],

        monoData: [
          'JetBrains Mono',
          'monospace'
        ],

      },


      fontSize: {

        display: [

          '48px',

          {
            lineHeight:'1.1',
            letterSpacing:'-0.02em',
            fontWeight:'600'
          }

        ],

        h1:[

          '32px',

          {
            lineHeight:'1.2',
            letterSpacing:'-0.02em',
            fontWeight:'600'
          }

        ],

        h2:[

          '24px',

          {
            lineHeight:'1.3',
            letterSpacing:'-0.01em',
            fontWeight:'600'
          }

        ],

      },


      /* ===== ANIMATIONS ===== */

      animation: {

        shimmer:
          'shimmer 2s infinite linear',

        'fade-in':
          'fadeIn .4s ease-out forwards',

        'slide-up':
          'slideUp .4s ease-out forwards',

        'scale-in':
          'scaleIn .3s ease',

        float:
          'float 6s ease-in-out infinite',

      },


      keyframes: {

        shimmer: {

          '0%': {
            backgroundPosition:'-200% 0'
          },

          '100%': {
            backgroundPosition:'200% 0'
          }

        },


        fadeIn: {

          '0%': {

            opacity:'0',
            transform:'scale(.95)'

          },

          '100%': {

            opacity:'1',
            transform:'scale(1)'

          }

        },


        slideUp: {

          '0%': {

            transform:'translateY(40px)',
            opacity:'0'

          },

          '100%': {

            transform:'translateY(0)',
            opacity:'1'

          }

        },


        scaleIn: {

          '0%': {

            transform:'scale(.8)',
            opacity:'0'

          },

          '100%': {

            transform:'scale(1)',
            opacity:'1'

          }

        },
       


        float: {

          '0%': {
            transform:'translateY(0px)'
          },

          '50%': {
            transform:'translateY(-15px)'
          },

          '100%': {
            transform:'translateY(0px)'
          }

        }

      }

    },

  },

  plugins: [],

}