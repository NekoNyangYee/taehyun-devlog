import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				/* 시맨틱 토큰 — hsl(var(--token)) 패턴 */
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
				like: {
					DEFAULT: 'hsl(var(--like))',
					foreground: 'hsl(var(--like-foreground))',
					bg: 'hsl(var(--like-bg))',
					border: 'hsl(var(--like-border))'
				},
				action: {
					DEFAULT: 'hsl(var(--action))',
					foreground: 'hsl(var(--action-foreground))',
					hover: 'hsl(var(--action-hover))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))'
			},
			width: {
				profileImage: 'var(--width-profile-image)'
			},
			height: {
				profileImage: 'var(--height-profile-image)'
			},
			backgroundColor: {
				kakao: 'var(--background-color-kakaologin)',
				google: 'var(--background-color-googlelogin)',
				navButton: 'var(--background-color-nav-button)',
				logoutButton: 'var(--background-color-nav-logout)',
				searchInput: 'var(--background-color-input)',
				editButton: 'var(--background-color-edit)',
				switchedPublicButton: 'var(--background-color-switch-public)',
				switchedPrivateButton: 'var(--background-color-switch-private)'
			},
			borderColor: {
				containerColor: 'var(--border-color-container)',
				logoutColor: 'var(--border-color-logout)',
				searchInput: 'var(--border-color-input)',
				editButton: 'var(--border-color-edit)',
				switchedPublic: 'var(--border-color-switch-public)',
				switchedPrivate: 'var(--border-color-switch-private)'
			},
			borderRadius: {
				button: 'var(--radius-button)',
				container: 'var(--radius-container)'
			},
			padding: {
				button: 'var(--padding-button)',
				container: 'var(--padding-container)'
			},
			fontSize: {
				mainTitle: 'var(--text-size-main-title)',
				containerTitle: 'var(--text-size-container-title)',
				statisticTitle: 'var(--text-size-statistical-container-title)'
			},
			textColor: {
				logoutText: 'var(--text-color-logout)',
				metricsText: 'var(--text-color-metrics)',
				addButton: 'var(--text-color-button)',
				editButton: 'var(--text-color-edit)',
				switchedPublic: 'var(--text-color-switch-public)',
				switchedPrivate: 'var(--text-color-switch-private)'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px'
			},
			maxWidth: {
				'custom-3xl': '1580px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				aurora: {
					from: {
						backgroundPosition: '50% 50%, 50% 50%'
					},
					to: {
						backgroundPosition: '350% 50%, 350% 50%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				aurora: 'aurora 60s linear infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;