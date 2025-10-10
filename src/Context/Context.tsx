import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {
  DaysOfWeek,
  ErrorResponseCodes,
  GroceryBought,
  Ingredient,
  IngredientPantry,
  IngredientWithoutId,
  MealType,
  QuantityType,
  Recipe,
  RecipeIngredientWithoutId,
  WeeklyMeal,
} from '../Types/Types';
import {
  getAllRecipesDb,
  getRecipeByIdDb,
  updateRecipe,
} from '../Services/recipe-db-services';
import {
  addRecipeIngredientDb,
  addRecipeIngredientMultipleDb,
  deleteRecipeIngredientDb,
  getIdFromRecipeIdAndIngredientId,
  getIngredientsFromRecipeIdDb,
  updateRecipeIngredientDb,
} from '../Services/recipeIngredients-db-services';
import {addIngredientDb} from '../Services/ingredient-db-services';
import {showToast, verifyRecipeIngredientWithoutId} from '../Utils/utils';
import {
  AddWeeklyMealInput,
  deleteWeeklyMealDb,
  getWeeklyMealsByDayAndMealTypeDb,
} from '../Services/weeklyMeals-db-services';
import {getAllIngredientPantriesDb} from '../Services/ingredientPantry-db-services';
import {
  addGroceryBoughtDb,
  getAllGroceryBoughtDb,
  removeGroceryBoughtDb,
} from '../Services/groceryBought-db-services';
import {addWeeklyMealDb} from '../Services/weeklyMeals-db-services'; // Import addWeeklyMealDb

// Define the shape of the entire context, including methods and state values.
type ContextProps = {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;

  /**
   * Adds a new ingredient to SQLite (or updates if it already exists)
   * @param newIngredient - The ingredient object (id:-1 if new)
   * @returns Promise<string> - the new or updated ingredient ID, or -1 on failure
   */
  addOrUpdateIngredient: (ingredient: Ingredient) => Promise<string>;

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
   * @returns Promise<string> - new row ID on success, or -1 on failure
   */
  addRecipeIngredient: (
    newRecIng: RecipeIngredientWithoutId,
  ) => Promise<string>;

  /**
   * Inserts a new ingredient into the database.
   * Unlike `addOrUpdateIngredient`, this function always creates a new entry without checking if it exists in context.
   * @param ingredient - The new ingredient object without an ID
   * @returns Promise containing an object with { created, insertedId?, response? }
   */
  addIngredient: (
    ingredient: IngredientWithoutId,
  ) => Promise<{created: boolean; response?: string; insertedId?: string}>;

  /**
   * Fetches all ingredients (with quantity & type) for a given recipe.
   * @param recipeId - ID of the recipe to fetch ingredients for
   * @returns Promise of an array of Ingredient plus { quantity, quantityType }
   */
  getIngredientsOfRecipe: (
    recipeId: string,
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
    ingredientId: string,
    recipeId: string,
  ) => Promise<boolean>;

  /**
   * Adds multiple RecipeIngredient entries for a given recipe.
   * @param recipeId - The ID of the recipe to which ingredients will be added
   * @param ingredients - Array of ingredients with quantity and quantityType to be linked to the recipe
   * @returns Promise with creation status, insertedId (optional), and responseCode (optional)
   */
  addRecipeIngredientMultiple: (
    recipeId: string,
    ingredients: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    >,
  ) => Promise<{
    created: boolean;
    insertedId?: string;
    responseCode?: ErrorResponseCodes;
  }>;

  /**
   * Function that gets all the recipes.
   * @returns an array of all the recipes
   */
  getAllRecipes: (userId: string) => Promise<Recipe[]>;

  /**
   * Fetches a recipe from the Recipe table by its ID.
   *
   * This function retrieves a single recipe from the `Recipe` table based on the provided recipe ID.
   *
   * @async
   * @function getRecipeById
   * @param {string} id - The ID of the recipe to be fetched.
   * @returns {Promise<Recipe | null>} A promise that resolves to a `Recipe` object if found, or `null` if no recipe is found.
   */
  getRecipeById: (id: string) => Promise<Recipe | null>;

  /**
   * Deletes an entry from the WeeklyMeals table by its ID
   * This function removes a row from the WeeklyMeals table based on the provided ID.
   */
  deleteWeeklyMeal: (id: string) => Promise<boolean>;

  /**
   * Retrieves the WeeklyMeals for a specific DayOfWeek and MealType combination.
   */
  getWeeklyMealsByDayAndMealType: (
    dayOfWeek: DaysOfWeek,
    mealType: MealType,
  ) => Promise<WeeklyMeal[]>;

  /**
   * Function that returns all the IngredientPantries available
   *
   * @returns {Promise<ingredientPantry[]>} an array of all the IngredientPantry objects.
   */ getAllIngredientPantries: () => Promise<IngredientPantry[]>;

  /**
   * Returns an array of all ingredientIds currently marked bought.
   */
  getAllGroceryBought: () => Promise<GroceryBought[]>;

  /**
   * Marks an ingredient as bought. If already marked, replaces timestamp.
   * @param ingredientId
   */
  addGroceryBought: (ingredientId: string) => Promise<GroceryBought>;

  /**
   * Unmarks an ingredient (removes its bought‐flag).
   * @param ingredientId
   */
  removeGroceryBought: (ingredientId: string) => Promise<void>;

  /**
   * Adds a new weekly meal to the database.
   */
  addWeeklyMeal: (input: AddWeeklyMealInput) => Promise<string>;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the actual context with default values (no-ops).
const AppContext = React.createContext<ContextProps>({
  userId: '',
  setUserId: () => {},
  ingredients: [],
  setIngredients: () => Promise.resolve(),
  addOrUpdateIngredient: async () => '-1',

  recipes: [],
  setRecipes: () => {},
  addOrUpdateRecipe: async () => {},

  addRecipeIngredient: async () => '-1',
  getIngredientsOfRecipe: async () => [],
  updateRecipeIngredient: async () => {},
  deleteRecipeIngredient: async () => false,
  addRecipeIngredientMultiple: async () => ({
    created: false,
  }),
  addIngredient: async () => ({created: false}),
  getAllRecipes: async () => [],
  getRecipeById: async () => null,
  deleteWeeklyMeal: async () => false,
  getWeeklyMealsByDayAndMealType: async () => [],
  getAllIngredientPantries: async () => [],
  getAllGroceryBought: async () => [],
  addGroceryBought: async () => ({id: '', ingredientId: '', timestamp: 0}),
  removeGroceryBought: async () => {},
  addWeeklyMeal: async () => '', // Add default implementation
});

// The provider component wraps the app and supplies state + methods.
export const AppProvider = ({children}: AppProviderProps) => {
  // Local state for the list of ingredients (in memory)
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Local state for the list of recipes (in memory)
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [userId, setUserId] = useState<string>('');

  /**
   * Adds a new ingredient or updates existing one:
   * 1. If id already exists in context, simply update that entry.
   * 2. Otherwise, insert into SQLite and then append to context state.
   * Returns the real (database) ID on success, or -1 if something fails.
   */
  const addOrUpdateIngredient = async (
    newIngredient: Ingredient,
  ): Promise<string> => {
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

    return ''; // Indicate failure
  };

  /**
   * Inserts a new ingredient into the database.
   * Unlike `addOrUpdateIngredient`, this function always creates a new entry without checking if it exists in context.
   * @param ingredient - The new ingredient object without an ID
   * @returns Promise containing an object with { created, insertedId?, response? }
   */
  const addIngredient = async (
    ingredient: IngredientWithoutId,
  ): Promise<{created: boolean; response?: string; insertedId?: string}> => {
    const response = await addIngredientDb(ingredient);
    showToast("Ingredient '" + ingredient.name + "' added.");
    return response;
  };

  /**
   * Gets all the Recipes
   */
  const getAllRecipes = async (userId: string) => {
    const result: Recipe[] = await getAllRecipesDb(userId);
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
            return updated;
          } else {
            // Append new
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
  ): Promise<string> => {
    // Validate the newRecIng object (checks recipeId, ingredientId, etc.)
    const isValid = verifyRecipeIngredientWithoutId(newRecIng);

    if (!isValid) {
      Alert.alert('Validation error', 'Invalid recipe‐ingredient data.');
      return '';
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

    return ''; // On any failure
  };

  /**
   * Adds multiple RecipeIngredient entries for a given recipe.
   * @param recipeId - The ID of the recipe to which ingredients will be added
   * @param ingredients - Array of ingredients with quantity and quantityType to be linked to the recipe
   * @returns Promise with creation status, insertedId (optional), and responseCode (optional)
   */
  const addRecipeIngredientMultiple = async (
    recipeId: string,
    ingredients: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    >,
  ) => {
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

      if (recipeIngredientId && recipeIngredientId != '') {
        // Call the actual SQLite update function
        await updateRecipeIngredientDb({
          id: recipeIngredientId,
          ...newRecipeIngredient,
        });
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
    recipeId: string,
  ): Promise<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  > => {
    // Prepare return array
    const result: Array<
      Ingredient & {quantity: number; quantityType: QuantityType}
    > = [];

    // Guard: invalid recipeId
    if (!recipeId && recipeId != '') {
      console.error('getIngredientsOfRecipe -> invalid recipeId:', recipeId);
      return result;
    }

    try {
      // Fetch rows from SQLite: each row contains recipeId, ingredientId, quantity, quantityType
      const rows = await getIngredientsFromRecipeIdDb(recipeId);

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
    ingredientId: string,
    recipeId: string,
  ): Promise<boolean> => {
    try {
      // Find the row ID in RecipeIngredients
      const recipeIngredientId = await getIdFromRecipeIdAndIngredientId(
        recipeId,
        ingredientId,
      );

      if (recipeIngredientId != '' && recipeIngredientId) {
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

  /**
   * Fetches a recipe from the Recipe table by its ID.
   *
   * This function retrieves a single recipe from the `Recipe` table based on the provided recipe ID.
   *
   * @async
   * @function getRecipeById
   * @param {string} id - The ID of the recipe to be fetched.
   * @returns {Promise<Recipe | null>} A promise that resolves to a `Recipe` object if found, or `null` if no recipe is found.
   */
  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    return await getRecipeByIdDb(id);
  };

  /**
   * Retrieves the WeeklyMeals for a specific DayOfWeek and MealType combination.
   */
  const getWeeklyMealsByDayAndMealType = async (
    dayOfWeek: DaysOfWeek,
    mealType: MealType,
  ): Promise<WeeklyMeal[]> => {
    return getWeeklyMealsByDayAndMealTypeDb(dayOfWeek, mealType);
  };

  /**
   * Deletes an entry from the WeeklyMeals table by its ID.
   *
   * This function removes a row from the WeeklyMeals table based on the provided ID.
   *
   * @async
   * @function deleteWeeklyMeal
   * @param {string} id - The ID of the weekly meal entry to be deleted.
   * @returns {Promise<void>} Resolves when the weekly meal entry is deleted successfully.
   */
  const deleteWeeklyMeal = async (id: string): Promise<boolean> => {
    return deleteWeeklyMealDb(id);
  };

  /**
   * Function that returns all the IngredientPantries available
   *
   * @returns {Promise<ingredientPantry[]>} an array of all the IngredientPantry objects.
   */
  const getAllIngredientPantries = (): Promise<IngredientPantry[]> => {
    return getAllIngredientPantriesDb();
  };

  const getAllGroceryBought = async (): Promise<GroceryBought[]> => {
    return getAllGroceryBoughtDb();
  };

  const addGroceryBought = async (
    ingredientId: string,
  ): Promise<GroceryBought> => {
    return addGroceryBoughtDb({
      ingredientId: ingredientId,
      timestamp: Date.now(),
    });
  };

  const removeGroceryBought = async (ingredientId: string): Promise<void> => {
    return removeGroceryBoughtDb(ingredientId);
  };

  /**
   * Adds a new weekly meal to the database.
   */
  const addWeeklyMeal = async (input: AddWeeklyMealInput): Promise<string> => {
    const response: Promise<string> = addWeeklyMealDb(input);
    showToast('Meal added to ' + input.day + ', ' + input.mealType);
    return response;
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
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
        getRecipeById,
        getAllRecipes,
        deleteWeeklyMeal,
        getWeeklyMealsByDayAndMealType,
        getAllIngredientPantries,
        getAllGroceryBought,
        addGroceryBought,
        removeGroceryBought,
        addWeeklyMeal, // Add addWeeklyMeal to the context value
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
