import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        base:     '#05050F',
        surface:  '#0A0A1A',
        elevated: '#0F0F22',

        // Brand accent — electric cyan
        accent: {
          DEFAULT: '#0EA5E9',
          bright:  '#38BDF8',
          dim:     'rgba(14,165,233,0.15)',
          glow:    'rgba(14,165,233,0.3)',
        },

        // Score colors
        score: {
          critical: '#FF453A',
          high:     '#FF6B35',
          medium:   '#FF9F0A',
          low:      '#30D158',
        },

        // Text
        ink: {
          DEFAULT: '#F0F4FF',
          muted:   '#7A8BB5',
          faint:   '#3D4A6B',
        },
      },
      fontFamily: {
        sans:  ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        body:  ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'28px',
        '3xl':'36px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-lines': `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      boxShadow: {
        'glow-accent':   '0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(14,165,233,0.1)',
        'glow-critical': '0 0 16px rgba(255,69,58,0.35)',
        'glow-high':     '0 0 16px rgba(255,107,53,0.3)',
        'glow-medium':   '0 0 16px rgba(255,159,10,0.28)',
        'card':          '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':    '0 1px 0 rgba(255,255,255,0.07), 0 12px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-up':     'fadeUp 0.4s ease both',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
        'count-up':    'countUp 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(14,165,233,0.3)' },
          '50%':       { boxShadow: '0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.15)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
