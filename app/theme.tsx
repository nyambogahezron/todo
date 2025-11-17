import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, RadioButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { ThemeName } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function Theme() {
	const { themeName, setTheme, themeClrs, isDarkMode } = useTheme();

	const themeOptions: { 
		label: string; 
		value: ThemeName; 
		color: string;
		description: string;
	}[] = [
		{ 
			label: 'Light', 
			value: 'light', 
			color: '#ffffff',
			description: 'Clean and bright theme'
		},
		{ 
			label: 'Dark', 
			value: 'dark', 
			color: '#000000',
			description: 'Easy on the eyes at night'
		},
		{ 
			label: 'Blue', 
			value: 'blue', 
			color: '#2563eb',
			description: 'Cool and professional'
		},
		{ 
			label: 'Green', 
			value: 'green', 
			color: '#16a34a',
			description: 'Fresh and natural'
		},
		{ 
			label: 'Purple', 
			value: 'purple', 
			color: '#7c3aed',
			description: 'Creative and vibrant'
		},
		{ 
			label: 'Pink', 
			value: 'pink', 
			color: '#db2777',
			description: 'Playful and energetic'
		},
		{ 
			label: 'Orange', 
			value: 'orange', 
			color: '#ea580c',
			description: 'Warm and inviting'
		},
		{ 
			label: 'Teal', 
			value: 'teal', 
			color: '#0d9488',
			description: 'Calm and balanced'
		},
		{ 
			label: 'Rose', 
			value: 'rose', 
			color: '#e11d48',
			description: 'Elegant and bold'
		},
	];

	const handleThemeChange = async (selectedTheme: ThemeName) => {
		await setTheme(selectedTheme);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: themeClrs.colors.background }]}>
			<StatusBar
				style={isDarkMode ? 'light' : 'dark'}
				backgroundColor={themeClrs.colors.background}
			/>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text variant="headlineMedium" style={[styles.title, { color: themeClrs.colors.text }]}>
						Choose Your Theme
					</Text>
					<Text variant="bodyMedium" style={[styles.subtitle, { color: themeClrs.colors.textGrey }]}>
						Select a color scheme that suits your style
					</Text>
				</View>

				<RadioButton.Group
					onValueChange={(value) => handleThemeChange(value as ThemeName)}
					value={themeName}
				>
					{themeOptions.map((option, index) => (
						<View key={option.value}>
							<Card 
								style={[
									styles.themeCard,
									{ 
										backgroundColor: themeClrs.colors.surface,
										borderColor: themeName === option.value ? themeClrs.colors.primary : themeClrs.colors.border,
										borderWidth: themeName === option.value ? 2 : 1,
									}
								]}
								onPress={() => handleThemeChange(option.value)}
							>
								<Card.Content style={styles.cardContent}>
									<View style={styles.themeInfo}>
										<View
											style={[
												styles.colorCircle,
												{ 
													backgroundColor: option.color,
													borderColor: themeClrs.colors.border,
												}
											]}
										/>
										<View style={styles.themeText}>
											<Text variant="titleMedium" style={{ color: themeClrs.colors.text }}>
												{option.label}
											</Text>
											<Text variant="bodySmall" style={{ color: themeClrs.colors.textGrey }}>
												{option.description}
											</Text>
										</View>
									</View>
									<RadioButton 
										value={option.value} 
										color={themeClrs.colors.primary}
									/>
								</Card.Content>
							</Card>
							{index < themeOptions.length - 1 && (
								<Divider style={{ marginVertical: 8 }} />
							)}
						</View>
					))}
				</RadioButton.Group>

				<View style={styles.footer}>
					<Text variant="bodySmall" style={[styles.footerText, { color: themeClrs.colors.textMuted }]}>
						Your theme preference will be saved automatically
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
		padding: 16,
	},
	header: {
		marginBottom: 24,
		paddingHorizontal: 4,
	},
	title: {
		fontWeight: 'bold',
		marginBottom: 8,
	},
	subtitle: {
		marginBottom: 4,
	},
	themeCard: {
		marginVertical: 4,
		elevation: 2,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	themeInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	colorCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 16,
		borderWidth: 2,
	},
	themeText: {
		flex: 1,
	},
	footer: {
		marginTop: 24,
		marginBottom: 16,
		alignItems: 'center',
	},
	footerText: {
		textAlign: 'center',
	},
});
