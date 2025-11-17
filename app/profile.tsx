import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Profile() {
	const { user, logOut } = useAuth();

	const handleLogout = async () => {
		Alert.alert(
			'Logout',
			'Are you sure you want to logout?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Logout',
					style: 'destructive',
					onPress: async () => {
						try {
							await logOut();
							router.replace('/auth/login');
						} catch (error) {
							console.error('Logout error:', error);
							Alert.alert('Error', 'Failed to logout');
						}
					},
				},
			]
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			<View style={styles.content}>
				<View style={styles.profileSection}>
					<View style={styles.avatarContainer}>
						<Text style={styles.avatarText}>
							{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
						</Text>
					</View>
					
					<Text style={styles.name}>
						{user?.displayName || 'User'}
					</Text>
					<Text style={styles.email}>{user?.email}</Text>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.sectionTitle}>Account Information</Text>
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>User ID:</Text>
						<Text style={styles.infoValue}>{user?.uid.substring(0, 20)}...</Text>
					</View>
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>Email Verified:</Text>
						<Text style={styles.infoValue}>
							{user?.emailVerified ? 'Yes' : 'No'}
						</Text>
					</View>
				</View>

				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	content: {
		flex: 1,
		padding: 24,
	},
	profileSection: {
		alignItems: 'center',
		marginTop: 40,
		marginBottom: 40,
	},
	avatarContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	avatarText: {
		fontSize: 40,
		color: '#fff',
		fontWeight: 'bold',
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#000',
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
		color: '#666',
	},
	infoSection: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	infoLabel: {
		fontSize: 14,
		color: '#666',
	},
	infoValue: {
		fontSize: 14,
		color: '#000',
		fontWeight: '500',
	},
	logoutButton: {
		backgroundColor: '#FF3B30',
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		marginTop: 'auto',
	},
	logoutText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
