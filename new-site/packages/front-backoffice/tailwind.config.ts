import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

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
			colors: {
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
			},
			fontFamily: {
				sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
				poppins: ["Poppins", ...defaultTheme.fontFamily.sans],
				comfortaa: ["Comfortaa", ...defaultTheme.fontFamily.sans],
			},
			borderRadius: {
				lg: "0.75rem",
				xl: "1rem",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("tailwindcss-animate"),
	],
};

export default config;
