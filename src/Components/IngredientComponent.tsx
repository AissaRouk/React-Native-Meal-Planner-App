import Icon from '@react-native-vector-icons/ionicons';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ingredient, QuantityType} from '../Types/Types';
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
      <Text style={styles.ingredientText}>
        {ingredients.find(ingredient => ingredient.id === id)?.name}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Icon
          name="remove"
          size={30}
          color="black"
          onPress={() => {
            handleOnSetQuantity(quantity - 1, setQuantity);
          }}
        />
        <Text style={{marginHorizontal: 10, fontSize: 18}}>{quantity}</Text>
        <Icon
          name="add"
          size={30}
          color="black"
          onPress={() => {
            handleOnSetQuantity(quantity + 1, setQuantity);
          }}
        />
      </View>
      <DropdownButton />
      <Icon
        name="checkbox"
        size={25}
        style={{marginRight: 10}}
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  //Ingredient view
  ingredientView: {
    alignItems: 'center',
    flexDirection: 'row',
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
    textAlignVertical: 'center',
  },
});
