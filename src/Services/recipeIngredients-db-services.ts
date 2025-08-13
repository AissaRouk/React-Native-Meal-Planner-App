import {TABLE_RECIPE_INGREDIENTS} from './db-services';
import {SUCCESS, FAILED} from './db-services';
import {
  ErrorResponseCodes,
  Ingredient,
  QuantityType,
  RecipeIngredient,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  where,
} from '@react-native-firebase/firestore';

// Fields for the RecipeIngredients table
export const RECIPE_INGREDIENTS_ID = 'id';
export const RECIPE_INGREDIENTS_RECIPE_ID = 'recipeId';
export const RECIPE_INGREDIENTS_INGREDIENT_ID = 'ingredientId';
export const RECIPE_INGREDIENTS_QUANTITY = 'quantity';
export const RECIPE_INGREDIENTS_QUANTITY_TYPE = 'quantityType';

const firestoreDb = getFirestore();
const recipeIngredientCollection = collection(
  firestoreDb,
  TABLE_RECIPE_INGREDIENTS,
);

/**
 * Adds a new ingredient to a recipe in the database.
 *
 * This function inserts a record linking an ingredient to a recipe along with the specified quantity and quantity type.
 * If the ingredient already exists for the recipe, the `INSERT OR IGNORE` ensures no duplicate entries.
 *
 * @async
 * @function addRecipeIngredient
 * @param {RecipeIngredientWithoutId} recipeIngredient - recipeIngredient without the id param
 * @returns {Promise<void>} Resolves when the ingredient is added successfully.
 * @throws {Error} Throws an error if the insertion fails.
 *
 * @example
 * addRecipeIngredient(recipe, ingredient, 100, 'grams')
 *   .then(() => console.log('Ingredient added successfully'))
 *   .catch(error => console.error('Error adding ingredient:', error));
 */
export const addRecipeIngredientDb = async (
  recipeIngredient: RecipeIngredientWithoutId,
): Promise<{
  created: boolean;
  insertedId?: string;
  responseCode?: ErrorResponseCodes;
}> => {
  try {
    // Firebase Implementation
    const addRef = await addDoc(recipeIngredientCollection, recipeIngredient);
    console.log(
      `addRecipeIngredient -> Firestore document added with ID: ${addRef.id}`,
    );
    return {
      created: SUCCESS,
      insertedId: addRef.id,
      responseCode: ErrorResponseCodes.SUCCESS,
    };

    // return result;
  } catch (error) {
    console.error('addRecipeIngredient -> Transaction failed:', error);
    throw new Error(`Failed to add ingredient to recipe: ${error}`);
  }
};

/**
 * Adds multiple ingredients to a recipe in the database.
 *
 * Iterates over the provided array of ingredients and attempts to add each one to the specified recipe.
 * If any ingredient fails to be added, the process stops and returns a failure response.
 *
 * @param recipeId - The unique identifier of the recipe to which ingredients will be added.
 * @param ingredients - An array of ingredient objects, each containing the ingredient details, quantity, and quantity type.
 * @returns A promise that resolves to an object indicating whether all ingredients were successfully added,
 *          and optionally includes an inserted ID or error response code.
 *
 * @example
 * const result = await addRecipeIngredientMultiple(1, [
 *   { id: 2, name: 'Salt', quantity: 1, quantityType: 'tsp' },
 *   { id: 3, name: 'Pepper', quantity: 0.5, quantityType: 'tsp' }
 * ]);
 * if (result.created) {
 *   // All ingredients added successfully
 * }
 */
export const addRecipeIngredientMultipleDb = async (
  recipeId: string,
  ingredients: Array<
    Ingredient & {quantity: number; quantityType: QuantityType}
  >,
): Promise<{
  created: boolean;
  insertedId?: string;
  responseCode?: ErrorResponseCodes;
}> => {
  try {
    for (const ingredient of ingredients) {
      const response = await addRecipeIngredientDb({
        recipeId: recipeId,
        ingredientId: ingredient.id,
        quantity: ingredient.quantity,
        quantityType: ingredient.quantityType,
      });
      if (response.created === FAILED) {
        console.log(
          `addRecipeIngredientMultiple -> Ingredient ${ingredient.name} not added for Recipe ID: ${recipeId}`,
        );
        return {created: FAILED};
      }
    }
    return {created: SUCCESS};
  } catch (error) {
    console.error('addRecipeIngredientMultiple -> Error:', error);
    return {created: FAILED};
  }
};

/**
 * Function that gets the RecipeIngredient ID from both recipeId and ingredientId
 * @param {number} recipeId - The ID of the recipe
 * @param {number} ingredientId - The ID of the ingredient
 * @returns {Promise<number | string>} - Returns the Firestore document ID of the matching RecipeIngredient, or -1 if not found
 */
export const getIdFromRecipeIdAndIngredientId = async (
  recipeId: string,
  ingredientId: string,
): Promise<string> => {
  try {
    const q = query(
      recipeIngredientCollection,
      where('recipeId', '==', recipeId),
      where('ingredientId', '==', ingredientId),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first matching document's ID
      return querySnapshot.docs[0].id;
    }
    return '';
  } catch (error) {
    throw new Error(
      'Error while getting the RecipeIngredient by recipeId and ingredientId: ' +
        error,
    );
  }
};

/**
 * Fetches all the RecipeIngredients from the database.
 *
 * @async
 * @function getRecipeIngredients
 * @returns {Promise<RecipeIngredient[]>} Resolves with an array of RecipeIngredient objects.
 */
export const getAllRecipeIngredients = async (): Promise<
  RecipeIngredient[]
> => {
  try {
    const recipeIngredients: RecipeIngredient[] = [];
    // Firebase Implementation
    const recipeIngredientsQuery = query(recipeIngredientCollection);
    const querySnapshot = await getDocs(recipeIngredientsQuery);
    querySnapshot.forEach(
      (doc: {data: () => RecipeIngredientWithoutId; id: any}) => {
        const data = doc.data() as RecipeIngredientWithoutId;
        const recipeIngredient: RecipeIngredient = {
          id: doc.id, // Use Firestore document ID as the ingredient ID
          recipeId: data.recipeId, // Ensure the recipeId is present
          ingredientId: data.ingredientId, // Ensure the ingredientId is present
          quantity: data.quantity, // Ensure the quantity is present
          quantityType: data.quantityType || QuantityType.UNIT, // Default to UNIT if quantity
        };
        recipeIngredients.push(recipeIngredient);
      },
    );
    console.log(
      'getrecipeIngredients Firebase -> recipeIngredients fetched successfully:',
      recipeIngredients,
    );

    return recipeIngredients;
  } catch (error) {
    console.error('getRecipeIngredients -> Transaction failed:', error);
    throw new Error(`getRecipeIngredients: ${error}`);
  }
};

/**
 * Function to get all the ingredients of a specific recipe
 * @param recipeId the id of the recipe
 * @returns an array with all the RecipeIngredients, each one contains the ingredient of a Recipe
 */
export const getIngredientsFromRecipeIdDb = async (
  recipeId: string,
): Promise<RecipeIngredient[]> => {
  try {
    const result: RecipeIngredient[] = [];

    if (!recipeId || recipeId == '') {
      throw new Error("The recipeId's value is incorrect");
    }

    const q = query(
      recipeIngredientCollection,
      where('recipeId', '==', recipeId),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc: {data: () => RecipeIngredient; id: any}) => {
      const data = doc.data() as RecipeIngredient;
      const rcpIngredient: RecipeIngredient = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        recipeId: data.recipeId, // Ensure the recipeId is present
        ingredientId: data.ingredientId, // Ensure the ingredientId is present
        quantity: data.quantity, // Ensure the quantity is present
        quantityType: data.quantityType || QuantityType.UNIT, // Default to UNIT if quantityType is not provided
      };
      result.push(rcpIngredient);
    });

    console.log(
      'getIngredientsFromRecipeId -> Ingredients fetched successfully:',
      result,
    );
    return result;
  } catch (error) {
    console.error('getIngredientsFromRecipeId -> Transaction failed:', error);
    throw new Error(`getIngredientsFromRecipeId: ${error}`);
  }
};

/**
 * Changes the data of the RecipeIngredient with the id submitted in the param
 *
 * @async
 * @function updateRecipeIngredient
 * @param {RecipeIngredient} recipeIngredient the RecipeIngredient with the data that will be updated and the same id
 * @returns {Promise<void>} Resolves with a void
 */
export const updateRecipeIngredientDb: (
  recipeIngredient: RecipeIngredient,
) => Promise<void> = async recipeIngredient => {
  try {
    await setDoc(
      doc(recipeIngredientCollection, recipeIngredient.id),
      recipeIngredient,
    );
    console.log('updateRecipeIngredient -> RecipeIngredient updated');
  } catch (error) {
    console.log('Error while updating RecipeIngredient: ' + error);
    throw new Error('Error while updating RecipeIngredient: ' + error);
  }
};

/**
 * Deletes a function given its id
 *
 * @async
 * @function updateRecipeIngredient
 * @param {number} id
 * @returns {Promise<void>} Resolves with a void
 */
export const deleteRecipeIngredientDb: (
  id: string,
) => Promise<boolean> = async id => {
  try {
    var deleted = false;

    // Firebase Implementation
    const recipeDoc = doc(recipeIngredientCollection, id.toString());
    await deleteDoc(recipeDoc);
    console.log(
      'deleteRecipeIngredient -> Firestore document deleted successfully.',
    );
    return deleted;
  } catch (error) {
    throw new Error(
      'deleteRecipeIngredient -> could not delete RecipeIngredient: ' + error,
    );
  }
};
