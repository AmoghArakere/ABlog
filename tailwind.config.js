/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e293b", // slate-800
          dark: "#0f172a", // slate-900
          light: "#334155", // slate-700
        },
        secondary: {
          DEFAULT: "#475569", // slate-600
          dark: "#334155", // slate-700
          light: "#64748b", // slate-500
        },
        accent: {
          DEFAULT: "#3b82f6", // blue-500
          dark: "#1d4ed8", // blue-700
          light: "#60a5fa", // blue-400
        },
        success: "#10b981", // emerald-500
        warning: "#f59e0b", // amber-500
        danger: "#ef4444", // red-500
        background: {
          DEFAULT: "#000000",
          dark: "#111111",
        },
        text: {
          DEFAULT: "#111827", // gray-900
          muted: "#6b7280", // gray-500
          light: "#9ca3af", // gray-400
          dark: {
            DEFAULT: "#f3f4f6", // gray-100
            muted: "#d1d5db", // gray-300
            light: "#e5e7eb", // gray-200
          },
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "bounce-slow": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        "glow": {
          '0%': { boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
        },
        "shimmer": {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  darkMode: 'class',
}
