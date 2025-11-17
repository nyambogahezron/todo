import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import { themes, ThemeName, ThemeType } from '../constants/Colors';

interface ThemeContextType {
	themeName: ThemeName;
	setTheme: (theme: ThemeName) => Promise<void>;
	toggleTheme: () => Promise<void>;
	themeClrs: ThemeType;
	isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
	themeName: 'light',
	setTheme: async () => {},
	toggleTheme: async () => {},
	themeClrs: themes.light,
	isDarkMode: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const deviceTheme = useColorScheme();
	const [themeName, setThemeName] = useState<ThemeName>('light');

	useEffect(() => {
		const loadTheme = async () => {
			const storedTheme = await AsyncStorage.getItem('user-theme');
			if (storedTheme && storedTheme in themes) {
				setThemeName(storedTheme as ThemeName);
			} else {
				// Default to device theme if available
				const defaultTheme = deviceTheme === 'dark' ? 'dark' : 'light';
				setThemeName(defaultTheme);
			}
		};
		loadTheme();
	}, [deviceTheme]);

	const setTheme = async (theme: ThemeName) => {
		setThemeName(theme);
		await AsyncStorage.setItem('user-theme', theme);
	};

	const toggleTheme = async () => {
		const newTheme = themeName === 'light' ? 'dark' : 'light';
		await setTheme(newTheme);
	};

	const themeClrs = themes[themeName];
	const isDarkMode = themeName === 'dark';

	return (
		<ThemeContext.Provider 
			value={{ 
				themeName, 
				setTheme, 
				toggleTheme, 
				themeClrs,
				isDarkMode
			}}
		>
			<PaperProvider theme={themeClrs}>{children}</PaperProvider>
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
