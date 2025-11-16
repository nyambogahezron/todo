import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native';
import {
	TextInput,
	Button,
	useTheme,
	Text,
	Chip,
	Portal,
	Dialog,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getCurrentTimestamp } from '../../utils/dateUtils';
import {
	actions,
	RichEditor,
	RichToolbar,
} from 'react-native-pell-rich-editor';
import { Note } from '../../store/models';
import { useAddNote, useUpdateNote } from '../../store/notes.prisma';

interface NoteEditorProps {
	note?: Note;
	onSave?: (formData?: any) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave }) => {
	const navigation = useNavigation();
	const theme = useTheme();
	const isEditing = !!note;
	const addNote = useAddNote();
	const updateNote = useUpdateNote();

	const richText = React.useRef<RichEditor>(null);

	// Form state
	const [title, setTitle] = useState(note?.title || '');
	const [content, setContent] = useState(note?.content || '');
	const [tags, setTags] = useState<string[]>(note?.tags || []);
	const [newTag, setNewTag] = useState('');
	const [showTagDialog, setShowTagDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert('Error', 'Title is required');
			return;
		}

		try {
			setIsSubmitting(true);

			if (isEditing && note) {
				// Update existing note
				await updateNote(note.id, {
					title,
					content,
					tags,
				});
			} else {
				// Create new note
				await addNote({
					title,
					content,
					tags,
				});
			}

			if (onSave) {
				onSave({
					title,
					content,
					tags,
				});
			} else {
				navigation.goBack();
			}
		} catch (error) {
			console.error('Error saving note:', error);
			Alert.alert('Error', 'Failed to save note');
		} finally {
			setIsSubmitting(false);
		}
	};

	const addTag = () => {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			setTags([...tags, newTag.trim()]);
		}
		setNewTag('');
		setShowTagDialog(false);
	};

	const removeTag = (index: number) => {
		const newTags = [...tags];
		newTags.splice(index, 1);
		setTags(newTags);
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView style={styles.container}>
				<TextInput
					label='Title *'
					value={title}
					onChangeText={setTitle}
					mode='outlined'
					style={styles.titleInput}
				/>

				<Text style={styles.sectionTitle}>Content</Text>
				<View style={styles.editorContainer}>
					<RichToolbar
						editor={richText}
						selectedIconTint={theme.colors.primary}
						iconTint={theme.colors.onSurface}
						actions={[
							actions.setBold,
							actions.setItalic,
							actions.setUnderline,
							actions.heading1,
							actions.heading2,
							actions.insertBulletsList,
							actions.insertOrderedList,
							actions.insertLink,
							actions.setStrikethrough,
							actions.blockquote,
							actions.alignLeft,
							actions.alignCenter,
							actions.alignRight,
						]}
						style={styles.toolbar}
					/>
					<RichEditor
						ref={richText}
						initialContentHTML={content}
						onChange={(newContent) => setContent(newContent)}
						placeholder='Start writing your note here...'
						style={styles.editor}
						containerStyle={styles.editorContainer}
					/>
				</View>

				<Text style={styles.sectionTitle}>Tags</Text>
				<View style={styles.tagsContainer}>
					{tags.map((tag, index) => (
						<Chip
							key={index}
							onClose={() => removeTag(index)}
							style={styles.tag}
						>
							{tag}
						</Chip>
					))}
					<Button
						icon='plus'
						mode='outlined'
						onPress={() => setShowTagDialog(true)}
						style={tags.length > 0 ? styles.addTagButton : {}}
					>
						Add Tag
					</Button>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						mode='contained'
						onPress={handleSave}
						loading={isSubmitting}
						disabled={isSubmitting || !title.trim()}
						style={styles.button}
					>
						{isEditing ? 'Update' : 'Create'} Note
					</Button>

					<Button
						mode='outlined'
						onPress={() => {
							if (onSave) {
								onSave({
									title,
									content,
									tags,
								});
							} else {
								navigation.goBack();
							}
						}}
						style={[styles.button, styles.cancelButton]}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</View>
			</ScrollView>

			<Portal>
				<Dialog
					visible={showTagDialog}
					onDismiss={() => setShowTagDialog(false)}
				>
					<Dialog.Title>Add Tag</Dialog.Title>
					<Dialog.Content>
						<TextInput
							label='Tag Name'
							value={newTag}
							onChangeText={setNewTag}
							mode='outlined'
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setShowTagDialog(false)}>Cancel</Button>
						<Button onPress={addTag} disabled={!newTag.trim()}>
							Add
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	titleInput: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '500',
		marginTop: 8,
		marginBottom: 8,
	},
	editorContainer: {
		height: 300,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
	},
	toolbar: {
		backgroundColor: '#f5f5f5',
	},
	editor: {
		flex: 1,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 24,
	},
	tag: {
		margin: 4,
	},
	addTagButton: {
		margin: 4,
	},
	buttonContainer: {
		marginTop: 16,
		marginBottom: 32,
	},
	button: {
		marginBottom: 12,
	},
	cancelButton: {
		marginBottom: 24,
	},
});

export default NoteEditor;
