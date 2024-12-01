// RecipeCard.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RecipeIngredient} from '../Types/Types';

export const IngredientRecipeCard = ({
  recipeIngredient,
}: {
  recipeIngredient: RecipeIngredient;
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recipe Ingredient</Text>
      <Text style={styles.text}>ID: {recipeIngredient.id}</Text>
      <Text style={styles.text}>
        Recipe ID: {recipeIngredient.recipeId ?? 'N/A'}
      </Text>
      <Text style={styles.text}>
        Ingredient ID: {recipeIngredient.ingredientId ?? 'N/A'}
      </Text>
      <Text style={styles.text}>
        Quantity: {recipeIngredient.quantity ?? 'N/A'}
      </Text>
      <Text style={styles.text}>
        Quantity Type: {recipeIngredient.quantityType ?? 'N/A'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
