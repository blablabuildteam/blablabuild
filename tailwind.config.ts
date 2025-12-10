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
  			],
  			'host': [
  				'Host Grotesk',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			// Core Brand Colors
  			bla: {
  				lime: 'var(--bla-lime)',
  				blue: 'var(--bla-blue)',
  				dark: 'var(--bla-dark)',
  				charcoal: 'var(--bla-charcoal)',
  				'charcoal-light': 'var(--bla-charcoal-light)',
  				'charcoal-border': 'var(--bla-charcoal-border)',
  				gray: 'var(--bla-gray)',
  				'gray-light': 'var(--bla-gray-light)',
  				border: 'var(--bla-border)',
  				'text-light': 'var(--bla-text-light)',
  				'text-muted': 'var(--bla-text-muted)',
  				lavender: 'var(--bla-lavender)',
  			},
  			// Semantic Chat Colors
  			chat: {
  				'user-bg': 'var(--chat-user-bg)',
  				'user-text': 'var(--chat-user-text)',
  				'user-border': 'var(--chat-user-border)',
  				'assistant-bg': 'var(--chat-assistant-bg)',
  				'assistant-text': 'var(--chat-assistant-text)',
  				'assistant-border': 'var(--chat-assistant-border)',
  				'input-bg': 'var(--chat-input-bg)',
  				'input-border': 'var(--chat-input-border)',
  				'header-bg': 'var(--chat-header-bg)',
  			},
  			// Surface Colors
  			surface: {
  				DEFAULT: 'var(--surface)',
  				elevated: 'var(--surface-elevated)',
  				overlay: 'var(--surface-overlay)',
  				glass: 'var(--surface-glass)',
  			},
  			// Text Colors
  			text: {
  				primary: 'var(--text-primary)',
  				secondary: 'var(--text-secondary)',
  				muted: 'var(--text-muted)',
  				inverse: 'var(--text-inverse)',
  			},
  			// Card Colors
  			'card-border': 'var(--card-border)',
  			'card-bg': 'var(--card-bg)',
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
			'slide-left': 'slideLeft 0.4s ease-out',
			'zoom-out-in': 'zoomOutIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
			'zoom-out-out': 'zoomOutOut 0.15s ease-in',
			"border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
			marquee: "marquee var(--duration) linear infinite",
			"marquee-vertical": "marquee-vertical var(--duration) linear infinite",
			scroll: "scroll var(--animation-duration, 20s) linear infinite",
		},
		keyframes: {
			marquee: {
				from: { transform: "translateX(0)" },
				to: { transform: "translateX(calc(-100% - var(--gap)))" },
			},
			"marquee-vertical": {
				from: { transform: "translateY(0)" },
				to: { transform: "translateY(calc(-100% - var(--gap)))" },
			},
			scroll: {
				from: { transform: "translateX(0)" },
				to: { transform: "translateX(calc(-50%))" },
			},
			"border-beam": {
				"100%": {
					"offset-distance": "100%",
				},
			},
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
			},
			zoomOutIn: {
				'0%': {
					transform: 'scale(1.15)',
					opacity: '0'
				},
				'100%': {
					transform: 'scale(1)',
					opacity: '1'
				}
			},
			zoomOutOut: {
				'0%': {
					transform: 'scale(1)',
					opacity: '1'
				},
				'100%': {
					transform: 'scale(1.1)',
					opacity: '0'
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

