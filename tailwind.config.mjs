/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta iOS 18
        ios: {
          background: '#F5F5F7',
          surface: '#FFFFFF',
          label: {
            primary: '#1D1D1F',
            secondary: '#86868B',
            tertiary: '#C7C7CC',
          },
          blue: {
            light: '#E5F2FF',
            DEFAULT: '#007AFF',
            dark: '#0051D5',
          },
          green: {
            light: '#E8F5E9',
            DEFAULT: '#34C759',
            dark: '#248A3D',
          },
          orange: {
            light: '#FFF3E0',
            DEFAULT: '#FF9500',
            dark: '#C93400',
          },
          red: {
            light: '#FFEBEE',
            DEFAULT: '#FF3B30',
            dark: '#D70015',
          },
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#1D1D1F',
          },
        },
      },
      boxShadow: {
        'ios-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'ios': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'ios-xl': '0 20px 48px 0 rgba(0, 0, 0, 0.16)',
      },
      borderRadius: {
        'ios-sm': '12px',
        'ios': '16px',
        'ios-lg': '20px',
        'ios-xl': '24px',
        'ios-2xl': '32px',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-lg': '40px',
      },
    },
  },
  plugins: [],
}
