import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {QuantityType} from '../Types/Types';

type CustomPickerProps = {
  isPickerOpen: boolean; // State to track if the dropdown is open
  setIsPickerOpen: (open: boolean) => void; // Function to toggle dropdown visibility
  quantityType: QuantityType; // Currently selected quantity type
  setQuantityType: (quantityType: QuantityType) => void; // Function to update the selected quantity type
  options: QuantityType[]; // List of available options for the dropdown
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
      {/* Display the currently selected value */}
      <TouchableOpacity
        style={styles.selectedValue}
        onPress={() => setIsPickerOpen(!isPickerOpen)}>
        <Text style={styles.selectedText}>{quantityType || 'Select'}</Text>
      </TouchableOpacity>

      {/* Render dropdown options when the picker is open */}
      {isPickerOpen && (
        <View style={styles.dropdown}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                setQuantityType(item); // Update the selected value
                setIsPickerOpen(false); // Close the dropdown
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
    backgroundColor: '#ccc', // Background color for the selected value
    borderRadius: 5, // Rounded corners
    padding: 10, // Padding inside the button
    width: 100, // Fixed width for the picker
  },
  selectedText: {
    fontSize: 16, // Font size for the selected text
    fontWeight: '500', // Medium font weight
  },
  dropdown: {
    position: 'absolute',
    top: 50, // Position the dropdown below the selected value
    backgroundColor: 'white', // Background color for the dropdown
    borderRadius: 5, // Rounded corners
    borderWidth: 1, // Border around the dropdown
    borderColor: '#ccc', // Border color
    width: 100, // Match the width of the picker
    zIndex: 100, // Ensure the dropdown is above other components
    elevation: 5, // Shadow for Android
  },
  option: {
    padding: 10, // Padding for each dropdown option
  },
  optionText: {
    fontSize: 16, // Font size for dropdown option text
  },
});
