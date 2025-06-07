import React from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {QuantityType} from '../Types/Types';
import {modalSemiTransparentBg, modalWhiteBg} from '../Utils/Styiling';
import {ModalHeader} from './ModalHeareComponent';

type CustomPickerProps = {
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
  quantityType: QuantityType;
  setQuantityType: (quantityType: QuantityType) => void;
  options: any[];
};

export const CustomPicker = ({
  isPickerOpen,
  setIsPickerOpen,
  quantityType,
  setQuantityType,
  options,
}: CustomPickerProps) => {
  return (
    <View style={styles.container}>
      {/* Currently selected value */}
      <TouchableOpacity
        style={styles.selectedValue}
        onPress={() => setIsPickerOpen(!isPickerOpen)}>
        <Text style={styles.selectedText}>{quantityType || 'Select'}</Text>
      </TouchableOpacity>

      {/* Transparent Modal for dropdown */}
      <Modal transparent visible={isPickerOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={{marginHorizontal: 10, marginTop: 5}}>
              <ModalHeader
                text="Select option"
                onClose={() => setIsPickerOpen(false)}
              />
            </View>
            {options.map((item, index) => {
              const isSelected = item === quantityType;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    setQuantityType(item);
                    setIsPickerOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectedValue: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 100,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Modal overlay (semi‐transparent black) */
  modalOverlay: {
    flex: 1,
    backgroundColor: modalSemiTransparentBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* White container in center */
  modalContainer: {
    backgroundColor: modalWhiteBg,
    borderRadius: 8,
    width: '80%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    // add a subtle shadow on iOS/Android:
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  /* Each option row */
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginVertical: 4,
    backgroundColor: 'white',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },

  /* Highlighted style for the selected option */
  optionSelected: {
    backgroundColor: '#fb7945', // same accent color you use elsewhere
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});
