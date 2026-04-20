import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindForms from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
		"../../**/src/**/*.{js,ts,jsx,tsx}",
		"../../../**/src/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: "class",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1rem",
				sm: "1.5rem",
				lg: "2.5rem",
			},
		},
		extend: {
			// ==================== CORES ====================
			colors: {
				// Paleta semcomp
				semcomp: {
					50: "var(--semcomp-primary-50)",
					100: "var(--semcomp-primary-100)",
					200: "var(--semcomp-primary-200)",
					300: "var(--semcomp-primary-300)",
					400: "var(--semcomp-primary-400)",
					500: "var(--semcomp-primary-500)",
					600: "var(--semcomp-primary-600)",
					700: "var(--semcomp-primary-700)",
					800: "var(--semcomp-primary-800)",
					900: "var(--semcomp-primary-900)",
				},
				// Cores base semânticas (light/dark aware via CSS)
				border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
				card: "var(--card)",
				"card-foreground": "var(--card-foreground)",
				primary: "var(--primary)",
				"primary-foreground": "var(--primary-foreground)",
				secondary: "var(--secondary)",
				"secondary-foreground": "var(--secondary-foreground)",
				muted: "var(--muted)",
				"muted-foreground": "var(--muted-foreground)",
				accent: "var(--accent)",
				"accent-foreground": "var(--accent-foreground)",
				destructive: "var(--destructive)",
				// UI extras
				popover: "var(--popover)",
				"popover-foreground": "var(--popover-foreground)",
				sidebar: "var(--sidebar)",
				"sidebar-foreground": "var(--sidebar-foreground)",
				"sidebar-primary": "var(--sidebar-primary)",
				"sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
				"sidebar-accent": "var(--sidebar-accent)",
				"sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
				"sidebar-border": "var(--sidebar-border)",
				"sidebar-ring": "var(--sidebar-ring)",
			},

			// ==================== TIPOGRAFIA ====================
			fontFamily: {
				sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
				poppins: ["Poppins", ...defaultTheme.fontFamily.sans],
				comfortaa: ["Comfortaa", ...defaultTheme.fontFamily.sans],
			},

			// ==================== TAMANHOS ====================
			borderRadius: {
				sm: "calc(var(--radius) * 0.6)",
				md: "calc(var(--radius) * 0.8)",
				lg: "calc(var(--radius) * 1)",
				xl: "calc(var(--radius) * 1.4)",
				"2xl": "calc(var(--radius) * 1.8)",
				"3xl": "calc(var(--radius) * 2.2)",
				"4xl": "calc(var(--radius) * 2.6)",
			},

			// ==================== ESPAÇAMENTO && SIZING ====================
			spacing: {
				xs: "0.375rem",
				sm: "0.5rem",
				md: "1rem",
				lg: "1.5rem",
				xl: "2rem",
				"2xl": "3rem",
			},

			// ==================== SOMBRAS ====================
			boxShadow: {
				"ring-primary": "0 0 0 3px var(--ring)",
			},

			// ==================== ANIMAÇÕES ====================
			keyframes: {
				slide: {
					from: { opacity: "0", transform: "translateX(60px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
			},
			animation: {
				slide: "slide 1s ease",
			},
		},
	},
	plugins: [tailwindForms, tailwindTypography, tailwindAnimate],
};

export default config;
