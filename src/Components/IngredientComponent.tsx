import Icon from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {Ingredient, QuantityType} from '../Types/Types';
import {DropdownButton} from './DropdownButton';

// Types of the AddRecipeModal params
type IngredientComponentProps = {
  ingredients: Ingredient[];
  id: number;
  quantity: number;
  setQuantity: (id: number, quantity: number) => void;
};

export function IngredientComponent({
  ingredients,
  id,
  quantity,
  setQuantity,
}: IngredientComponentProps): JSX.Element {
  // Local state to manage the input value as a string
  const [textValue, setTextValue] = useState<string>(quantity.toString());

  // Handle changes in the TextInput
  const handleChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericRegex = /^\d*\.?\d*$/;
    if (numericRegex.test(text)) {
      setTextValue(text); // Update the local state
    }
  };

  // Handle when the user finishes editing (onBlur)
  const handleBlur = () => {
    const numericValue = parseFloat(textValue); // Convert the string to a number
    if (!isNaN(numericValue)) {
      setQuantity(id, numericValue); // Update the main state
    } else {
      setTextValue(quantity.toString()); // Reset to the previous valid value
    }
  };

  return (
    <View style={styles.ingredientView}>
      {/* Ingredient name */}
      <View>
        <Text style={styles.ingredientText}>
          {ingredients.find(ingredient => ingredient.id === id)?.name}
        </Text>
      </View>

      {/* Quantity counter */}
      <View style={styles.counterContainer}>
        <Icon
          name="remove"
          size={30}
          color="black"
          onPress={() => {
            setQuantity(id, Math.max(0, quantity - 1)); // Ensure quantity doesn't go below 0
            setTextValue(Math.max(0, quantity - 1).toString()); // Update local state
          }}
        />
        <TextInput
          style={{
            fontSize: 18,
            marginHorizontal: 5,
            textAlignVertical: 'center',
            textAlign: 'center',
            height: 40, // Ensure consistent height
            width: 60, // Fixed width for alignment
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
          }}
          value={textValue} // Use the local state for the value
          keyboardType="decimal-pad" // Allow decimal input
          onChangeText={handleChange} // Handle input changes
          onBlur={handleBlur} // Update the main state on blur
        />
        <Icon
          name="add"
          size={30}
          color="black"
          onPress={() => {
            setQuantity(id, quantity + 1); // Increment the quantity
            setTextValue((quantity + 1).toString()); // Update local state
          }}
        />
      </View>

      {/* Dropdown */}
      <View>
        <DropdownButton
          quantityType={QuantityType.GRAMS}
          setIsPickerOpen={() => {}}
          isPickerOpen={false}
          setQuantityType={() => {}}
        />
      </View>
    </View>
  );
}

//Ingredient view
const styles = StyleSheet.create({
  ingredientView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
