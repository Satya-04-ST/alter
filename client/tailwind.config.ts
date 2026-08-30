import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#06080d',
          900: '#0b0f19',
          850: '#101726',
          800: '#17223b',
          700: '#233357',
        },
        persona: {
          advisor: '#8b5cf6', // Indigo / Violet
          librarian: '#10b981', // Emerald / Mint
          tutor: '#0ea5e9', // Cyan / Electric Blue
          editor: '#f59e0b', // Amber / Gold
          roommate: '#f43f5e', // Rose / Neon Pink
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#00f0ff',
        },
      },
      boxShadow: {
        'glow-advisor': '0 0 20px -3px rgba(139, 92, 246, 0.4)',
        'glow-librarian': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'glow-tutor': '0 0 20px -3px rgba(14, 165, 233, 0.4)',
        'glow-editor': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-roommate': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
