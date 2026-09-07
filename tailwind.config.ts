import type { Config } from 'tailwindcss'

/**
 * DESIGN TOKEN — fonte unica di verità.
 *
 * Regola del progetto: nessun valore cromatico, tipografico o di spaziatura
 * fuori da questo file. Se serve una tinta nuova, si aggiunge qui e le si dà
 * un nome; non si scrive mai un esadecimale dentro un componente.
 *
 * Direzione: verde petrolio istituzionale (non il blu aziendale banale),
 * fondo bianco caldo, un solo accento in ottone attenuato.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /** Colore istituzionale. Il 700 è il primario: titoli di sezione, fondi scuri. */
        petrolio: {
          950: '#08201F',
          900: '#0C2A2B',
          800: '#113637',
          700: '#17474A',
          600: '#1E5B5D',
          500: '#2A7274',
          300: '#7FAFAE',
          200: '#A9C9C7',
          100: '#D5E5E2',
          50: '#EEF5F3',
        },
        /** Accento discreto: ottone attenuato. Filetti, numeri, dettagli. Mai grandi campiture. */
        brass: {
          DEFAULT: '#9A7526',
          soft: '#C4A661',
          pale: '#EFE3C6',
        },
        /** Fondi. `paper` è il dominante: bianco caldo, non bianco puro. */
        paper: {
          DEFAULT: '#FBFAF7',
          warm: '#F6F3EC',
        },
        stone: '#F0EDE6',
        /** Linee sottili: separano al posto di riquadri e ombre. */
        line: {
          DEFAULT: '#E2DED4',
          strong: '#CFC9BC',
        },
        /** Testi. Mai nero puro: grigio-blu molto scuro. */
        ink: {
          DEFAULT: '#16232A',
          soft: '#3A4A52',
          muted: '#5D6C74',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Corpo generoso: parte del pubblico dello studio non ha vent'anni.
        'body-sm': ['1rem', { lineHeight: '1.6' }],
        body: ['1.125rem', { lineHeight: '1.7' }], // 18px
        'body-lg': ['1.25rem', { lineHeight: '1.65' }],
        'title-xs': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        'title-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'title-md': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'title-lg': ['2.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title-xl': ['3rem', { lineHeight: '1.12', letterSpacing: '-0.022em' }],
        'display': ['3.75rem', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        /** Sopratitoli in maiuscoletto spaziato — l'unico vezzo tipografico concesso. */
        eyebrow: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },
      spacing: {
        section: '5.5rem',
        'section-lg': '7.5rem',
      },
      maxWidth: {
        prose: '68ch',
        container: '75rem',
      },
      borderRadius: {
        // Angoli quasi retti: la sobrietà passa anche da qui.
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
      },
      transitionDuration: {
        // Solo transizioni brevi e discrete.
        DEFAULT: '160ms',
      },
      backgroundImage: {
        /** Texture di carta appena percettibile. Se appesantisce, si toglie da qui. */
        paperGrain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
