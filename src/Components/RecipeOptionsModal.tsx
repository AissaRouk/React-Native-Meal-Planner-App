import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  modalSemiTransparentBg,
  modalWhiteBg,
  modalBorderRadius,
  orangeBackgroundColor,
} from '../Utils/Styiling';
import {Recipe} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {FloatingButton} from './FloatingButton';

export function RecipeOptionsModal({
  menuVisible,
  setMenuVisible,
  recipe,
}: {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  recipe: Recipe;
}): React.ReactNode {
  return (
    <Modal
      visible={menuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{recipe.name}</Text>
            <TouchableOpacity onPress={() => setMenuVisible(false)}>
              <Icon name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              /* navigate to plan meal */
            }}>
            <Icon name="calendar-outline" size={18} color="#fb7945" />
            <Text style={styles.optionText}>Plan this meal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              /* delete from schedule */
            }}>
            <Icon name="trash-outline" size={18} color="#fb7945" />
            <Text style={styles.optionText}>Remove from schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setMenuVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: modalSemiTransparentBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: modalWhiteBg,
    borderRadius: modalBorderRadius,
    padding: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: orangeBackgroundColor,
    borderRadius: modalBorderRadius,
  },
  cancelText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
