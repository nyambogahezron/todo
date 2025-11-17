import { DefaultTheme } from 'react-native-paper';

// Light Theme (Default)
export const lightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#3498db',
		accent: '#f1c40f',
		background: '#ffffff',
		surface: '#f2f2f2',
		text: '#000000',
		textMuted: '#808080',
		textGrey: '#696f71',
		onSurfaceVariant: '#000000',
		border: '#f2f2f2',
		notification: '#3498db',
		card: '#f4f9fc',
		secondary: '#3498db',
	},
};

// Dark Theme
export const darkTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#3498db',
		accent: '#f1c40f',
		background: '#000000',
		surface: '#121212',
		text: '#ffffff',
		textMuted: '#333333',
		textGrey: '#808080',
		onSurfaceVariant: '#ffffff',
		border: '#121212',
		notification: '#3498db',
		card: '#121212',
		secondary: '#3498db',
	},
};

// Blue Theme
export const blueTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#2563eb',
		accent: '#3b82f6',
		background: '#f0f9ff',
		surface: '#e0f2fe',
		text: '#1e3a8a',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#1e3a8a',
		border: '#bfdbfe',
		notification: '#2563eb',
		card: '#dbeafe',
		secondary: '#3b82f6',
	},
};

// Green Theme
export const greenTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#16a34a',
		accent: '#22c55e',
		background: '#f0fdf4',
		surface: '#dcfce7',
		text: '#14532d',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#14532d',
		border: '#bbf7d0',
		notification: '#16a34a',
		card: '#d1fae5',
		secondary: '#22c55e',
	},
};

// Purple Theme
export const purpleTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#7c3aed',
		accent: '#a78bfa',
		background: '#faf5ff',
		surface: '#f3e8ff',
		text: '#4c1d95',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#4c1d95',
		border: '#ddd6fe',
		notification: '#7c3aed',
		card: '#ede9fe',
		secondary: '#a78bfa',
	},
};

// Pink Theme
export const pinkTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#db2777',
		accent: '#ec4899',
		background: '#fdf2f8',
		surface: '#fce7f3',
		text: '#831843',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#831843',
		border: '#fbcfe8',
		notification: '#db2777',
		card: '#fce7f3',
		secondary: '#ec4899',
	},
};

// Orange Theme
export const orangeTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#ea580c',
		accent: '#f97316',
		background: '#fff7ed',
		surface: '#ffedd5',
		text: '#7c2d12',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#7c2d12',
		border: '#fed7aa',
		notification: '#ea580c',
		card: '#ffedd5',
		secondary: '#f97316',
	},
};

// Teal Theme
export const tealTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#0d9488',
		accent: '#14b8a6',
		background: '#f0fdfa',
		surface: '#ccfbf1',
		text: '#134e4a',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#134e4a',
		border: '#99f6e4',
		notification: '#0d9488',
		card: '#ccfbf1',
		secondary: '#14b8a6',
	},
};

// Rose Theme
export const roseTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#e11d48',
		accent: '#f43f5e',
		background: '#fff1f2',
		surface: '#ffe4e6',
		text: '#881337',
		textMuted: '#64748b',
		textGrey: '#475569',
		onSurfaceVariant: '#881337',
		border: '#fecdd3',
		notification: '#e11d48',
		card: '#ffe4e6',
		secondary: '#f43f5e',
	},
};

export const themes = {
	light: lightTheme,
	dark: darkTheme,
	blue: blueTheme,
	green: greenTheme,
	purple: purpleTheme,
	pink: pinkTheme,
	orange: orangeTheme,
	teal: tealTheme,
	rose: roseTheme,
};

export type ThemeName = keyof typeof themes;

export type ThemeType = typeof lightTheme;

export type lightThemeTypes = typeof lightTheme;

export type darkThemeTypes = typeof darkTheme;
