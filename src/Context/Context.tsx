import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  DaysOfWeek, ErrorResponseCodes, GroceryBought, Ingredient, IngredientPantry, IngredientWithoutId, MealType, QuantityType, Recipe,
  RecipeIngredientWithoutId, WeeklyMeal
} from '../Types/Types';
import { deleteRecipeDb, getAllRecipesDb, getRecipeByIdDb, getUserRecipesDb, updateRecipe } from '../Services/recipe-db-services';
import {
  addRecipeIngredientDb, addRecipeIngredientMultipleDb, deleteRecipeIngredientDb, getIdFromRecipeIdAndIngredientId,
  getIngredientsFromRecipeIdDb, updateRecipeIngredientDb
} from '../Services/recipeIngredients-db-services';
import { addIngredientDb } from '../Services/ingredient-db-services';
import { showToast, verifyRecipeIngredientWithoutId } from '../Utils/utils';
import { AddWeeklyMealInput, deleteWeeklyMealDb, getWeeklyMealsByDayAndMealTypeDb } from '../Services/weeklyMeals-db-services';
import { getAllIngredientPantriesDb } from '../Services/ingredientPantry-db-services';
import { addGroceryBoughtDb, getAllGroceryBoughtDb, removeGroceryBoughtDb } from '../Services/groceryBought-db-services';
import { addWeeklyMealDb } from '../Services/weeklyMeals-db-services'; // Import addWeeklyMealDb

// Define the shape of the entire context, including methods and state values.
type ContextProps = {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;

  addOrUpdateIngredient: (ingredient: Ingredient) => Promise<string>;

  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;

  addOrUpdateRecipe: (recipe: Recipe) => Promise<void>;

  addRecipeIngredient: (newRecIng: RecipeIngredientWithoutId,) => Promise<string>;

  addIngredient: (ingredient: IngredientWithoutId) => Promise<{ created: boolean; response?: string; insertedId?: string }>;

  getIngredientsOfRecipe: (recipeId: string) => Promise<(Ingredient & { quantity: number; quantityType: QuantityType })[]>;

  updateRecipeIngredient: (newRecipeIngredient: RecipeIngredientWithoutId) => Promise<void>;

  deleteRecipeIngredient: (ingredientId: string, recipeId: string) => Promise<boolean>;

  deleteRecipe: (recipeId: string) => Promise<boolean>;

  addRecipeIngredientMultiple: (recipeId: string, ingredients: Array<Ingredient & { quantity: number; quantityType: QuantityType }>,) => Promise<{
    created: boolean; insertedId?: string; responseCode?: ErrorResponseCodes;
  }>;

  getAllRecipes: (userId: string) => Promise<Recipe[]>;

  getUserRecipes: (userId: string) => Promise<Recipe[]>;

  getRecipeById: (id: string) => Promise<Recipe | null>;

  deleteWeeklyMeal: (id: string) => Promise<boolean>;

  getWeeklyMealsByDayAndMealType: (dayOfWeek: DaysOfWeek, mealType: MealType) => Promise<WeeklyMeal[]>;

  getAllIngredientPantries: () => Promise<IngredientPantry[]>;

  getAllGroceryBought: () => Promise<GroceryBought[]>;

  addGroceryBought: (ingredientId: string) => Promise<GroceryBought>;

  removeGroceryBought: (ingredientId: string) => Promise<void>;

  addWeeklyMeal: (input: AddWeeklyMealInput) => Promise<string>;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the actual context with default values (no-ops).
const AppContext = React.createContext<ContextProps>({
  userId: '',
  setUserId: () => { },
  ingredients: [],
  setIngredients: () => Promise.resolve(),
  addOrUpdateIngredient: async () => '-1',

  recipes: [],
  setRecipes: () => { },
  addOrUpdateRecipe: async () => { },

  addRecipeIngredient: async () => '-1',
  getIngredientsOfRecipe: async () => [],
  updateRecipeIngredient: async () => { },
  deleteRecipeIngredient: async () => false,
  deleteRecipe: async () => false,
  addRecipeIngredientMultiple: async () => ({
    created: false,
  }),
  addIngredient: async () => ({ created: false }),
  getAllRecipes: async () => [],
  getUserRecipes: async () => [],
  getRecipeById: async () => null,
  deleteWeeklyMeal: async () => false,
  getWeeklyMealsByDayAndMealType: async () => [],
  getAllIngredientPantries: async () => [],
  getAllGroceryBought: async () => [],
  addGroceryBought: async () => ({ id: '', ingredientId: '', timestamp: 0 }),
  removeGroceryBought: async () => { },
  addWeeklyMeal: async () => '', // Add default implementation
});

export const AppProvider = ({ children }: AppProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userId, setUserId] = useState<string>('');

  const addOrUpdateIngredient = async (newIngredient: Ingredient): Promise<string> => {
    const existingIndex = ingredients.findIndex(i => i.id === newIngredient.id);
    try {
      if (existingIndex >= 0) {
        const updatedList = [...ingredients];
        updatedList[existingIndex] = newIngredient;
        setIngredients(updatedList);
        return newIngredient.id; // Return the unchanged ID
      } else {
        const response = await addIngredientDb(newIngredient);

        if (response.created && response.insertedId != null) {
          const realId = response.insertedId;

          const insertedIngredient: Ingredient = {
            id: realId,
            name: newIngredient.name,
            category: newIngredient.category,
          };

          setIngredients(prev => [...prev, insertedIngredient]);
          return realId;
        } else {
          console.error('Failed to insert ingredient:', response);
          Alert.alert('Error', 'Could not add ingredient. Please try again.');
        }
      }
    } catch (error) {
      console.error('addOrUpdateIngredient -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while adding ingredient.');
    }

    return ''; // Indicate failure
  };

  const addIngredient = async (ingredient: IngredientWithoutId): Promise<{ created: boolean; response?: string; insertedId?: string }> => {
    const response = await addIngredientDb(ingredient);
    if (response.created && typeof response.insertedId === 'string' && response.insertedId !== undefined)
      setIngredients(prev => [...prev, { id: response.insertedId || '', ...ingredient },]);
    showToast("Ingredient '" + ingredient.name + "' added.");
    return response;
  };

  const getAllRecipes = async () => {
    const result: Recipe[] = await getAllRecipesDb();
    return result;
  };

  const getUserRecipes = async (userId: string) => {
    const result: Recipe[] = await getUserRecipesDb(userId);
    return result;
  };

  const addOrUpdateRecipe = async (newRecipe: Recipe) => {
    try {
      const response = await updateRecipe(newRecipe);
      if (response) {
        setRecipes(prev => {
          const index = prev.findIndex(r => r.id === newRecipe.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newRecipe;
            return updated;
          } else {
            return [...prev, newRecipe];
          }
        });
      } else {
        console.error('SQLite updateRecipe returned false for', newRecipe);
        Alert.alert('Error', `Could not save recipe "${newRecipe.name}".`);
      }
    } catch (error) {
      console.error('addOrUpdateRecipe -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while saving recipe.');
    }
  };

  const addRecipeIngredient = async (
    newRecIng: RecipeIngredientWithoutId,
  ): Promise<string> => {
    const isValid = verifyRecipeIngredientWithoutId(newRecIng);

    console.log(
      'addRecipeIngredient -> Validating:',
      newRecIng,
      'isValid:',
      isValid,
    );

    if (!isValid) {
      Alert.alert('Validation error', 'Invalid recipe‐ingredient data.');
      return '';
    }

    try {
      const result = await addRecipeIngredientDb(newRecIng);
      if (result.created && result.insertedId != null) {
        showToast('Ingredient added to recipe.');
        return result.insertedId;
      } else {
        console.error('addRecipeIngredientDb did not create row:', result);
        Alert.alert('Error', 'Could not add ingredient to recipe.');
      }
    } catch (error) {
      console.error('addRecipeIngredient -> Exception:', error);
      Alert.alert(
        'Error',
        'Unexpected error while adding ingredient to recipe.',
      );
    }

    return '';
  };

  const addRecipeIngredientMultiple = async (recipeId: string, ingredients: Array<Ingredient & { quantity: number; quantityType: QuantityType }>) => {
    const response = await addRecipeIngredientMultipleDb(recipeId, ingredients);
    const recipe = await getRecipeByIdDb(recipeId);
    if (recipe)
      showToast(
        ingredients.length +
        " ingredient(s) added to recipe '" +
        recipe.name +
        "'.",
      );
    return response;
  };

  const updateRecipeIngredient = async (newRecipeIngredient: RecipeIngredientWithoutId) => {
    try {
      const recipeIngredientId = await getIdFromRecipeIdAndIngredientId(
        newRecipeIngredient.recipeId,
        newRecipeIngredient.ingredientId,
      );

      if (recipeIngredientId && recipeIngredientId != '') {
        await updateRecipeIngredientDb({ id: recipeIngredientId, ...newRecipeIngredient, })
      }
      else {
        console.error('No matching RecipeIngredient found for:', newRecipeIngredient,);
        Alert.alert('Error', 'Could not locate the ingredient in recipe for update.');
      }
    } catch (error) {
      console.error('updateRecipeIngredient -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while updating recipe ingredient.',);
    }
  };

  const getIngredientsOfRecipe = async (recipeId: string): Promise<(Ingredient & { quantity: number; quantityType: QuantityType })[]> => {
    const result: Array<Ingredient & { quantity: number; quantityType: QuantityType }> = [];

    if (!recipeId && recipeId != '') {
      console.error('getIngredientsOfRecipe -> invalid recipeId:', recipeId);
      return result;
    }

    try {
      const rows = await getIngredientsFromRecipeIdDb(recipeId);

      if (rows.length === 0) {
        return result;
      }

      for (const ri of rows) {
        const idx = ingredients.findIndex(i => i.id === ri.ingredientId);
        if (idx === -1) {
          console.warn(`Ingredient ${ri.ingredientId} not in context list`);
          continue;
        }
        const ing = ingredients[idx];
        result.push({ ...ing, quantity: ri.quantity, quantityType: ri.quantityType });
      }
      return result;
    } catch (error) {
      console.error('getIngredientsOfRecipe -> DB Exception:', error);
      Alert.alert('Error', 'Could not load ingredients for recipe.');
      return result;
    }
  };

  const deleteRecipeIngredient = async (ingredientId: string, recipeId: string): Promise<boolean> => {
    try {
      const recipeIngredientId = await getIdFromRecipeIdAndIngredientId(recipeId, ingredientId,);

      if (recipeIngredientId == '' || !recipeIngredientId) {
        console.warn('deleteRecipeIngredient -> no matching ID for', recipeId, ingredientId,);
        return false;
      }

      const deleted = await deleteRecipeIngredientDb(recipeIngredientId);
      if (!deleted) {
        console.error('deleteRecipeIngredientDb returned false for ID:', recipeIngredientId);
        Alert.alert('Error', 'Could not remove ingredient from recipe.');
      }
      return deleted;
    } catch (error) {
      console.error('deleteRecipeIngredient -> Exception:', error);
      Alert.alert(
        'Error',
        'Unexpected error while deleting ingredient from recipe.',
      );
      return false;
    }
  };

  const deleteRecipe = async (recipeId: string): Promise<boolean> => {
    try {
      await deleteRecipeDb(recipeId);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      showToast('Recipe deleted');
      return true;
    } catch (error) {
      console.error('deleteRecipe -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while deleting recipe.');
      return false;
    }
  };

  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    return await getRecipeByIdDb(id);
  };

  const getWeeklyMealsByDayAndMealType = async (dayOfWeek: DaysOfWeek, mealType: MealType): Promise<WeeklyMeal[]> => {
    return getWeeklyMealsByDayAndMealTypeDb(dayOfWeek, mealType);
  };

  const deleteWeeklyMeal = async (id: string): Promise<boolean> => {
    return deleteWeeklyMealDb(id);
  };

  const getAllIngredientPantries = (): Promise<IngredientPantry[]> => {
    return getAllIngredientPantriesDb();
  };

  const getAllGroceryBought = async (): Promise<GroceryBought[]> => {
    return getAllGroceryBoughtDb();
  };

  const addGroceryBought = async (ingredientId: string): Promise<GroceryBought> => {
    return addGroceryBoughtDb({ ingredientId: ingredientId, timestamp: Date.now() });
  };

  const removeGroceryBought = async (ingredientId: string): Promise<void> => {
    return removeGroceryBoughtDb(ingredientId);
  };

  const addWeeklyMeal = async (input: AddWeeklyMealInput): Promise<string> => {
    const response: Promise<string> = addWeeklyMealDb(input);
    showToast('Meal added to ' + input.day + ', ' + input.mealType);
    return response;
  };

  return (
    <AppContext.Provider value={{
      userId, setUserId, ingredients, setIngredients, addOrUpdateIngredient, addIngredient, recipes, setRecipes, addOrUpdateRecipe, addRecipeIngredient, addRecipeIngredientMultiple,
      getIngredientsOfRecipe, updateRecipeIngredient, deleteRecipeIngredient, getRecipeById, getAllRecipes, getUserRecipes, deleteWeeklyMeal, getWeeklyMealsByDayAndMealType,
      getAllIngredientPantries, getAllGroceryBought, addGroceryBought, removeGroceryBought, addWeeklyMeal, deleteRecipe,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for consuming the context in components
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
