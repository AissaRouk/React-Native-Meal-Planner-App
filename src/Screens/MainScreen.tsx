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
  MealType,
  Pantry,
  QuantityType,
  Recipe,
  RecipeIngredient,
} from '../Types/Types';
import Header from '../Components/HeaderComponent';
import RecipeCard from '../Components/RecipeCardComponent';
import {IngredientRecipeCard} from '../Components/IngredientRecipeCard';
import MealTypeComponent from '../Components/MealTypeComponent';
import {Breakfast, Dinner, Lunch} from './sucio';

export default function MainScreen(): React.JSX.Element {
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    MealType.BREAKFAST,
  );
  /**
   * The array that contains the recipes of the selected MealType
   */
  const [recipes, setRecipes] = useState<Recipe[]>();

  useEffect(() => {
    console.log('MealType has changed: ' + selectedMeal);

    switch (selectedMeal) {
      case null:
      case MealType.BREAKFAST:
        setSelectedMeal(MealType.BREAKFAST);
        setRecipes(Breakfast);
        break;
      case MealType.LUNCH:
        setSelectedMeal(MealType.LUNCH);
        setRecipes(Lunch);
        break;
      case MealType.DINNER:
        setSelectedMeal(MealType.DINNER);
        setRecipes(Dinner);
        break;
    }
  }, [selectedMeal]);

  return (
    <View style={[styles.container, {padding: 16}]}>
      <Header />
      <MealTypeComponent
        mealType={selectedMeal}
        onSelectedMeal={setSelectedMeal}
      />
      {recipes?.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
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
