import {Ingredient, IngredientWithoutId} from '../Types/Types';
import {TABLE_INGREDIENT} from './db-services';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  where,
} from '@react-native-firebase/firestore';

const firestoreDb = getFirestore();
const ingredientCollection = collection(firestoreDb, 'Ingredient');

//Ingredient CRUD functions

/**
 * Function that adds an ingredient row to the table, checking for duplicate by ID.
 *
 * @param {IngredientWithoutId} ingredient the ingredient object but without id
 * @returns {Promise<{created: boolean; response?: string; insertedId?: string}>} Result of the operation
 */
export const addIngredientDb = async (
  ingredient: IngredientWithoutId,
): Promise<{created: boolean; response?: string; insertedId?: string}> => {
  try {
    // Generate a new document reference with an auto-generated ID
    const docRef = doc(ingredientCollection);

    // Check if an ingredient with this ID already exists
    const ingredientSnapShot = await getDoc(docRef);
    if (ingredientSnapShot.exists()) {
      console.warn(
        `Ingredient with ID "${docRef.id}" already exists. Skipping.`,
      );
      return {
        created: false,
        response: `Ingredient with ID "${docRef.id}" already exists.`,
      };
    }

    // Add the ingredient with the generated ID as a prop
    await setDoc(docRef, {...ingredient, id: docRef.id});
    return {created: true, insertedId: docRef.id};
  } catch (error) {
    throw new Error(
      'addIngredientDb -> ingredient was not added: ' + JSON.stringify(error),
    );
  }
};

/**
 * Fetches all ingredients from the Ingredient table.
 *
 * This function retrieves all rows from the `Ingredient` table and returns them as an array of `Ingredient` objects.
 *
 * @async
 * @function getIngredients
 * @returns {Promise<Ingredient[]>} A promise that resolves to an array of ingredients or an empty array if an error occurs.
 *
 */
export const getAllIngredients: () => Promise<Ingredient[]> = async (): Promise<
  Ingredient[]
> => {
  try {
    const ingredients: Ingredient[] = [];
    // Firebase Implementation
    const ingredientsQuery = query(ingredientCollection);
    const querySnapshot = await getDocs(ingredientsQuery);
    querySnapshot.forEach((doc: {data: () => IngredientWithoutId; id: any}) => {
      const data = doc.data() as IngredientWithoutId;
      const ingredient: Ingredient = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        name: data.name, // Ensure the name is present
        category: data.category || '', // Default to empty string if category is not provided
      };
      ingredients.push(ingredient);
    });

    return ingredients;
  } catch (error) {
    console.error(
      'getIngredients -> Transaction error:',
      error instanceof Error ? error : JSON.stringify(error),
    );
    return [];
  }
};

/**
 * Deletes an ingredient from the Ingredient table by its ID.
 *
 * This function deletes an ingredient row in the `Ingredient` table, specified by its unique ID.
 *
 * @async
 * @function deleteIngredient
 * @param {number} id - The ID of the ingredient to be deleted.
 * @returns {Promise<void>} A promise that resolves when the ingredient has been successfully deleted or logs an error if the deletion fails.
 *
 */
export const deleteIngredient: (id: number | string) => Promise<void> = async (
  id: number | string,
) => {
  try {
    // Firebase Implementation
    const ingredientDoc = doc(ingredientCollection, id.toString());
    await deleteDoc(ingredientDoc);
  } catch (error) {
    console.error(
      'deleteIngredient -> Transaction error:',
      error instanceof Error ? error : JSON.stringify(error),
    );
    throw new Error(
      'Failed to delete ingredient: ' +
        (error instanceof Error ? error.message : JSON.stringify(error)),
    );
  }
};

/**
 * Updates a specific ingredient in the Ingredient table.
 *
 * @param ingredient - The ingredient object containing updated properties (`id`, `name`, and `category`).
 * @returns A promise that resolves when the ingredient update operation is complete.
 */
export const updateIngredient: (
  ingredient: Ingredient,
) => Promise<void> = async ingredient => {
  try {
    await setDoc(doc(ingredientCollection, ingredient.name), ingredient);
  } catch (error) {
    console.error('Error in updating the ingredient:', error);
  }
};

/**
 * Fetches an ingredient from the Ingredient table by the id.
 *
 * This function retrieves all rows from the `Ingredient` table and returns them as an array of `Ingredient` objects.
 *
 * @async
 * @function getIngredientById
 * @returns {Promise<Ingredient>} A promise that resolves to a ingredient.
 *
 */
export const getIngredientById: (id: string) => Promise<Ingredient> = async (
  id,
): Promise<Ingredient> => {
  let ingredient: Ingredient | null = null;

  const ingredientDocRef = doc(firestoreDb, TABLE_INGREDIENT, id);
  const ingredientSnapShot = await getDoc(ingredientDocRef);
  if (ingredientSnapShot.exists()) {
    const ingredientData = ingredientSnapShot.data() as Ingredient;
    ingredient = ingredientData;
  }

  if (!ingredient) {
    throw new Error(`Ingredient with ID ${id} not found.`);
  }

  return ingredient;
};
