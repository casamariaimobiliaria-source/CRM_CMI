/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Luxury Premium Palette
                gold: {
                    50: '#FBF8F1',
                    100: '#F5E6C3',
                    200: '#EED494',
                    300: '#E6C266',
                    400: '#D4AF37', // Royal Gold
                    500: '#AA8C2C',
                    600: '#806921',
                    700: '#554616',
                    800: '#2B230B',
                    900: '#000000',
                },
                platinum: {
                    50: '#F8F9FA',
                    100: '#E9ECEF',
                    200: '#DEE2E6',
                    300: '#CED4DA',
                    400: '#ADB5BD', // Burnished Silver
                    500: '#6C757D',
                    600: '#495057',
                    700: '#343A40',
                    800: '#212529',
                    900: '#121212',
                },
                premium: {
                    black: '#020202', // Obsidian Black
                    dark: '#0A0A0A',  // Onyx
                    gray: '#121212',  // Graphite
                    surface: '#181818', // Coal
                }
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: "calc(var(--radius) - 4px)",
            },
            borderWidth: {
                '3': '3px',
                '4': '4px',
            },
            fontFamily: {
                // Display - Headers & Titles (Premium Serif)
                display: ['"Playfair Display"', 'serif'],
                // Serif - More classic luxury
                luxury: ['"Cormorant Garamond"', 'serif'],
                // Sans - Body Text (Modern Clean)
                sans: ['"Inter"', 'sans-serif'],
                // Mono
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'glow-gold': '0 0 20px rgba(184, 134, 11, 0.15)',
                'glow-platinum': '0 0 20px rgba(229, 229, 229, 0.1)',
                'luxury-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
                'premium-nav': '0 -10px 40px -10px rgba(0, 0, 0, 0.8)',
            },
            letterSpacing: {
                'ultra-wide': '0.2em',
                'tighter': '-0.02em',
                'tight': '-0.01em',
            },
            borderWidth: {
                'hairline': '0.5px',
            }
        },
    },
    plugins: [],
}
