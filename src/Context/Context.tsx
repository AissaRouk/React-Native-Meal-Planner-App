import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {
  ErrorResponseCodes,
  Ingredient,
  IngredientWithoutId,
  QuantityType,
  Recipe,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {getAllRecipesDb, updateRecipe} from '../Services/recipe-db-services';
import {
  addRecipeIngredientDb,
  addRecipeIngredientMultipleDb,
  deleteRecipeIngredientDb,
  getIdFromRecipeIdAndIngredientId,
  getIngredientsFromRecipeId,
  updateRecipeIngredientDb,
} from '../Services/recipeIngredients-db-services';
import {addIngredientDb} from '../Services/ingredient-db-services';
import {verifyRecipeIngredientWithoutId} from '../Utils/utils';

// Define the shape of the entire context, including methods and state values.
type ContextProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;

  /**
   * Adds a new ingredient to SQLite (or updates if it already exists)
   * @param newIngredient - The ingredient object (id:-1 if new)
   * @returns Promise<number> - the new or updated ingredient ID, or -1 on failure
   */
  addOrUpdateIngredient: (ingredient: Ingredient) => Promise<number>;

  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;

  /**
   * Adds or updates a recipe in SQLite and in context state.
   * @param newRecipe - The recipe to insert/update
   */
  addOrUpdateRecipe: (recipe: Recipe) => Promise<void>;

  /**
   * Adds a new RecipeIngredient record linking an ingredient to a recipe.
   * @param newRecIng - Object containing recipeId, ingredientId, quantity, quantityType
   * @returns Promise<number> - new row ID on success, or -1 on failure
   */
  addRecipeIngredient: (
    newRecIng: RecipeIngredientWithoutId,
  ) => Promise<number>;

  /**
   * Inserts a new ingredient into the database.
   * Unlike `addOrUpdateIngredient`, this function always creates a new entry without checking if it exists in context.
   * @param ingredient - The new ingredient object without an ID
   * @returns Promise containing an object with { created, insertedId?, response? }
   */
  addIngredient: (
    ingredient: IngredientWithoutId,
  ) => Promise<{created: boolean; response?: string; insertedId?: number}>;

  /**
   * Fetches all ingredients (with quantity & type) for a given recipe.
   * @param recipeId - ID of the recipe to fetch ingredients for
   * @returns Promise of an array of Ingredient plus { quantity, quantityType }
   */
  getIngredientsOfRecipe: (
    recipeId: number,
  ) => Promise<(Ingredient & {quantity: number; quantityType: QuantityType})[]>;

  /**
   * Updates an existing RecipeIngredient entry in the database.
   * @param newRecipeIngredient - Object with recipeId, ingredientId, quantity, quantityType
   */
  updateRecipeIngredient: (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => Promise<void>;

  /**
   * Deletes a RecipeIngredient by looking up its internal row ID via recipeId and ingredientId.
   * @param ingredientId - ID of the ingredient to remove
   * @param recipeId     - ID of the recipe containing that ingredient
   * @returns Promise<boolean> - true if deletion succeeded, false otherwise
   */
  deleteRecipeIngredient: (
    ingredientId: number,
    recipeId: number,
  ) => Promise<boolean>;

  /**
   * Adds multiple RecipeIngredient entries for a given recipe.
   * @param recipeId - The ID of the recipe to which ingredients will be added
   * @param ingredients - Array of ingredients with quantity and quantityType to be linked to the recipe
   * @returns Promise with creation status, insertedId (optional), and responseCode (optional)
   */
  addRecipeIngredientMultiple: (
    recipeId: number,
    ingredients: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    >,
  ) => Promise<{
    created: boolean;
    insertedId?: number;
    responseCode?: ErrorResponseCodes;
  }>;

  /**
   * Function that gets all the recipes.
   * @returns an array of all the recipes
   */
  getAllRecipes: () => Promise<Recipe[]>;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the actual context with default values (no-ops).
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
  addRecipeIngredientMultiple: async () => ({
    created: false,
  }),
  addIngredient: async () => ({created: false}),
  getAllRecipes: async () => [],
});

// The provider component wraps the app and supplies state + methods.
export const AppProvider = ({children}: AppProviderProps) => {
  // Local state for the list of ingredients (in memory)
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Local state for the list of recipes (in memory)
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Log whenever the recipes array changes, for debugging
  useEffect(() => {
    console.log('Context -> recipes:', JSON.stringify(recipes));
  }, [recipes]);

  /**
   * Adds a new ingredient or updates existing one:
   * 1. If id already exists in context, simply update that entry.
   * 2. Otherwise, insert into SQLite and then append to context state.
   * Returns the real (database) ID on success, or -1 if something fails.
   */
  const addOrUpdateIngredient = async (
    newIngredient: Ingredient,
  ): Promise<number> => {
    // Check if this ingredient already exists in our in-memory list by ID
    const existingIndex = ingredients.findIndex(i => i.id === newIngredient.id);

    try {
      if (existingIndex >= 0) {
        // --- UPDATE PATH ---
        // Replace the object at existingIndex with the new data
        const updatedList = [...ingredients];
        updatedList[existingIndex] = newIngredient;
        setIngredients(updatedList);
        return newIngredient.id; // Return the unchanged ID
      } else {
        // --- ADD PATH ---
        // Insert into SQLite database first
        const response = await addIngredientDb(newIngredient);

        if (response.created && response.insertedId != null) {
          const realId = response.insertedId;

          // Build a new Ingredient object with the actual ID returned
          const insertedIngredient: Ingredient = {
            id: realId,
            name: newIngredient.name,
            category: newIngredient.category,
          };

          // Append that new object to our in-memory list
          setIngredients(prev => [...prev, insertedIngredient]);
          return realId; // Return the new ID
        } else {
          // Insert failed: log error and show an alert
          console.error('Failed to insert ingredient:', response);
          Alert.alert('Error', 'Could not add ingredient. Please try again.');
        }
      }
    } catch (error) {
      // Unexpected exception: log and alert
      console.error('addOrUpdateIngredient -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while adding ingredient.');
    }

    return -1; // Indicate failure
  };

  /**
   * Inserts a new ingredient into the database.
   * Unlike `addOrUpdateIngredient`, this function always creates a new entry without checking if it exists in context.
   * @param ingredient - The new ingredient object without an ID
   * @returns Promise containing an object with { created, insertedId?, response? }
   */
  const addIngredient = async (
    ingredient: IngredientWithoutId,
  ): Promise<{created: boolean; response?: string; insertedId?: number}> => {
    const response = await addIngredientDb(ingredient);
    return response;
  };

  /**
   * Gets all the Recipes
   */
  const getAllRecipes = async () => {
    const result: Recipe[] = await getAllRecipesDb();
    return result;
  };

  /**
   * Adds or updates a recipe:
   * 1. Calls SQLite updateRecipe(newRecipe).
   * 2. If success, update in-memory list: replace if ID exists, otherwise append.
   * 3. If SQLite returns false, log and alert the user.
   */
  const addOrUpdateRecipe = async (newRecipe: Recipe) => {
    try {
      const response = await updateRecipe(newRecipe);
      if (response) {
        // Update our in-memory recipes array
        setRecipes(prev => {
          const index = prev.findIndex(r => r.id === newRecipe.id);
          if (index !== -1) {
            // Replace existing
            const updated = [...prev];
            updated[index] = newRecipe;
            console.log('Updated recipe in context:', newRecipe);
            return updated;
          } else {
            // Append new
            console.log('Added new recipe in context:', newRecipe);
            return [...prev, newRecipe];
          }
        });
      } else {
        // SQLite update returned false => failure
        console.error('SQLite updateRecipe returned false for', newRecipe);
        Alert.alert('Error', `Could not save recipe "${newRecipe.name}".`);
      }
    } catch (error) {
      // Unexpected exception
      console.error('addOrUpdateRecipe -> Exception:', error);
      Alert.alert('Error', 'Unexpected error while saving recipe.');
    }
  };

  /**
   * Adds a RecipeIngredient row to SQLite via addRecipeIngredientDb.
   * First validates the object, then inserts.
   * Returns the new row ID on success, or -1 on validation or insertion failure.
   */
  const addRecipeIngredient = async (
    newRecIng: RecipeIngredientWithoutId,
  ): Promise<number> => {
    // Validate the newRecIng object (checks recipeId, ingredientId, etc.)
    const isValid = verifyRecipeIngredientWithoutId(newRecIng);
    console.log('Context.addRecipeIngredient -> verify result:', isValid);

    if (!isValid) {
      Alert.alert('Validation error', 'Invalid recipe‐ingredient data.');
      return -1;
    }

    try {
      // Try inserting into SQLite
      const result = await addRecipeIngredientDb(newRecIng);
      if (result.created && result.insertedId != null) {
        return result.insertedId;
      } else {
        // Insert succeeded but rowsAffected was 0 (UNIQUE constraint triggered)
        console.error('addRecipeIngredientDb did not create row:', result);
        Alert.alert('Error', 'Could not add ingredient to recipe.');
      }
    } catch (error) {
      // Unexpected exception
      console.error('addRecipeIngredient -> Exception:', error);
      Alert.alert(
        'Error',
        'Unexpected error while adding ingredient to recipe.',
      );
    }

    return -1; // On any failure
  };

  /**
   * Adds multiple RecipeIngredient entries for a given recipe.
   * @param recipeId - The ID of the recipe to which ingredients will be added
   * @param ingredients - Array of ingredients with quantity and quantityType to be linked to the recipe
   * @returns Promise with creation status, insertedId (optional), and responseCode (optional)
   */
  const addRecipeIngredientMultiple = async (
    recipeId: number,
    ingredients: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    >,
  ) => {
    const response = await addRecipeIngredientMultipleDb(recipeId, ingredients);
    return response;
  };

  /**
   * Updates an existing RecipeIngredient row:
   * 1. Finds the internal primary key by calling getIdFromRecipeId.
   * 2. Calls SQLite update with updateRecipeIngredientDb.
   * 3. Alerts/logs if no matching row found or exception occurs.
   */
  const updateRecipeIngredient = async (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => {
    try {
      // Look up the RecipeIngredient row ID from recipeId alone
      const recipeIngredientId = await getIdFromRecipeIdAndIngredientId(
        newRecipeIngredient.recipeId,
        newRecipeIngredient.ingredientId,
      );
      console.log(
        'Context.updateRecipeIngredient -> found ID:',
        recipeIngredientId,
      );

      if (recipeIngredientId >= 0) {
        // Call the actual SQLite update function
        await updateRecipeIngredientDb({
          id: recipeIngredientId,
          ...newRecipeIngredient,
        });
        console.log('Updated RecipeIngredient in SQLite:', newRecipeIngredient);
      } else {
        // No matching row found
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
      // Unexpected exception
      console.error('updateRecipeIngredient -> Exception:', error);
      Alert.alert(
        'Error',
        'Unexpected error while updating recipe ingredient.',
      );
    }
  };

  /**
   * Fetches all RecipeIngredient rows for a specific recipe,
   * then maps each row to an Ingredient object plus { quantity, quantityType }.
   * Returns an empty array if no rows found or on DB error.
   */
  const getIngredientsOfRecipe = async (
    recipeId: number,
  ): Promise<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  > => {
    // Prepare return array
    const result: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    > = [];

    // Guard: invalid recipeId
    if (recipeId < 0) {
      console.error('getIngredientsOfRecipe -> invalid recipeId:', recipeId);
      return result;
    }

    try {
      // Fetch rows from SQLite: each row contains recipeId, ingredientId, quantity, quantityType
      const rows = await getIngredientsFromRecipeId(recipeId);

      if (rows.length === 0) {
        // No rows found => return empty
        return result;
      }

      // Map each row to an in-memory Ingredient object plus its quantity & type
      for (const ri of rows) {
        // Find the corresponding Ingredient in context by ID
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
      // Unexpected exception while fetching from DB
      console.error('getIngredientsOfRecipe -> DB Exception:', error);
      Alert.alert('Error', 'Could not load ingredients for recipe.');
      return result;
    }
  };

  /**
   * Deletes a RecipeIngredient row by looking up its internal ID via recipeId & ingredientId,
   * then calling the SQLite delete function. Returns true if deletion succeeded.
   */
  const deleteRecipeIngredient = async (
    ingredientId: number,
    recipeId: number,
  ): Promise<boolean> => {
    try {
      // Find the row ID in RecipeIngredients
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

      // Call SQLite delete
      const deleted = await deleteRecipeIngredientDb(recipeIngredientId);
      if (!deleted) {
        // If rowsAffected was 0
        console.error(
          'deleteRecipeIngredientDb returned false for ID:',
          recipeIngredientId,
        );
        Alert.alert('Error', 'Could not remove ingredient from recipe.');
      }
      return deleted;
    } catch (error) {
      // Unexpected exception
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
        addIngredient,
        recipes,
        setRecipes,
        addOrUpdateRecipe,
        addRecipeIngredient,
        addRecipeIngredientMultiple,
        getIngredientsOfRecipe,
        updateRecipeIngredient,
        deleteRecipeIngredient,
        getAllRecipes,
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
