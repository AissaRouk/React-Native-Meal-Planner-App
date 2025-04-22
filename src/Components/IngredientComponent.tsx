import Icon from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {Ingredient, QuantityType, quantityTypes} from '../Types/Types';
import {CustomPicker} from './CustomPicker'; // Import the new CustomPicker

// Types of the AddRecipeModal params
type IngredientComponentProps = {
  ingredients: Ingredient[]; // List of all available ingredients
  id: number; // Unique identifier for the ingredient
  quantity: number; // Current quantity of the ingredient
  quantityType: QuantityType; // Unit of measurement for the quantity
  setQuantity: (id: number, quantity: number) => void; // Function to update the quantity
  setQuantityType: (id: number, quantityType: QuantityType) => void; // Function to update the quantity type
};

export function IngredientComponent({
  ingredients,
  id,
  quantity,
  quantityType,
  setQuantity,
  setQuantityType,
}: IngredientComponentProps): JSX.Element {
  //
  //States
  // State to manage the text input value for the quantity
  const [textValue, setTextValue] = useState<string>(quantity.toString());
  // state to manage the visibility of the Picker
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  //
  // Functions
  //

  // Handles changes in the text input, ensuring only numeric values are allowed
  const handleChange = (text: string): void => {
    const numericRegex = /^\d*\.?\d*$/; // Regex to allow only numbers and decimal points
    if (numericRegex.test(text)) {
      setTextValue(text); // Update the state if the input is valid
    }
  };

  // Handles the blur event of the text input
  const handleBlur = (): void => {
    const numericValue = parseFloat(textValue); // Convert the text to a number
    if (!isNaN(numericValue)) {
      setQuantity(id, numericValue); // Update the quantity if the value is valid
    } else {
      setTextValue(quantity.toString()); // Reset the input if the value is invalid
    }
  };

  return (
    <View style={styles.ingredientView}>
      {/* Display the name of the ingredient */}
      <View>
        <Text style={styles.ingredientText}>
          {ingredients.find(ingredient => ingredient.id === id)?.name}
        </Text>
      </View>

      {/* Quantity counter with decrement, text input, and increment */}
      <View style={styles.counterContainer}>
        {/* Decrement button */}
        <Icon
          name="remove"
          size={30}
          color="black"
          onPress={() => {
            setQuantity(id, Math.max(0, quantity - 1)); // Decrease quantity but ensure it doesn't go below 0
            setTextValue(Math.max(0, quantity - 1).toString()); // Update the text input value
          }}
        />
        {/* Text input for manual quantity entry */}
        <TextInput
          style={styles.textInput}
          value={textValue}
          keyboardType="decimal-pad" // Numeric keyboard for input
          onChangeText={handleChange} // Handle text changes
          onBlur={handleBlur} // Handle blur event
        />
        {/* Increment button */}
        <Icon
          name="add"
          size={30}
          color="black"
          onPress={() => {
            setQuantity(id, quantity + 1); // Increase quantity
            setTextValue((quantity + 1).toString()); // Update the text input value
          }}
        />
      </View>

      {/* Dropdown for selecting the quantity type */}
      <View style={{position: 'relative'}}>
        <CustomPicker
          isPickerOpen={pickerOpen}
          setIsPickerOpen={setPickerOpen}
          quantityType={quantityType}
          setQuantityType={(newType: QuantityType) => {
            setQuantityType(id, newType);
          }}
          options={quantityTypes} // Pass the list of quantity types
        />
      </View>
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  ingredientView: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space out items evenly
    borderColor: '#ccc', // Light gray border color
    borderWidth: 1, // Border width
    borderRadius: 5, // Rounded corners
    marginTop: 20, // Top margin
    paddingHorizontal: 10, // Horizontal padding
    paddingVertical: 12, // Vertical padding
  },
  textInput: {
    fontSize: 18, // Font size for the text input
    marginHorizontal: 5, // Horizontal margin
    textAlignVertical: 'center', // Center text vertically
    textAlign: 'center', // Center text horizontally
    height: 40, // Fixed height
    width: 60, // Fixed width for alignment
    borderWidth: 1, // Border width
    borderColor: '#ccc', // Light gray border color
    borderRadius: 5, // Rounded corners
  },
  ingredientText: {
    fontSize: 16, // Font size for the ingredient name
    color: 'black', // Black text color
    fontWeight: '500', // Medium font weight
  },
  counterContainer: {
    flexDirection: 'row', // Arrange items in a row
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
  },
});
