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

  const printTableRecipe = (recipe: Recipe) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recipe</Text>
        <Text style={styles.text}>ID: {recipe.id}</Text>
        <Text style={styles.text}>Name: {recipe.name}</Text>
        <Text style={styles.text}>Link: {recipe.link}</Text>
        <Text style={styles.text}>
          Preparation Time: {recipe.preparationTime} mins
        </Text>
        <Text style={styles.text}>Serving Size: {recipe.servingSize}</Text>
      </View>
    );
  };

  const printRecipeIngredientTable = (recipeIngredient: RecipeIngredient) => {
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

  return (
    <ScrollView style={styles.container}>
      {/* Recipes */}
      <Text style={styles.heading}>Recipes</Text>
      {recipes?.map(recipe => (
        <View key={`recipe-${recipe.id}`}>{printTableRecipe(recipe)}</View>
      ))}

      {/* Recipe Ingredients */}
      <Text style={styles.heading}>Recipe Ingredients</Text>
      {recipeIngredients?.map(recipeIngredient => (
        <View key={`recipeIngredient-${recipeIngredient.id}`}>
          {printRecipeIngredientTable(recipeIngredient)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    paddingBottom: 10,
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
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
