import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {
  Ingredient,
  QuantityType,
  Recipe,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {updateRecipe} from '../Services/recipe-db-services';
import {
  addRecipeIngredientDb,
  deleteRecipeIngredientDb,
  getIdFromRecipeId,
  getIdFromRecipeIdAndIngredientId,
  getIngredientsFromRecipeId,
  updateRecipeIngredientDb,
} from '../Services/recipeIngredients-db-services';
import {addIngredient} from '../Services/ingredient-db-services';
import {verifyRecipeIngredientWithoutId} from '../Utils/utils';

// Define the shape of the context
type ContextProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  /**
   * adds or updates an ingredient depending if it already exists in the system
   * @param {Ingredient} ingredient - Ingredient to be added, if it's a RecipeIngredient add id:-1
   * @returns {Promise<number>} - returns new ingredient ID on success, -1 on failure
   */
  addOrUpdateIngredient: (ingredient: Ingredient) => Promise<number>;

  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  /**
   * adds or updates a recipe in the database and context
   * @param {Recipe} recipe - Recipe to upsert
   */
  addOrUpdateRecipe: (recipe: Recipe) => Promise<void>;

  /**
   * adds a new RecipeIngredient
   * @param {RecipeIngredientWithoutId} newRecIng - recipeId, ingredientId, quantity, quantityType
   * @returns {Promise<number>} - new RecipeIngredient ID on success, -1 on failure
   */
  addRecipeIngredient: (
    newRecIng: RecipeIngredientWithoutId,
  ) => Promise<number>;

  /**
   * fetches all ingredients (with quantity & type) for a specific recipe
   * @param {number} recipeId
   * @returns Promise of array of Ingredient + { quantity, quantityType }
   */
  getIngredientsOfRecipe: (
    recipeId: number,
  ) => Promise<(Ingredient & {quantity: number; quantityType: QuantityType})[]>;

  /**
   * updates a specific RecipeIngredient
   * @param {RecipeIngredientWithoutId} newRecipeIngredient
   */
  updateRecipeIngredient: (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => Promise<void>;

  /**
   * deletes a RecipeIngredient by ingredientId & recipeId
   * @param {number} ingredientId
   * @param {number} recipeId
   * @returns Promise<boolean> - true if deletion succeeded
   */
  deleteRecipeIngredient: (
    ingredientId: number,
    recipeId: number,
  ) => Promise<boolean>;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the context
const AppContext = React.createContext<ContextProps>({
  ingredients: [],
  setIngredients: () => Promise.resolve(),
  addOrUpdateIngredient: async () => -1,

  recipes: [],
  setRecipes: () => {},
  addOrUpdateRecipe: async () => {},

  addRecipeIngredient: async () => -1,
  getIngredientsOfRecipe: async () => [],
  updateRecipeIngredient: async () => {},
  deleteRecipeIngredient: async () => false,
});

// Create the provider component
export const AppProvider = ({children}: AppProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    console.log('Context -> recipes:', JSON.stringify(recipes));
  }, [recipes]);

  /**
   * Adds or updates an ingredient in SQLite and context state.
   * Returns the real ID if successful, or -1 on failure.
   */
  const addOrUpdateIngredient = async (
    newIngredient: Ingredient,
  ): Promise<number> => {
    // Check if it already exists in context by ID
    const existingIndex = ingredients.findIndex(i => i.id === newIngredient.id);

    try {
      if (existingIndex >= 0) {
        // Update path: update in context array
        const updatedList = [...ingredients];
        updatedList[existingIndex] = newIngredient;
        setIngredients(updatedList);
        return newIngredient.id;
      } else {
        // Add path: insert into SQLite first
        const response = await addIngredient(newIngredient);

        if (response.created && response.insertedId != null) {
          const realId = response.insertedId;

          // Build the full object with real ID
          const insertedIngredient: Ingredient = {
            id: realId,
            name: newIngredient.name,
            category: newIngredient.category,
          };

          // Append to context state
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

    return -1;
  };

  /**
   * Adds or updates a recipe in SQLite and context.
   * If updateRecipe (SQLite) returns false, logs and alerts.
   */
  const addOrUpdateRecipe = async (newRecipe: Recipe) => {
    try {
      const response = await updateRecipe(newRecipe);
      if (response) {
        setRecipes(prev => {
          const index = prev.findIndex(r => r.id === newRecipe.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newRecipe;
            console.log('Updated recipe in context:', newRecipe);
            return updated;
          } else {
            console.log('Added new recipe in context:', newRecipe);
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

  /**
   * Adds a new RecipeIngredient in SQLite. Returns inserted ID or -1 on failure.
   */
  const addRecipeIngredient = async (
    newRecIng: RecipeIngredientWithoutId,
  ): Promise<number> => {
    const isValid = verifyRecipeIngredientWithoutId(newRecIng);
    console.log('Context.addRecipeIngredient -> verify result:', isValid);

    if (!isValid) {
      Alert.alert('Validation error', 'Invalid recipe‐ingredient data.');
      return -1;
    }

    try {
      const result = await addRecipeIngredientDb(newRecIng);
      if (result.created && result.insertedId != null) {
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

    return -1;
  };

  /**
   * Updates an existing RecipeIngredient by first finding its internal ID,
   * then calling SQLite update. Alerts/logs on failure.
   */
  const updateRecipeIngredient = async (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => {
    try {
      const recipeIngredientId = await getIdFromRecipeId(
        newRecipeIngredient.recipeId,
      );
      console.log(
        'Context.updateRecipeIngredient -> found ID:',
        recipeIngredientId,
      );

      if (recipeIngredientId >= 0) {
        await updateRecipeIngredientDb({
          id: recipeIngredientId,
          ...newRecipeIngredient,
        });
        console.log('Updated RecipeIngredient in SQLite:', newRecipeIngredient);
      } else {
        console.error(
          'No matching RecipeIngredient found for:',
          newRecipeIngredient,
        );
        Alert.alert(
          'Error',
          'Could not locate the ingredient in recipe for update.',
        );
      }
    } catch (error) {
      console.error('updateRecipeIngredient -> Exception:', error);
      Alert.alert(
        'Error',
        'Unexpected error while updating recipe ingredient.',
      );
    }
  };

  /**
   * Fetches all ingredients (with quantity & type) belonging to a given recipe.
   * Returns an empty array if none found. Alerts/logs on DB errors.
   */
  const getIngredientsOfRecipe = async (
    recipeId: number,
  ): Promise<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  > => {
    const result: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    > = [];

    if (recipeId < 0) {
      console.error('getIngredientsOfRecipe -> invalid recipeId:', recipeId);
      return result;
    }

    try {
      const rows = await getIngredientsFromRecipeId(recipeId);
      if (rows.length === 0) {
        // No ingredients for this recipe; return empty
        return result;
      }

      for (const ri of rows) {
        const idx = ingredients.findIndex(i => i.id === ri.ingredientId);
        if (idx === -1) {
          console.warn(`Ingredient ${ri.ingredientId} not in context list`);
          continue;
        }
        const ing = ingredients[idx];
        result.push({
          ...ing,
          quantity: ri.quantity,
          quantityType: ri.quantityType,
        });
      }
      return result;
    } catch (error) {
      console.error('getIngredientsOfRecipe -> DB Exception:', error);
      Alert.alert('Error', 'Could not load ingredients for recipe.');
      return result;
    }
  };

  /**
   * Deletes a RecipeIngredient by looking up its internal ID first,
   * then calling SQLite delete. Returns true/false.
   */
  const deleteRecipeIngredient = async (
    ingredientId: number,
    recipeId: number,
  ): Promise<boolean> => {
    try {
      const recipeIngredientId = await getIdFromRecipeIdAndIngredientId(
        recipeId,
        ingredientId,
      );

      if (recipeIngredientId < 0) {
        console.warn(
          'deleteRecipeIngredient -> no matching ID for',
          recipeId,
          ingredientId,
        );
        return false;
      }

      const deleted = await deleteRecipeIngredientDb(recipeIngredientId);
      if (!deleted) {
        console.error(
          'deleteRecipeIngredientDb returned false for ID:',
          recipeIngredientId,
        );
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

  return (
    <AppContext.Provider
      value={{
        ingredients,
        setIngredients,
        addOrUpdateIngredient,
        recipes,
        setRecipes,
        addOrUpdateRecipe,
        addRecipeIngredient,
        getIngredientsOfRecipe,
        updateRecipeIngredient,
        deleteRecipeIngredient,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
