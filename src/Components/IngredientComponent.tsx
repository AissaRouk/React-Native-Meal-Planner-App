import Icon from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Ingredient, QuantityType, quantityTypes} from '../Types/Types';
import {CustomPicker} from './CustomPicker'; // Import the new CustomPicker

// Types of the AddRecipeModal params
type IngredientComponentProps = {
  ingredients: Ingredient[]; // List of all available ingredients
  id: string; // Unique identifier for the ingredient
  quantity: number; // Current quantity of the ingredient
  quantityType: QuantityType; // Unit of measurement for the quantity
  number: number; // The key of the component, only used for styling purposes
  setQuantity: (quantity: number) => void; // Function to update the quantity
  setQuantityType: (quantityType: QuantityType) => void; // Function to update the quantity type
  onDelete: (id: string) => void; // Function that handles the deletion of the ingredient
};
/**
 * IngredientComponent renders a UI element for managing an individual ingredient
 * in a recipe. It allows users to:
 * - View the ingredient's name
 * - Adjust its quantity using + / - buttons or by typing a number
 * - Select a unit (e.g., grams, pieces) using a custom picker
 * - Remove the ingredient from the list
 *
 * @param {Ingredient[]} ingredients - List of all available ingredients (used to resolve the name)
 * @param {string} id - Unique identifier for the specific ingredient this component represents
 * @param {number} quantity - Current quantity value of the ingredient
 * @param {QuantityType} quantityType - Unit of measurement for the ingredient (e.g., grams, ml)
 * @param {number} number - The index of the component in the list, used for zIndex styling
 * @param {quantity: number => void} setQuantity - Function to update the quantity for the ingredient
 * @param {( quantityType: QuantityType) => void} setQuantityType - Function to update the unit type for the ingredient
 * @param {(id: number) => void} onDelete - Function to handle removal of the ingredient from the list
 *
 * @returns {JSX.Element} A visual representation of the ingredient with editable fields
 */
export function IngredientComponent({
  ingredients,
  id,
  quantity,
  quantityType,
  setQuantity,
  setQuantityType,
  onDelete,
  number = 0,
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
      setQuantity(numericValue); // Update the quantity if the value is valid
    } else {
      setTextValue(quantity.toString()); // Reset the input if the value is invalid
    }
  };

  return (
    <View style={[styles.ingredientView, {zIndex: 100 - number || 0}]}>
      {/* Ingredient name on top */}

      <Text
        style={styles.ingredientText}
        numberOfLines={1}
        ellipsizeMode="tail">
        {ingredients.find(ingredient => ingredient.id === id)?.name}
      </Text>

      {/* Controls below */}
      <View style={styles.controlsRow}>
        <View style={styles.counterContainer}>
          <Icon
            name="remove"
            size={30}
            color="black"
            style={{marginHorizontal: 6}}
            onPress={() => {
              const newValue = Math.max(0, parseFloat(textValue) || 0) - 1;
              setQuantity(newValue);
              setTextValue(newValue.toString());
            }}
          />
          <TextInput
            style={styles.textInput}
            value={textValue}
            keyboardType="decimal-pad"
            onChangeText={handleChange}
            onBlur={handleBlur}
          />
          <Icon
            name="add"
            size={30}
            color="black"
            style={{marginHorizontal: 6}}
            onPress={() => {
              const newValue = Math.max(0, parseFloat(textValue) || 0) + 1;
              setQuantity(newValue);
              setTextValue(newValue.toString());
            }}
          />
        </View>
        <View style={{marginHorizontal: 8}}>
          <CustomPicker
            isPickerOpen={pickerOpen}
            setIsPickerOpen={setPickerOpen}
            quantityType={quantityType}
            setQuantityType={(newType: QuantityType) => {
              setQuantityType(newType);
            }}
            options={quantityTypes}
          />
        </View>
        <Icon
          name="trash-outline"
          size={20}
          style={{marginLeft: 10}}
          onPress={() => onDelete(id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ingredientView: {
    flexDirection: 'column', // Stack name on top, controls below
    alignItems: 'flex-start',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  ingredientNameContainer: {},
  ingredientText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    width: '100%',
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textInput: {
    fontSize: 18,
    marginHorizontal: 8,
    minWidth: 40,
    height: 40,
    paddingHorizontal: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
});
