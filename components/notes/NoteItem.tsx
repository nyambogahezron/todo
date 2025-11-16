import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
	Text,
	Card,
	Chip,
	Divider,
	useTheme,
	IconButton,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { formatDateTime } from '../../utils/dateUtils';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import NoteEditor from './NoteEditor';
import { Note } from '../../store/models';
import { useNote, useDeleteNote } from '../../store/notes.prisma';

const NoteItem: React.FC = () => {
	const theme = useTheme();
	const navigation = useNavigation<any>();
	const params = useLocalSearchParams<{ id: string }>();
	const id = params.id || (useRoute<any>().params?.id as string);

	const note = useNote(id);
	const deleteNote = useDeleteNote();
	const [isEditing, setIsEditing] = useState(false);
	const loading = !note && id;
	const error = !note && id ? new Error('Note not found') : null;

	const handleDelete = () => {
		Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteNote(id);
						navigation.goBack();
					} catch (error) {
						console.error('Error deleting note:', error);
						Alert.alert('Error', 'Failed to delete note');
					}
				},
			},
		]);
	};

	const wrapContentWithHtml = (content: string) => {
		return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            padding: 0;
            margin: 0;
            color: ${theme.dark ? '#fff' : '#000'};
            background-color: ${theme.dark ? '#121212' : '#fff'};
          }
          img {
            max-width: 100%;
            height: auto;
          }
          a {
            color: ${theme.colors.primary};
          }
          pre, code {
            background-color: ${theme.dark ? '#2d2d2d' : '#f5f5f5'};
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
          }
          blockquote {
            border-left: 4px solid ${theme.colors.primary};
            padding-left: 16px;
            margin-left: 0;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
	};

	if (loading) {
		return <LoadingIndicator message='Loading note...' />;
	}

	if (error) {
		return <ErrorDisplay error={error} retry={() => {}} />;
	}

	if (!note) {
		return (
			<ErrorDisplay
				error={new Error('Note not found')}
				retry={() => navigation.goBack()}
			/>
		);
	}

	if (isEditing) {
		return <NoteEditor note={note} onSave={() => setIsEditing(false)} />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Text style={styles.title}>{note.title}</Text>
				<View style={styles.headerButtons}>
					<IconButton
						icon='pencil'
						size={20}
						onPress={() => setIsEditing(true)}
					/>
					<IconButton
						icon='delete'
						size={20}
						onPress={handleDelete}
						iconColor={theme.colors.error}
					/>
				</View>
			</View>

			{note.tags && note.tags.length > 0 && (
				<View style={styles.tagsContainer}>
					{note.tags.map((tag, index) => (
						<Chip key={index} style={styles.tag}>
							{tag}
						</Chip>
					))}
				</View>
			)}

			<Divider style={styles.divider} />

			<View style={styles.contentContainer}>
				<WebView
					originWhitelist={['*']}
					source={{ html: wrapContentWithHtml(note.content) }}
					style={styles.webView}
					scrollEnabled={true}
					javaScriptEnabled={true}
					domStorageEnabled={true}
				/>
			</View>

			<Card style={styles.footerCard}>
				<Card.Content>
					<Text style={styles.dateInfo}>
						Created: {formatDateTime(note.createdAt)}
					</Text>
					<Text style={styles.dateInfo}>
						Last Updated: {formatDateTime(note.updatedAt)}
					</Text>
				</Card.Content>
			</Card>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	headerButtons: {
		flexDirection: 'row',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		flex: 1,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 16,
	},
	tag: {
		marginRight: 8,
		marginBottom: 8,
	},
	divider: {
		marginBottom: 16,
	},
	contentContainer: {
		flex: 1,
		marginBottom: 16,
	},
	webView: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	footerCard: {
		marginBottom: 16,
	},
	dateInfo: {
		fontSize: 12,
		opacity: 0.7,
		marginVertical: 2,
	},
});

export default NoteItem;
