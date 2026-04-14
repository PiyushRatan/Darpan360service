/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // We use Inter as the primary technical font
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep charcoal/near black background theme
        builder: {
          900: '#111111', // Deepest background
          800: '#1E1E1E', // Panel/Card background
          700: '#2A2A2A', // Hover states
          border: '#333333', // Thin precise borders
        },
        // Muted accent color: Steel Cyan
        accent: {
          500: '#06b6d4', // Primary interactable state
          600: '#0891b2', // Hover state
        }
      },
      borderRadius: {
        // Enforcing sharp/slightly rounded corners ONLY
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '6px', // Purposely overriding large rounding
        xl: '6px',
        '2xl': '6px',
        '3xl': '6px',
      },
      boxShadow: {
        // Removing heavy/fluffy shadows, replacing with subtle elevation
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
