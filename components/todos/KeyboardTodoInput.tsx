import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, ScrollView, Modal, Animated, Easing } from 'react-native';
import { Text, useTheme, Button, IconButton, Chip, List } from 'react-native-paper';
import { Plus, Calendar, Clock, Flag, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAddTodo } from '@/store/todo';
import useGenerateId from '@/utils/generateId';

interface KeyboardTodoInputProps {
  visible: boolean;
  onClose: () => void;
  inputRef?: React.RefObject<TextInput>;
}

const KeyboardTodoInput = ({ visible, onClose, inputRef }: KeyboardTodoInputProps) => {
  const [todoText, setTodoText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const theme = useTheme();
  const generateId = useGenerateId();
  
  const addTodo = useAddTodo();
  
  // Set up animation when priority modal becomes visible
  useEffect(() => {
    if (priorityModalVisible) {
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    } else {
      modalScaleAnim.setValue(0.9);
    }
  }, [priorityModalVisible]);
  
  // Handle animations when visibility changes
  useEffect(() => {
    if (visible) {
      // Show the component with opacity and slide animations (native driver only)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();
      
      // Show options after a slight delay (using state, not animation)
      setTimeout(() => {
        setOptionsVisible(true);
      }, 200);
      
      // Focus the input
      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }, 300);
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      setOptionsVisible(false);
    }
  }, [visible]);
  
  const handleClose = () => {
    // Animate out using native driver only
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic)
      })
    ]).start(() => {
      setOptionsVisible(false);
      Keyboard.dismiss();
      onClose();
    });
  };

  const handleAddTodo = async () => {
    if (todoText.trim()) {
      // Use proper parameters for the addTodo function
      await addTodo({
        text: todoText.trim(),
        done: false, 
        priority: priority,
        dueDate: dueDate ? dueDate.toISOString() : '',
      });
      
      setTodoText('');
      setPriority('medium');
      setDueDate(null);
      Keyboard.dismiss();
      
      // Simple flash animation with native driver
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (dueDate) {
        const newDate = new Date(selectedDate);
        newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
        setDueDate(newDate);
      } else {
        setDueDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = dueDate ? new Date(dueDate) : new Date();
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  const priorityColors = {
    low: theme.colors.tertiary,
    medium: theme.colors.outlineVariant,
    high: theme.colors.error
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.outerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[
        styles.container, 
        { backgroundColor: theme.colors.surface }
      ]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.onSurface }]}
          value={todoText}
          onChangeText={setTodoText}
          placeholder="Add a new todo..."
          placeholderTextColor={theme.colors.onSurfaceDisabled}
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={handleAddTodo}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddTodo}
          disabled={!todoText.trim()}
        >
          <Plus size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <X size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
      
      {/* Options row - controlled by state instead of animations */}
      {optionsVisible && (
        <View
          style={[
            styles.optionsWrapper,
            { 
              borderTopColor: '#e0e0e0',
              backgroundColor: theme.colors.surface 
            }
          ]}
        >
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {/* Priority option */}
            <Chip 
              mode="outlined"
              icon={() => <Flag size={16} color={priorityColors[priority]} />}
              onPress={() => setPriorityModalVisible(true)}
              style={[styles.optionChip, { borderColor: priorityColors[priority] }]}
              textStyle={{ color: theme.colors.onSurface }}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Chip>
            
            {/* Due date option */}
            <Chip
              mode="outlined"
              icon={() => <Calendar size={16} color={theme.colors.primary} />}
              onPress={() => setShowDatePicker(true)}
              style={styles.optionChip}
              textStyle={{ color: theme.colors.onSurface }}
            >
              {dueDate ? dueDate.toLocaleDateString() : "Date"}
            </Chip>
            
            {/* Due time option */}
            <Chip
              mode="outlined"
              icon={() => <Clock size={16} color={theme.colors.primary} />}
              onPress={() => dueDate ? setShowTimePicker(true) : setShowDatePicker(true)}
              style={styles.optionChip}
              textStyle={{ color: theme.colors.onSurface }}
              disabled={!dueDate}
            >
              {dueDate ? dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time"}
            </Chip>
            
            {/* Clear due date button */}
            {dueDate && (
              <Chip
                mode="outlined"
                icon="close"
                onPress={() => setDueDate(null)}
                style={styles.optionChip}
                textStyle={{ color: theme.colors.error }}
              >
                Clear date
              </Chip>
            )}
          </ScrollView>
        </View>
      )}

      {/* Priority Selection Modal with animations */}
      <Modal
        visible={priorityModalVisible}
        transparent={true}
        onRequestClose={() => setPriorityModalVisible(false)}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPriorityModalVisible(false)}
        >
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.colors.surface,
                transform: [{ scale: modalScaleAnim }] 
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Select Priority
            </Text>
            
            <TouchableOpacity
              style={[styles.priorityOption, { borderLeftWidth: 5, borderLeftColor: priorityColors.high }]}
              onPress={() => {
                setPriority('high');
                setPriorityModalVisible(false);
              }}
            >
              <Flag size={20} color={priorityColors.high} />
              <Text style={[styles.priorityText, { color: theme.colors.onSurface }]}>High</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.priorityOption, { borderLeftWidth: 5, borderLeftColor: priorityColors.medium }]}
              onPress={() => {
                setPriority('medium');
                setPriorityModalVisible(false);
              }}
            >
              <Flag size={20} color={priorityColors.medium} />
              <Text style={[styles.priorityText, { color: theme.colors.onSurface }]}>Medium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.priorityOption, { borderLeftWidth: 5, borderLeftColor: priorityColors.low }]}
              onPress={() => {
                setPriority('low');
                setPriorityModalVisible(false);
              }}
            >
              <Flag size={20} color={priorityColors.low} />
              <Text style={[styles.priorityText, { color: theme.colors.onSurface }]}>Low</Text>
            </TouchableOpacity>
            
            <Button 
              mode="text" 
              onPress={() => setPriorityModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsWrapper: {
    borderTopWidth: 0.5,
    height: 50,
  },
  optionsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionChip: {
    marginRight: 8,
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
  },
  priorityText: {
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  }
});

export default KeyboardTodoInput; 