import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Checkbox, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { ShoppingItem as ShoppingItemType } from '../store/models';

type ShoppingItemProps = {
  item: ShoppingItemType;
  onToggleComplete: () => void;
  onDelete: () => void;
};

export default function ShoppingItem({ item, onToggleComplete, onDelete }: ShoppingItemProps) {
  const theme = useTheme();

  return (
    <Surface style={[
      styles.container, 
      { backgroundColor: theme.colors.surface },
      item.checked && styles.purchasedContainer
    ]}>
      <View style={styles.leftContainer}>
        <Checkbox
          status={item.checked ? 'checked' : 'unchecked'}
          onPress={onToggleComplete}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={onToggleComplete}
      >
        <View style={styles.titleRow}>
          <Text 
            style={[
              styles.title, 
              item.checked && styles.purchasedText
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Text 
            style={[
              styles.quantity,
              item.checked && styles.purchasedText
            ]}
          >
            Qty: {item.quantity}
          </Text>
          
          {item.price !== undefined && item.price > 0 && (
            <Text 
              style={[
                styles.price,
                item.checked && styles.purchasedText
              ]}
            >
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <Feather name="trash-2" size={18} color="#FF5252" />
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  purchasedContainer: {
    opacity: 0.7,
  },
  leftContainer: {
    justifyContent: 'center',
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    paddingLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
  },
});
