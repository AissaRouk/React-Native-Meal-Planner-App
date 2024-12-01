import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
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

export default function MainScreen(): React.JSX.Element {
  const [recipes, setRecipes] = useState<Recipe[]>();
  const [recipeIngredients, setRecipeIngredients] =
    useState<RecipeIngredient[]>();

  useEffect(() => {
    // Initialize tables and insert ingredient
    const initializeDatabase = async () => {
      try {
        const rcps: Recipe[] = await getRecipes();
        setRecipes(rcps);

        const rcpIngr: RecipeIngredient[] = await getRecipeIngredients();
        setRecipeIngredients(rcpIngr);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    // Call the function to initialize the database and add data
    initializeDatabase();
  }, []);

  return (
    <View style={[styles.container, {padding: 16}]}>
      <Header />
      <ScrollView style={styles.container}>
        {/* Recipes */}
        <Text style={styles.heading}>Recipes</Text>
        {recipes?.map(recipe => (
          <RecipeCard recipe={recipe} />
        ))}

        {/* Recipe Ingredients */}
        <Text style={styles.heading}>Recipe Ingredients</Text>
        {recipeIngredients?.map(recipeIngredient => (
          <IngredientRecipeCard recipeIngredient={recipeIngredient} />
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
});
