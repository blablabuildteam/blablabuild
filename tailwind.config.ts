import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			'loopy-sans': [
  				'Meldina',
  				'sans-serif'
  			],
  			sans: [
  				'Matter',
  				'system-ui',
  				'sans-serif'
  			],
  			thin: [
  				'Matter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			bla: {
  				lime: '#CEFF00',
  				dark: '#0a0a0a',
  				charcoal: '#1a1a1a',
  				'charcoal-light': '#2a2a2a',
  				'charcoal-border': '#333333',
  				gray: '#f9fafb',
  				'gray-light': '#f3f4f6',
  				border: '#e5e7eb',
  				'text-light': '#e5e5e5',
  				'text-muted': '#999999'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontWeight: {
  			thin: '100',
  			extralight: '200',
  			light: '300'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in',
  			'slide-up': 'slideUp 0.4s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'slide-left': 'slideLeft 0.4s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			slideLeft: {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		spacing: {
			'nav': '60px',
			'content': '120px',
			'mobile-x': '16px',
			'card-padding': '24px'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

