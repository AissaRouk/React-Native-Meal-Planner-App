import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {QuantityType} from '../Types/Types';

type CustomPickerProps = {
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
  quantityType: QuantityType;
  setQuantityType: (quantityType: QuantityType) => void;
  options: QuantityType[];
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
      {/* Selected value */}
      <TouchableOpacity
        style={styles.selectedValue}
        onPress={() => setIsPickerOpen(!isPickerOpen)}>
        <Text style={styles.selectedText}>{quantityType || 'Select'}</Text>
      </TouchableOpacity>

      {/* Dropdown options */}
      {isPickerOpen && (
        <View style={styles.dropdown}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                setQuantityType(item);
                setIsPickerOpen(false);
              }}>
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1, // Ensure the container has a base zIndex
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
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 100,
    zIndex: 100, // Ensure the dropdown is above other components
    elevation: 5, // For Android shadow
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
  },
});
