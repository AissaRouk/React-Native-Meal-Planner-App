import Icon from '@react-native-vector-icons/ionicons';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ingredient} from '../Types/Types';
import {handleOnSetQuantity} from '../Utils/utils';

// Types of the AddRecipeModal params
type IngredientComponentProps = {
  ingredients: Ingredient[];
  id: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  DropdownButton: () => JSX.Element;
};

export function IngredientComponent({
  ingredients,
  id,
  quantity,
  setQuantity,
  DropdownButton,
}: IngredientComponentProps): JSX.Element {
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
            handleOnSetQuantity(quantity - 1, setQuantity);
          }}
        />
        <Text style={{fontSize: 18, marginHorizontal: 5}}>{quantity}</Text>
        <Icon
          name="add"
          size={30}
          color="black"
          onPress={() => {
            handleOnSetQuantity(quantity + 1, setQuantity);
          }}
        />
      </View>

      {/* Dropdown */}
      <View>
        <DropdownButton />
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
  },
});
