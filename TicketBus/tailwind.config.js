/* eslint-disable no-undef */
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
		
				primary: '#374459',
				primaryblue: '#c5deff',

		
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

			
				shadcn: {
					primary: "hsl(var(--primary))",
					"primary-foreground": "hsl(var(--primary-foreground))",
					secondary: "hsl(var(--secondary))",
					"secondary-foreground": "hsl(var(--secondary-foreground))",
					muted: "hsl(var(--muted))",
					"muted-foreground": "hsl(var(--muted-foreground))",
					accent: "hsl(var(--accent))",
					"accent-foreground": "hsl(var(--accent-foreground))",
					destructive: "hsl(var(--destructive))",
					"destructive-foreground": "hsl(var(--destructive-foreground))",
					success: "hsl(var(--success))",
					"success-foreground": "hsl(var(--success-foreground))",
				},

			
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: "0.5rem",
				md: "0.375rem",
				sm: "0.25rem",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
