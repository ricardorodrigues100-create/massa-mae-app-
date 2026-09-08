import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        crosta: '#14100C', // fundo — crosta escura
        farinha: '#F2E9DA', // texto principal — papel/farinha
        seca: '#A89A85', // texto secundário — massa seca
        levain: '#D4A017', // acento — dourado, bolhas ativas
        perigo: '#8B3A3A', // aviso — vermelho tijolo
        sucesso: '#6B8F71', // confirmação — verde salva
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
