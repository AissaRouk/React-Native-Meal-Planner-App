import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  getIngredients,
  getTableNames,
  createIngredientTable,
  addIngredient,
  deleteIngredient,
  updateIngredient,
  createRecipeTable,
  getRecipes,
  addRecipe,
  dropAllTables,
  updateRecipe,
  deleteRecipe,
  createRecipeIngredientTable,
  getRecipeIngredients,
  updateRecipeIngredient,
  addRecipeIngredient,
  createPantryTable,
  addPantry,
  createIngredientPantryTable,
  addIngredientPantry,
  getAllIngredientPantries,
  getAllPantries,
  updatePantry,
  deletePantry,
  updateIngredientPantry,
  deleteIngredientPantry,
} from '../services/db-services';
import {
  Ingredient,
  IngredientPantry,
  Pantry,
  QuantityType,
  Recipe,
  RecipeIngredient,
} from '../Types/Types';
import Header from '../Components/HeaderComponent';
import RecipeCard from '../Components/RecipeCardComponent';
import {IngredientRecipeCard} from '../Components/IngredientRecipeCard';
import MealTypeComponent from '../Components/MealTypeComponent';

export default function MainScreen(): React.JSX.Element {
  /**the array with all the recipes fetched**/
  const [recipes, setRecipes] = useState<Recipe[]>();

  useEffect(() => {
    // Initialize tables and insert ingredient
    async () => {
      try {
        const rcps: Recipe[] = await getRecipes();
        setRecipes(rcps);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
  }, []);

  return (
    <View style={[styles.container, {padding: 16}]}>
      <Header />
      <MealTypeComponent />
      <ScrollView style={styles.container}>
        {/* Recipes */}
        <Text style={styles.heading}>Breakfast</Text>
        {recipes?.map(recipe => (
          <RecipeCard recipe={recipe} />
        ))}
        {/* Recipes */}
        <Text style={styles.heading}>Lunch</Text>
        {recipes?.map(recipe => (
          <RecipeCard recipe={recipe} />
        ))}
        {/* Recipes */}
        <Text style={styles.heading}>Dinner</Text>
        {recipes?.map(recipe => (
          <RecipeCard recipe={recipe} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff',
    paddingBottom: 10,
    marginBottom: 10,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  mealType: {},
  borderRight: {
    borderRightWidth: 0.5,
    borderColor: '#6e6f71',
  },
});
